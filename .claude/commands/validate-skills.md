---
description: Validate links, code examples, and references in all SKILL.md files
allowed-tools: Bash, Read, Glob, Task, AskUserQuestion, Edit
arg-hints: --skip-tests
---

# Validate Skills

Run validation on all SKILL.md files to check:
1. **Links** - Broken URLs, missing skill refs, invalid paths
2. **Code** - Import paths, extension types, deprecated patterns
3. **Tests** - Run unit, mocked, and E2E tests from skill examples

## Pre-Validation: Agent References

Before running validation, the following agents should be loaded and available for use:

| Agent | Role | Trigger Condition |
|-------|------|-------------------|
| `skill-quality-reviewer` | Reviews and fixes code examples | After extension build/load completes |
| `skill-content-fixer` | Fixes broken links and references | After link validation finds issues |

### Agent Triggering Flow

```
Extension Built/Loaded
        ↓
┌───────────────────────────────────────┐
│  skill-quality-reviewer               │
│  - Review code patterns               │
│  - Fix outdated imports/types         │
│  - Apply documentation-based fixes    │
└───────────────────────────────────────┘
        ↓
Load Skills for Validation
        ↓
Run Validation Phases
        ↓
┌───────────────────────────────────────┐
│  skill-content-fixer                  │
│  - Fix broken URLs                    │
│  - Correct skill references           │
│  - Update invalid paths               │
└───────────────────────────────────────┘
```

## Workflow

### Phase 0: Load Skills (Pre-Validation)

**Load all available skills before validation begins:**

```bash
# Discover all SKILL.md files
find plugins -name "SKILL.md" -type f | wc -l

# List skill names for validation
find plugins -name "SKILL.md" -exec dirname {} \; | xargs -I {} basename {}
```

This step ensures all skills are indexed and available for:
- Cross-reference validation (skill refs like `umbraco-dashboard`)
- Import path validation against known modules
- Extension type validation against known types

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

### Phase 3: Run Tests

```bash
cd .claude/skills/umbraco-skill-test-runner/scripts
npm install --silent
npx tsx run-tests.ts
```

This runs all tests from skill examples:
- **Unit tests** - Component tests with `@open-wc/testing`
- **Mocked tests** - Integration tests against mocked backoffice
- **E2E tests** - Full tests against real Umbraco (auto-starts if needed)

For E2E tests, set credentials:
```bash
UMBRACO_USER_LOGIN=admin@example.com UMBRACO_USER_PASSWORD=password npx tsx run-tests.ts
```

### Phase 4: Read Reports

Read all JSON reports:
- `validation-report.json` (links)
- `code-analysis-report.json` (code)
- `test-report.json` (tests)

### Phase 5: Present Combined Report

Display a combined markdown report:

```markdown
# Skill Validation Report

## Summary
- Skills scanned: X
- Link issues: Y
- Code issues: Z
- Tests passed: X / Y (Z skipped)

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

## Test Results

| Example | Type | Status | Duration |
|---------|------|--------|----------|
| counter-dashboard | unit | passed | 1.2s |
| tree-example | mocked | passed | 3.4s |
| document-type-crud | e2e | failed | 45.2s |

### Failed Tests

#### `document-type-crud` (e2e)
```
Error: Timed out waiting for selector...
```

## Statistics
- External URLs checked: X (Y broken)
- Skill references checked: X (Y missing)
- Code blocks analyzed: X
- Import issues: X
- Extension type issues: X
- Deprecated patterns: X
- Test suites: X (Y passed, Z failed, W skipped)
```

### Phase 6: Fix Approval

If issues found, use AskUserQuestion:
- "Apply all high-confidence fixes"
- "Spawn AI agent for detailed analysis"
- "Skip fixes, show report only"

### Phase 7: Execute Fixes

**For link issues**: Use Edit tool directly (URL replacements are deterministic)

**For code issues**: Spawn `skill-quality-reviewer` agent to:
- Fetch current documentation from URLs in each skill
- Compare code examples against docs
- Suggest updated code patterns
- Auto-fix high-confidence issues

