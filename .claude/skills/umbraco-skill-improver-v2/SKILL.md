---
name: umbraco-skill-improver-v2
description: Simplified skill improver - 13 pass/fail checks, single eval per iteration, 2 files instead of 7
version: 1.0.0
location: managed
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, WebFetch
---

# Umbraco Skill Improver v2

Simplified improvement loop for Umbraco backoffice skills. Same goal as v1 but with 2 scripts (~550 lines) instead of 7 (~2500 lines).

## Key Differences from v1

| Aspect | v1 | v2 |
|--------|----|----|
| Scripts | 7 files (~2500 lines) | 2 files (~550 lines) |
| Scoring | 5 weighted float dimensions | 13 pass/fail boolean checks |
| Evals per iteration | 3 prompts × 2 runs = 6 | 1 prompt × 1 run = 1 |
| Output dirs | Nested eval-*/run-*/ | Flat iteration-N/ |
| Subprocess model | Scripts call scripts via execSync | Inline function calls |

## Quick Start

```bash
cd .claude/skills/umbraco-skill-improver-v2/scripts
npm install --silent
npx tsx improve.ts --skill-path /path/to/umbraco-dashboard --verbose
```

## 13 Pass/Fail Checks

1. `files-extracted` - got at least 1 file
2. `has-manifest` - has a *package.json file
3. `has-element` - has a .ts/.js element file
4. `manifest-has-type` - manifest has "type" field
5. `manifest-has-alias` - manifest has "alias" field
6. `manifest-has-name` - manifest has "name" field
7. `manifest-has-element` - manifest has "element" or "js" field
8. `element-has-class` - element has `class X extends`
9. `element-has-render` - element has `render()` method
10. `valid-imports` - no unknown @umbraco-cms/backoffice/* imports
11. `valid-extension-type` - no unknown extension type strings
12. `no-deprecated` - no deprecated patterns
13. `docs-aligned` - no warning/error pattern drifts vs fetched docs

Score = passed / total.

## Output Structure

```
results/<skill-name>/<date>/v2/
  doc-snapshots/
  iteration-0/
    SKILL.md.snapshot
    outputs/           # Generated code files
    checks.json        # 13 check results
    transcript.txt
    SKILL.md.improved  # Improved version (if not last)
    SKILL.md.diff
  summary.json
  benchmark.json
```
