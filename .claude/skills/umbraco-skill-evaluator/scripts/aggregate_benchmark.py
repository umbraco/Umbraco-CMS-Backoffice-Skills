#!/usr/bin/env python3
"""
Aggregate individual run results into benchmark summary statistics.

Reads grading.json files from run directories and produces:
- run_summary with mean, stddev, min, max for each metric
- delta between the primary configuration and its baseline

Usage:
    python aggregate_benchmark.py <iteration_dir> --skill-name <name>

Example:
    python -m scripts.aggregate_benchmark <workspace>/iteration-1 --skill-name pdf

Primary layout (what SKILL.md tells the agent to build):

    <iteration_dir>/
    └── <eval-name>/                 # descriptive, e.g. extract-tables
        ├── eval_metadata.json
        ├── with_skill/
        │   ├── outputs/
        │   └── grading.json         # sibling of outputs/
        └── without_skill/           # or old_skill/ when iterating
            ├── outputs/
            └── grading.json

`without_skill` is replaced by `old_skill` when iterating on an existing
skill. Discovery matches the viewer (generate_review.py): each config
directory holds grading.json directly, alongside outputs/.

Legacy layout (older runs that nested replicate runs under run-*/) is also
accepted — grading.json is then read from <config>/run-N/grading.json.
"""

import argparse
import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path


def calculate_stats(values: list[float]) -> dict:
    """Calculate mean, stddev, min, max for a list of values."""
    if not values:
        return {"mean": 0.0, "stddev": 0.0, "min": 0.0, "max": 0.0}

    n = len(values)
    mean = sum(values) / n

    if n > 1:
        variance = sum((x - mean) ** 2 for x in values) / (n - 1)
        stddev = math.sqrt(variance)
    else:
        stddev = 0.0

    return {
        "mean": round(mean, 4),
        "stddev": round(stddev, 4),
        "min": round(min(values), 4),
        "max": round(max(values), 4)
    }


# Directories under an iteration that are never eval directories.
NON_EVAL_DIRS = {"runs", "skill-snapshot", "__pycache__", ".git"}


def _load_grading(config_dir: Path) -> tuple[dict | None, int]:
    """
    Load grading.json for one configuration.

    Returns (grading, run_number). In the primary layout grading.json sits
    directly under the config dir (run_number 1). In the legacy layout it
    lives under run-N/, in which case the lowest-numbered run is used.
    """
    direct = config_dir / "grading.json"
    if direct.exists():
        try:
            return json.loads(direct.read_text()), 1
        except json.JSONDecodeError as e:
            print(f"Warning: Invalid JSON in {direct}: {e}")
            return None, 1
    for run_dir in sorted(config_dir.glob("run-*")):
        grading_file = run_dir / "grading.json"
        if not grading_file.exists():
            continue
        try:
            run_number = int(run_dir.name.split("-")[1])
        except (IndexError, ValueError):
            run_number = 1
        try:
            return json.loads(grading_file.read_text()), run_number
        except json.JSONDecodeError as e:
            print(f"Warning: Invalid JSON in {grading_file}: {e}")
            return None, run_number
    return None, 1


def _read_time_and_tokens(config_dir: Path, grading: dict) -> tuple[float, int]:
    """
    Resolve wall-clock time and token count for a run.

    Tokens live only in timing.json, so always read it for tokens. Time may
    already be copied into grading.json by the grader; timing.json is only a
    fallback for time.
    """
    time_seconds = grading.get("timing", {}).get("total_duration_seconds", 0.0)
    tokens = 0
    timing_files = [config_dir / "timing.json"] + sorted(config_dir.glob("run-*/timing.json"))
    for timing_file in timing_files:
        if not timing_file.exists():
            continue
        try:
            timing_data = json.loads(timing_file.read_text())
        except json.JSONDecodeError:
            continue
        tokens = timing_data.get("total_tokens", tokens)
        if time_seconds == 0.0:
            time_seconds = timing_data.get("total_duration_seconds", 0.0)
        break
    return time_seconds, tokens


