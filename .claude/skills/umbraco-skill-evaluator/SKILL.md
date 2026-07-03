---
name: umbraco-skill-evaluator
description: Run quantitative + qualitative evaluations on an existing Claude skill. Use this whenever the user wants to test, benchmark, eval, validate, regression-check, or measure the value of a skill they've already drafted — including phrases like "run evals on this skill", "is this skill actually helping", "compare with-skill vs without-skill", "iterate on my skill based on results". This is the lightweight cousin of skill-creator: it skips drafting, blind comparison, and description-tuning, and focuses purely on the eval loop with Haiku-powered grading.
---

# Skill Evaluator

A focused, low-cost skill for evaluating skills. Assumes the skill already exists — your job is to prove (or disprove) that it earns its keep, and feed the results back into the next iteration.

## Why this exists separately from skill-creator

`skill-creator` is a full authoring + evaluation pipeline. That's expensive in tokens when all you want to do is run evals. This skill keeps just the evaluation parts:

- with-skill vs. without-skill (or vs. previous version) parallel runs
- Haiku-powered grader subagents
- The HTML viewer for qualitative review
- `aggregate_benchmark.py` for quantitative summary
- The iteration loop

It deliberately drops: skill drafting guidance, blind comparator/analyzer agents, description optimization, and the full schema reference. If you actually need to *write* a new skill, hand off to `skill-creator`. If you want to optimize triggering, see "Description optimization (deferred)" at the bottom.

## The loop, at a glance

```
1. Confirm the skill + figure out the eval set (≤3 prompts to start)
2. Spawn with-skill and baseline runs in parallel (one turn)
3. While runs go: draft / refine assertions
4. As notifications arrive: capture timing.json
5. Grade each run with a Haiku subagent
6. Aggregate → benchmark.json → launch viewer
7. User reviews, leaves feedback, you read feedback.json
8. Improve the skill, rerun (iteration-2/, iteration-3/, ...)
9. After iteration 2 (or the final pass), mention description optimization
```

Working directory pattern: put results in `<skill-name>-workspace/` as a sibling to the skill directory. Inside, `iteration-1/`, `iteration-2/`, etc., and inside each, one directory per eval (use a descriptive name, e.g. `extract-tables/` not `eval-0/`).

---

## Step 1 — Confirm the skill and the eval set

Find the skill directory. Read its SKILL.md so you know what it claims to do. Check whether `evals/evals.json` already exists; if so, read it and ask the user whether to use those prompts as-is, modify them, or replace them.

### Writing eval prompts (this matters)

The single biggest mistake in skill evals is using prompts that are too easy. If a baseline run with no skill can solve the task in one tool call, the skill has nowhere to demonstrate value and the benchmark will look like noise.

**Every prompt must be a complex, multi-step task where the skill should earn its keep.** Specifically:

