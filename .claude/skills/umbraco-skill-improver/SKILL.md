---
name: umbraco-skill-improver
description: Improve Umbraco backoffice skills through automated eval loops - fetches docs, generates code, validates with static analysis and Playwright, scores, and rewrites SKILL.md to converge on correct output
version: 1.0.0
location: managed
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, WebFetch
---

# Umbraco Skill Improver

Automated improvement loop for Umbraco backoffice skills. Takes any skill through: fetch docs, generate code via `claude -p`, validate (static analysis + Playwright MSW), score, improve SKILL.md, repeat.

## Quick Start

```bash
# Improve a single skill
cd .claude/skills/umbraco-skill-improver/scripts
npm install --silent
npx tsx improve-loop.ts --skill-path /path/to/umbraco-dashboard --verbose

# With options
npx tsx improve-loop.ts \
  --skill-path /path/to/umbraco-dashboard \
  --max-iterations 8 \
  --model claude-sonnet-4-6 \
  --verbose
```

## What It Does

1. **Prep** - Parses SKILL.md, fetches doc URLs, generates eval prompts + assertions
2. **Generate** - Runs skill via `claude -p`, captures generated code
3. **Validate** - Static analysis (reuses analyze-code.ts) + Playwright MSW tests
4. **Score** - Composite score (structural 0.25, code quality 0.20, playwright 0.30, docs 0.10, compactness 0.15)
5. **Improve** - LLM rewrites SKILL.md based on failure analysis
6. **Repeat** - Until score >= 0.90 for 2 iterations, plateau, or max 8 iterations

## Interactive Usage

When invoked as a skill:

1. User specifies which skill to improve (e.g., "improve the umbraco-dashboard skill")
2. Run the prep phase to show current state and eval set
3. Run the improvement loop, showing progress between iterations
4. Present the best iteration and ask for confirmation before applying

## Workflow

1. Run `npx tsx scripts/generate-eval-set.ts --skill-path <path>` to create evals
2. Run `npx tsx scripts/improve-loop.ts --skill-path <path>` for the full loop
3. Review results in `results/<skill-name>/<date>/`
4. Apply the winning SKILL.md if the improvement is significant

## Output Structure

```
results/<skill-name>/<date>/
  eval-set.json              # Frozen eval prompts + assertions
  doc-snapshots/             # Fetched documentation
  iteration-0/               # Baseline (original SKILL.md)
  iteration-N/               # Each improvement iteration
    SKILL.md.snapshot
    SKILL.md.diff
    scores.json
    eval-*/run-*/
      outputs/               # Generated code
      code-analysis.json
      playwright-results.json
      grading.json
  benchmark.json             # Compatible with skill-creator viewer
  summary.json               # Final report
```

## Individual Scripts

Each phase can be run standalone:

- `generate-eval-set.ts` - Generate eval prompts for a skill
- `run-skill-eval.ts` - Run skill via claude -p, capture output
- `validate.ts` - Static analysis + Playwright validation
- `score-iteration.ts` - Compute composite score
- `improve-skill.ts` - LLM-based SKILL.md rewrite
- `improve-loop.ts` - Full orchestrator