Only execute fixes the user explicitly approves.

## Agents

### Agent Lifecycle

The reviewing and validation agents are designed to be triggered at specific points in the workflow:

#### 1. `skill-quality-reviewer` - Post-Build/Load Review

**Trigger:** After extension is built or loaded, BEFORE validation begins

**Purpose:**
- Review code patterns against current Umbraco documentation
- Fix outdated imports, extension types, and deprecated patterns
- Ensure code examples compile and follow best practices

**How to spawn (use Task tool):**
```
Task: {
  subagent_type: "skill-quality-reviewer",
  prompt: "Review and fix code examples in SKILL.md files. Read code-analysis-report.json for issues found.",
  description: "Review extension code quality"
}
```

#### 2. `skill-content-fixer` - Post-Validation Fix

**Trigger:** After link validation finds issues

**Purpose:**
- Find correct URLs for broken links
- Suggest correct skill names for invalid references
- Update paths to current file locations

**How to spawn (use Task tool):**
```
Task: {
  subagent_type: "skill-content-fixer",
  prompt: "Analyze validation-report.json and suggest fixes for broken URLs and missing skill references.",
  description: "Fix validation issues"
}
```

### Agent Summary Table

| Agent | Purpose | Trigger Point |
|-------|---------|---------------|
| `skill-quality-reviewer` | Fix code patterns, imports, types | After build/load, before validation |
| `skill-content-fixer` | Fix URLs, skill refs, paths | After validation finds link issues |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CHECK_TYPESCRIPT` | `false` | Enable TypeScript compilation checks |
| `UMBRACO_CMS_PATH` | (auto) | Path to local Umbraco-CMS for path validation |
| `UMBRACO_USER_LOGIN` | - | Admin email for E2E test authentication |
| `UMBRACO_USER_PASSWORD` | - | Admin password for E2E test authentication |
| `UMBRACO_URL` | `https://localhost:44325` | Umbraco instance URL for E2E tests |

## Report Files

All validators save JSON reports to the project root:
- `validation-report.json` - Link validation results
- `code-analysis-report.json` - Code analysis results
- `test-report.json` - Test execution results

---

## Execution Instructions

**You MUST execute all phases in order (unless user specifies otherwise):**

### Standard Flow

1. **Phase 0**: Load skills (discover all SKILL.md files for validation)
2. **Phase 1 + 2**: Run Link Validation and Code Analysis in parallel
3. **Phase 3**: Run Tests - unless user passes `--skip-tests`
4. **Phase 4**: Read all JSON reports
5. **Phase 5**: Present the combined report to the user
6. **Phase 6-7**: If issues found, ask user about fixes and execute

### Post-Build/Load Flow (When extension work completes)

When an agent has just completed creating or modifying an extension:

1. **Trigger `skill-quality-reviewer`** to review and fix code issues
2. Wait for reviewer to complete fixes
3. **Load skills** for validation (Phase 0)
4. **Run validation** (Phases 1-5)
5. If link issues found, **trigger `skill-content-fixer`**
6. Present final report

### Integration with Extension Creation

When used after `/create-umbraco-skills` or similar commands:

```
/create-umbraco-skills dashboard
        ↓
[Extension created]
        ↓
Spawn skill-quality-reviewer
        ↓
[Review and fix code patterns]
        ↓
/validate-skills
        ↓
[Full validation with fixes]
```

**Options:**
- `/validate-skills` - Run all phases including tests
- `/validate-skills --skip-tests` - Skip Phase 3 (tests), only run link and code validation

**For Phase 3 (Tests)**, use these environment variables:
```bash
URL=https://localhost:44325 \
UMBRACO_USER_LOGIN=admin@example.com \
UMBRACO_USER_PASSWORD=1234567890 \
npx tsx run-tests.ts
```

If Umbraco credentials are not available, tests will still run but E2E tests may be skipped. Unit and mocked tests do not require credentials.