def load_run_results(iteration_dir: Path) -> dict:
    """
    Load all run results from an iteration directory.

    Returns dict keyed by config name (e.g. "with_skill"/"without_skill",
    or "with_skill"/"old_skill"), each containing a list of run results.
    """
    eval_dirs = [
        p for p in sorted(iteration_dir.iterdir())
        if p.is_dir() and p.name not in NON_EVAL_DIRS
    ]
    if not eval_dirs:
        print(f"No eval directories found in {iteration_dir}")
        return {}

    results: dict[str, list] = {}

    for eval_dir in eval_dirs:
        eval_id = eval_dir.name
        eval_name = eval_dir.name
        metadata_path = eval_dir / "eval_metadata.json"
        if metadata_path.exists():
            try:
                metadata = json.loads(metadata_path.read_text())
                eval_id = metadata.get("eval_id", eval_id)
                eval_name = metadata.get("eval_name", eval_name)
            except (json.JSONDecodeError, OSError):
                pass

        for config_dir in sorted(p for p in eval_dir.iterdir() if p.is_dir()):
            grading, run_number = _load_grading(config_dir)
            if grading is None:
                continue

            time_seconds, tokens = _read_time_and_tokens(config_dir, grading)
            summary = grading.get("summary", {})

            # viewer requires expectation fields: text, passed, evidence
            raw_expectations = grading.get("expectations", [])
            for exp in raw_expectations:
                if "text" not in exp or "passed" not in exp:
                    print(f"Warning: expectation in {config_dir} missing required fields (text, passed, evidence): {exp}")

            results.setdefault(config_dir.name, []).append({
                "eval_id": eval_id,
                "eval_name": eval_name,
                "run_number": run_number,
                "pass_rate": summary.get("pass_rate", 0.0),
                "passed": summary.get("passed", 0),
                "failed": summary.get("failed", 0),
                "total": summary.get("total", 0),
                "time_seconds": time_seconds,
                "tokens": tokens,
                "expectations": raw_expectations,
            })

    return results


# The configuration the skill is meant to win on, and the baseline it's
# compared against. Delta is always primary - baseline, regardless of the
# order config directories happen to sort in.
PRIMARY_CONFIGS = ("with_skill", "new_skill")
BASELINE_CONFIGS = ("without_skill", "old_skill")


def order_configs(configs: list[str]) -> list[str]:
    """Return configs with the primary first and its baseline second."""
    primary = next((c for c in PRIMARY_CONFIGS if c in configs), None)
    baseline = next((c for c in BASELINE_CONFIGS if c in configs), None)
    ordered = [c for c in (primary, baseline) if c]
    ordered += [c for c in configs if c not in ordered]
    return ordered


def aggregate_results(results: dict) -> dict:
    """
    Aggregate run results into summary statistics.

    Returns run_summary with stats for each configuration and delta, ordered
    so the primary configuration comes first.
    """
    run_summary = {}
    configs = order_configs(list(results.keys()))

    for config in configs:
        runs = results.get(config, [])

        if not runs:
            run_summary[config] = {
                "pass_rate": {"mean": 0.0, "stddev": 0.0, "min": 0.0, "max": 0.0},
                "time_seconds": {"mean": 0.0, "stddev": 0.0, "min": 0.0, "max": 0.0},
                "tokens": {"mean": 0, "stddev": 0, "min": 0, "max": 0}
            }
            continue

        pass_rates = [r["pass_rate"] for r in runs]
        times = [r["time_seconds"] for r in runs]
        tokens = [r.get("tokens", 0) for r in runs]

        run_summary[config] = {
            "pass_rate": calculate_stats(pass_rates),
            "time_seconds": calculate_stats(times),
            "tokens": calculate_stats(tokens)
        }

    # Delta is primary - baseline (configs are already ordered primary-first).
    if len(configs) >= 2:
        primary = run_summary.get(configs[0], {})
        baseline = run_summary.get(configs[1], {})
    else:
        primary = run_summary.get(configs[0], {}) if configs else {}
        baseline = {}

    delta_pass_rate = primary.get("pass_rate", {}).get("mean", 0) - baseline.get("pass_rate", {}).get("mean", 0)
    delta_time = primary.get("time_seconds", {}).get("mean", 0) - baseline.get("time_seconds", {}).get("mean", 0)
    delta_tokens = primary.get("tokens", {}).get("mean", 0) - baseline.get("tokens", {}).get("mean", 0)

    run_summary["delta"] = {
        "pass_rate": f"{delta_pass_rate:+.2f}",
        "time_seconds": f"{delta_time:+.1f}",
        "tokens": f"{delta_tokens:+.0f}"
    }

    return run_summary


def generate_benchmark(benchmark_dir: Path, skill_name: str = "", skill_path: str = "") -> dict:
    """
    Generate complete benchmark.json from run results.
    """
    results = load_run_results(benchmark_dir)
    run_summary = aggregate_results(results)

    # Build runs array, primary configuration first so the viewer pairs runs.
    runs = []
    for config in order_configs(list(results.keys())):
        for result in results[config]:
            runs.append({
                "eval_id": result["eval_id"],
                "eval_name": result["eval_name"],
                "configuration": config,
                "run_number": result["run_number"],
                "result": {
                    "pass_rate": result["pass_rate"],
                    "passed": result["passed"],
                    "failed": result["failed"],
                    "total": result["total"],
                    "time_seconds": result["time_seconds"],
                    "tokens": result.get("tokens", 0)
                },
                "expectations": result["expectations"]
            })

    # Determine eval IDs from results (ids may be strings, so sort as strings)
    eval_ids = sorted({
        r["eval_id"]
        for config in results.values()
        for r in config
    }, key=str)

    # Derive runs-per-configuration from the data rather than assuming a count.
    runs_per_config = max((len(v) for v in results.values()), default=0)

    benchmark = {
        "metadata": {
            "skill_name": skill_name or "<skill-name>",
            "skill_path": skill_path or "<path/to/skill>",
            "executor_model": "<model-name>",
            "analyzer_model": "<model-name>",
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "evals_run": eval_ids,
            "runs_per_configuration": runs_per_config
        },
        "runs": runs,
        "run_summary": run_summary,
        "notes": []  # To be filled by analyzer
    }

    return benchmark


