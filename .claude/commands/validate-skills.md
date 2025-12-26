---
description: Validate links, code examples, and references in all SKILL.md files
allowed-tools: Bash, Read, Glob, Task, AskUserQuestion, Edit
---

# Validate Skills

Run validation on all SKILL.md files to check:
1. **Links** - Broken URLs, missing skill refs, invalid paths
2. **Code** - Import paths, extension types, deprecated patterns

## Workflow

### Phase 1: Link Validation (Fast)

```bash
cd .claude/skills/umbraco-skill-validator/scripts
npm install --silent
npx tsx validate-links.ts
```

### Phase 2: Code Analysis (Fast)

```bash
cd .claude/skills/umbraco-skill-code-analyzer/scripts
npm install --silent
CHECK_TYPESCRIPT=false npx tsx analyze-code.ts
```

Set `CHECK_TYPESCRIPT=true` for TypeScript compilation checking (slower but more thorough).

### Phase 3: Read Reports

Read both JSON reports:
- `validation-report.json` (links)
- `code-analysis-report.json` (code)

### Phase 4: Present Combined Report

Display a combined markdown report:

```markdown
# Skill Validation Report

## Summary
- Skills scanned: X
- Link issues: Y
- Code issues: Z

## Link Issues

### `skill-name` (path/to/SKILL.md)

| Line | Type | Issue |
|------|------|-------|
| 45 | Broken URL | https://... returns 404 |
| 72 | Missing skill | `umbraco-foo` not found |

## Code Issues

### `skill-name` (path/to/SKILL.md)

| Line | Type | Issue | Severity |
|------|------|-------|----------|
| 33 | Invalid import | @umbraco-cms/backoffice/unknown | warning |
| 58 | Unknown type | 'fooBar' extension type | warning |
| 101 | Deprecated | UmbElementMixin is deprecated | warning |

## Statistics
- External URLs checked: X (Y broken)
- Skill references checked: X (Y missing)
- Code blocks analyzed: X
- Import issues: X
- Extension type issues: X
- Deprecated patterns: X
```

### Phase 5: Fix Approval

If issues found, use AskUserQuestion:
- "Apply all high-confidence fixes"
- "Spawn AI agent for detailed analysis"
- "Skip fixes, show report only"

### Phase 6: Execute Fixes

**For link issues**: Use Edit tool directly (URL replacements are deterministic)

**For code issues**: Spawn `skill-quality-reviewer` agent to:
- Fetch current documentation from URLs in each skill
- Compare code examples against docs
- Suggest updated code patterns
- Auto-fix high-confidence issues

Only execute fixes the user explicitly approves.

## Agents

| Agent | Purpose | When to Spawn |
|-------|---------|---------------|
| `skill-content-fixer` | Suggests fixes for broken links | After link validation finds issues |
| `skill-quality-reviewer` | Deep code review against docs | After code analysis or on user request |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CHECK_TYPESCRIPT` | `false` | Enable TypeScript compilation checks |
| `UMBRACO_CMS_PATH` | (auto) | Path to local Umbraco-CMS for path validation |

## Report Files

Both validators save JSON reports to the project root:
- `validation-report.json` - Link validation results
- `code-analysis-report.json` - Code analysis results
