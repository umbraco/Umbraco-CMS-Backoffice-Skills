# Skill Code Analyzer

## Goal

Add static analysis and TypeScript compilation checking to validate code examples in SKILL.md files are correct and up-to-date.

## Components to Build

### 1. `umbraco-skill-code-analyzer` Skill

**Location**: `.claude/skills/umbraco-skill-code-analyzer/`

**Files**:
- `SKILL.md` - Skill documentation
- `scripts/package.json` - Dependencies (typescript, glob, tsx)
- `scripts/analyze-code.ts` - Main analysis script

**Checks to implement**:

| Check | Description | Issue Type |
|-------|-------------|------------|
| Import paths | Validate `@umbraco-cms/backoffice/*` modules | `invalid-import` |
| Extension types | Validate `type:` values in manifests | `unknown-extension-type` |
| Deprecated patterns | Flag outdated APIs (e.g., `UmbElementMixin`) | `deprecated-pattern` |
| TypeScript compilation | Optional syntax/type checking | `typescript-error` |

**Output**: `code-analysis-report.json`

```json
{
  "timestamp": "...",
  "skillsScanned": 69,
  "codeBlocksAnalyzed": 473,
  "issuesFound": 34,
  "skills": [
    {
      "skillPath": "...",
      "skillName": "...",
      "codeBlocks": 5,
      "issues": [
        {
          "line": 33,
          "type": "invalid-import",
          "value": "@umbraco-cms/backoffice/unknown",
          "message": "Unknown import path",
          "severity": "warning"
        }
      ]
    }
  ],
  "statistics": {
    "totalCodeBlocks": 473,
    "typescriptBlocks": 368,
    "importIssues": 16,
    "extensionTypeIssues": 21,
    "compilationErrors": 0,
    "deprecatedPatterns": 15
  }
}
```

### 2. `skill-quality-reviewer` Agent

**Location**: `.claude/agents/skill-quality-reviewer.md`

**Purpose**: AI-powered review and fixing based on static analysis results and current documentation

**Tools**: Read, Edit, Write, Glob, Grep, WebFetch, WebSearch

**Model**: sonnet

**Workflow**:
1. **Read static analysis report** - `code-analysis-report.json`
2. **For each skill with issues**:
   - Read the SKILL.md file at the path from report
   - Go to specific line numbers mentioned in issues
   - Fetch current documentation from URLs in the skill
   - Determine the fix based on issue type
3. **Apply fixes directly** using Edit tool
4. **Report what was fixed** and what needs user decision

**Fix strategy by issue type**:

| Issue Type | Fix Approach |
|------------|--------------|
| `invalid-import` | Find correct module in docs, apply fix |
| `unknown-extension-type` | Find correct type name in docs, apply fix |
| `deprecated-pattern` | Find replacement pattern in docs, apply fix |
| `typescript-error` | Fix if clear, report if complex |

**Auto-fix rules**:
- DO fix: Import paths, extension types, deprecated APIs with clear replacements
- DON'T fix: Multiple valid approaches exist, would change functionality

**Output format**:
```markdown
# Skill Quality Review - Fixes Applied

## Summary
- Skills processed: X
- Issues from static analysis: Y
- Fixes applied: Z
- Issues skipped (need user decision): W

## Fixes Applied

### `skill-name` (path/to/SKILL.md)

| Line | Issue Type | What Was Fixed |
|------|------------|----------------|
| 45 | deprecated-pattern | `UmbElementMixin` → `UmbLitElement` |
| 72 | invalid-import | `element-api` → `lit-element` |

## Skipped Issues (Need User Decision)
...
```

### 3. Update `/validate-skills` Command

Add Phase 2 to run code analyzer after link validation.

## Implementation Steps

### Step 1: Create skill directory structure
```
.claude/skills/umbraco-skill-code-analyzer/
├── SKILL.md
└── scripts/
    ├── package.json
    └── analyze-code.ts
```

### Step 2: Implement code block extraction
- Parse markdown for ```typescript and ```ts blocks
- Track line numbers for each block
- Return structured data with code + location

### Step 3: Add static analysis
- Extract import statements, validate against known modules
- Extract `type:` values, validate against known extension types
- Scan for deprecated patterns (regex-based)

### Step 4: Add TypeScript compilation (optional)
- Write code blocks to temp files
- Run tsc with @umbraco-cms/backoffice types
- Capture and parse errors
- Map errors back to original line numbers

### Step 5: Create the agent
- Read static analysis report
- Fetch docs to verify fixes
- Apply fixes directly with Edit tool
- Report results

### Step 6: Update command
- Add Phase 2 to run code analyzer
- Read both reports
- Present combined results

## Known Values to Maintain

### `KNOWN_BACKOFFICE_MODULES`
~95 known `@umbraco-cms/backoffice/*` submodules including:
- `lit-element`, `external/lit`, `external/uui`
- `extension-registry`, `context-api`, `controller-api`
- `notification`, `modal`, `workspace`, `tree`
- etc.

### `KNOWN_EXTENSION_TYPES`
~65 known extension types including:
- `dashboard`, `workspace`, `section`
- `entityAction`, `entityBulkAction`
- `propertyEditorUi`, `propertyEditorSchema`
- `tiptapExtension`, `tiptapToolbarExtension`
- etc.

### `DEPRECATED_PATTERNS`
Regex patterns for outdated code:
- `UmbElementMixin` → use `UmbLitElement`
- Direct `lit` import → use `@umbraco-cms/backoffice/external/lit`

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CHECK_TYPESCRIPT` | `false` | Enable TypeScript compilation checks |

## Usage

```bash
# Fast mode (no TypeScript)
CHECK_TYPESCRIPT=false npx tsx analyze-code.ts

# Full mode (with TypeScript)
CHECK_TYPESCRIPT=true npx tsx analyze-code.ts
```