def generate_markdown(benchmark: dict) -> str:
    """Generate human-readable benchmark.md from benchmark data."""
    metadata = benchmark["metadata"]
    run_summary = benchmark["run_summary"]

    # Determine config names (excluding "delta")
    configs = [k for k in run_summary if k != "delta"]
    config_a = configs[0] if len(configs) >= 1 else "config_a"
    config_b = configs[1] if len(configs) >= 2 else "config_b"
    label_a = config_a.replace("_", " ").title()
    label_b = config_b.replace("_", " ").title()

    lines = [
        f"# Skill Benchmark: {metadata['skill_name']}",
        "",
        f"**Model**: {metadata['executor_model']}",
        f"**Date**: {metadata['timestamp']}",
        f"**Evals**: {', '.join(map(str, metadata['evals_run']))} ({metadata['runs_per_configuration']} runs each per configuration)",
        "",
        "## Summary",
        "",
        f"| Metric | {label_a} | {label_b} | Delta |",
        "|--------|------------|---------------|-------|",
    ]

    a_summary = run_summary.get(config_a, {})
    b_summary = run_summary.get(config_b, {})
    delta = run_summary.get("delta", {})

    # Format pass rate
    a_pr = a_summary.get("pass_rate", {})
    b_pr = b_summary.get("pass_rate", {})
    lines.append(f"| Pass Rate | {a_pr.get('mean', 0)*100:.0f}% ± {a_pr.get('stddev', 0)*100:.0f}% | {b_pr.get('mean', 0)*100:.0f}% ± {b_pr.get('stddev', 0)*100:.0f}% | {delta.get('pass_rate', '—')} |")

    # Format time
    a_time = a_summary.get("time_seconds", {})
    b_time = b_summary.get("time_seconds", {})
    lines.append(f"| Time | {a_time.get('mean', 0):.1f}s ± {a_time.get('stddev', 0):.1f}s | {b_time.get('mean', 0):.1f}s ± {b_time.get('stddev', 0):.1f}s | {delta.get('time_seconds', '—')}s |")

    # Format tokens
    a_tokens = a_summary.get("tokens", {})
    b_tokens = b_summary.get("tokens", {})
    lines.append(f"| Tokens | {a_tokens.get('mean', 0):.0f} ± {a_tokens.get('stddev', 0):.0f} | {b_tokens.get('mean', 0):.0f} ± {b_tokens.get('stddev', 0):.0f} | {delta.get('tokens', '—')} |")

    # Notes section
    if benchmark.get("notes"):
        lines.extend([
            "",
            "## Notes",
            ""
        ])
        for note in benchmark["notes"]:
            lines.append(f"- {note}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Aggregate benchmark run results into summary statistics"
    )
    parser.add_argument(
        "benchmark_dir",
        type=Path,
        help="Path to the benchmark directory"
    )
    parser.add_argument(
        "--skill-name",
        default="",
        help="Name of the skill being benchmarked"
    )
    parser.add_argument(
        "--skill-path",
        default="",
        help="Path to the skill being benchmarked"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        help="Output path for benchmark.json (default: <benchmark_dir>/benchmark.json)"
    )

    args = parser.parse_args()

    if not args.benchmark_dir.exists():
        print(f"Directory not found: {args.benchmark_dir}")
        sys.exit(1)

    # Generate benchmark
    benchmark = generate_benchmark(args.benchmark_dir, args.skill_name, args.skill_path)

    # Determine output paths
    output_json = args.output or (args.benchmark_dir / "benchmark.json")
    output_md = output_json.with_suffix(".md")

    # Write benchmark.json
    with open(output_json, "w") as f:
        json.dump(benchmark, f, indent=2)
    print(f"Generated: {output_json}")

    # Write benchmark.md
    markdown = generate_markdown(benchmark)
    with open(output_md, "w") as f:
        f.write(markdown)
    print(f"Generated: {output_md}")

    # Print summary
    run_summary = benchmark["run_summary"]
    configs = [k for k in run_summary if k != "delta"]
    delta = run_summary.get("delta", {})

    print(f"\nSummary:")
    for config in configs:
        pr = run_summary[config]["pass_rate"]["mean"]
        label = config.replace("_", " ").title()
        print(f"  {label}: {pr*100:.1f}% pass rate")
    print(f"  Delta:         {delta.get('pass_rate', '—')}")


if __name__ == "__main__":
    main()