- The task should require **at least 3-4 distinct steps** that a naive agent might get wrong, skip, or do in the wrong order.
- It should involve **specialized knowledge or tooling the skill provides** — patterns, scripts, schemas, conventions — that an unequipped agent would have to invent or guess at.
- It should have **at least one trap** a baseline run is likely to fall into (a non-obvious format, an edge case, a constraint that's easy to overlook).
- It should be phrased like **a real user request**, including realistic context (file paths, names, partial information, casual phrasing). Not a sterile "do X to Y."

Bad prompt (too easy, baseline will pass): `"Summarize this PDF"`

Good prompt (multi-step, skill earns its keep):
```
I just got a 40-page contract from our vendor (it's at evals/files/vendor_contract.pdf).
Pull out every section that talks about liability or indemnification, group them by which
party they bind, and produce a markdown summary with direct quotes I can drop into our
risk register. The numbering in the contract is inconsistent — some sections use 4.1.a,
others use Roman numerals — so make sure you use the literal heading text, not just the
number.
```

If a candidate prompt could be answered correctly in a sentence or by a single search, **rewrite it or throw it out.**

### How many prompts

Start with **at most 3**. Three runs each side (with vs. without) at one iteration is six subagent runs — that's enough signal to drive an iteration without burning tokens. The user can request more later if a particular failure mode isn't being captured. When they do, expand by 1-2 at a time and prefer adding prompts that probe a specific weakness over piling on similar tasks.

Save prompts to `evals/evals.json` (schema in `references/schemas.md`). Don't write `expectations` yet — draft those while the runs are in flight (Step 3).

---

## Step 2 — Spawn all runs in the same turn

For every eval, spawn **two subagents in the same turn**: one with the skill, one without (or one with the previous version, if iterating on an existing skill). Don't stagger — launch all runs together so they finish around the same time and can be graded together.

**With-skill run prompt (template):**
```
Execute this task:
- Skill path: <absolute-path-to-skill>
- Task: <eval prompt>
- Input files: <files from eval, or "none">
- Save outputs to: <workspace>/iteration-<N>/<eval-name>/with_skill/outputs/
- Save your transcript to: <workspace>/iteration-<N>/<eval-name>/with_skill/transcript.md
- Outputs to save: <what the user actually cares about — the final file(s), not scratch work>
```

**Baseline run prompt:** identical, but no skill path. For improving an existing skill, snapshot the previous version first (`cp -r <skill-path> <workspace>/skill-snapshot/`) and point the baseline subagent at the snapshot; save to `old_skill/outputs/` instead of `without_skill/outputs/`.

For each eval, also write `eval_metadata.json` (expectations can be empty until Step 3):

```json
{
  "eval_id": 0,
  "eval_name": "extract-liability-sections",
  "prompt": "...the full prompt...",
  "expectations": []
}
```

Use the same descriptive name for the directory and `eval_name`. If this iteration tweaks any prompts, write fresh metadata files — don't assume they carry over from the previous iteration.

---

## Step 3 — While runs are in flight, draft assertions

Don't idle. For each eval, draft 4-7 **objectively verifiable** assertions. These are what the grader will check.

Good assertions:
- `"The output groups sections by which party they bind (vendor / customer / mutual)"`
- `"At least 5 distinct sections from the input PDF appear as direct quotes in the output"`
- `"The skill's pdf-extraction script was invoked at least once (visible in transcript)"`

Bad assertions (these read as passes regardless of skill):
- `"The output is a string"` (always true)
- `"The output is well-written"` (subjective, push to qualitative review instead)

If `evals.json` already had assertions, review them and keep only the discriminating ones. Save the final list back into `eval_metadata.json` and `evals.json`.

Subjective qualities (writing voice, design taste) belong in qualitative review, not assertions. Don't force them.

---

## Step 4 — Capture timing as notifications arrive

Each subagent task notification contains `total_tokens` and `duration_ms`. **This is your only chance to capture this data** — it isn't persisted anywhere else. As each notification arrives, write `timing.json` into the corresponding run directory:

```json
{ "total_tokens": 84852, "duration_ms": 23332, "total_duration_seconds": 23.3 }
```

Process notifications as they arrive; don't try to batch.

---

## Step 5 — Grade with Haiku subagents

Once a run's outputs and transcript are on disk, spawn a **Haiku grader subagent** for it. Read `agents/grader.md` and pass it as the subagent's instructions. Use Haiku (`model: "haiku"`) — grading is structured evidence-checking, Haiku does it well, and it keeps the eval loop cheap.

For deterministic assertions ("file X exists with mime type Y", "transcript contains string Z"), prefer writing a tiny Python script over having the grader eyeball it — scripts are faster, free, and reusable across iterations. The grader can call the script and record the result.

The grader writes `grading.json` into each run directory. The viewer and aggregator depend on the exact field names `expectations[].text`, `expectations[].passed`, `expectations[].evidence` — don't accept renamed variants from the grader.

---

## Step 6 — Aggregate and launch the viewer

Once every run has a `grading.json`:

```bash
python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <skill-name>
```

(Run from the skill-evaluator directory so `scripts/` is on the path.) This produces `benchmark.json` and `benchmark.md` — pass rate, time, tokens per configuration with mean ± stddev and the delta. With one run per config per iteration (the default), the ± is **eval-to-eval spread across the eval set, not run-to-run variance** — read it as "how consistent is the skill across different tasks", not "how noisy is a single task". **Order each `with_skill` run before its `without_skill` (or `old_skill`) counterpart** in the runs list — the viewer reads order to pair them.

Do a quick analyst pass on `benchmark.json`:
- Assertions that pass 100% in *both* configurations — non-discriminating, flag for replacement.
- Evals with high variance — possibly flaky; note it.
- Time/token tradeoffs — does the skill's win on pass rate justify its cost?

Add observations to the `notes[]` field of `benchmark.json` so the viewer surfaces them.

Then launch the viewer:

```bash
nohup python <skill-evaluator-path>/eval-viewer/generate_review.py \
  <workspace>/iteration-N \
  --skill-name "<skill-name>" \
  --benchmark <workspace>/iteration-N/benchmark.json \
  > /dev/null 2>&1 &
VIEWER_PID=$!
```

For iteration 2+, also pass `--previous-workspace <workspace>/iteration-<N-1>` so users see prior outputs and feedback inline.

**Headless / no-display environments:** use `--static <output_path>` to write a standalone HTML file. Feedback downloads as `feedback.json`; copy it into the workspace yourself before reading.

Tell the user: "I've opened the results. The 'Outputs' tab lets you click through each test case and leave feedback; the 'Benchmark' tab shows the quantitative comparison. Tell me when you're done."

---

## Step 7 — Read feedback and improve

When the user says they're done, read `feedback.json`:

```json
{
  "reviews": [
    {"run_id": "extract-liability-sections-with_skill", "feedback": "missed mutual indemnification clause", "timestamp": "..."},
    {"run_id": "extract-liability-sections-without_skill", "feedback": "", "timestamp": "..."}
  ],
  "status": "complete"
}
```

Empty feedback = the user thought it was fine. Focus on runs with concrete complaints.

When improving the skill, think hard:

1. **Generalize from the feedback.** The skill is going to run against many prompts — don't overfit to these three. If a fix only helps `extract-liability-sections`, it's probably the wrong fix.
2. **Keep the prompt lean.** Read the transcripts, not just the outputs. If the skill is making the model do unproductive work, cut the part that caused it.
3. **Explain the *why*.** Today's models have good theory of mind. Heavy-handed `MUST`/`NEVER` and rigid templates are a yellow flag — reframe as "here's why this matters." That generalizes better than rules.
4. **Notice repeated work across runs.** If all three with-skill runs independently wrote a similar helper script, the skill should bundle that script. Write it once, drop it in `scripts/`, point the skill at it.

Then kill the viewer, rerun all evals into `iteration-<N+1>/`, and loop.

```bash
kill $VIEWER_PID 2>/dev/null
```

Keep going until: the user says they're happy / feedback is all empty / progress has stalled.

---

## Description optimization (deferred — mention on iteration 2+ or last pass)

This skill **does not** run the description-optimization loop. That's expensive and only worth doing once the skill itself is solid.

**After the second iteration (or on what looks like the final pass)**, surface this to the user:

> "The skill's behaviour is in good shape. The remaining lever is the `description` field in the frontmatter — that's what determines whether Claude actually invokes the skill at the right time. If you want to tune that for trigger accuracy, `skill-creator` has a full optimization loop (`scripts/run_loop.py`) that does it. Want me to hand off to that, or are we done?"

Don't pre-emptively run it. Don't generate trigger-eval queries. Just signpost.

## Blind comparison (not supported)

Out of scope. If the user asks "is the new version *really* better?" beyond what `with_skill` vs. `old_skill` already shows, point them at `skill-creator/agents/comparator.md`.

---

## Reference files

- `agents/grader.md` — instructions for the Haiku grader subagent
- `references/schemas.md` — JSON shapes for `evals.json`, `grading.json`, `benchmark.json`, `timing.json`
- `scripts/aggregate_benchmark.py` — produces `benchmark.json` from a workspace iteration directory
- `eval-viewer/generate_review.py` — launches the qualitative + quantitative viewer
