# Plan: Skill Content Validator Command (Hybrid Approach)

## Overview
Create a `/validate-skills` command that triggers a skill containing deterministic scripts and expertise, with a subagent for intelligent fix suggestions.

---

## Validation Scope

| Check Type | Method |
|------------|--------|
| External URLs | HTTP HEAD requests (script) |
| Skill references | Glob for SKILL.md files (script) |
| Internal pattern links | File system check (script) |
| File path references | GitHub API when Umbraco-CMS not local (script) |
| Import paths | GitHub API to verify @umbraco-cms/backoffice/* paths (script) |

---

## Architecture: Command → Skill (with scripts) → Subagent

```
/validate-skills (command)
       │
       ▼
umbraco-skill-validator (skill)
├── SKILL.md
│   ├── Expertise: What to check, patterns to look for
│   ├── Templates: Report format, fix plan format
│   └── Instructions: How to run scripts, interpret results
├── scripts/
│   ├── validate-links.ts    ← Deterministic link checking
│   └── package.json         ← Script dependencies
└── triggers subagent when issues found
       │
       ▼
skill-content-fixer (subagent)
├── Receives: JSON report of issues
├── Uses: WebSearch, WebFetch to find correct URLs
└── Returns: Fix plan with diffs
```

### Layer 1: Slash Command (`/validate-skills`)
Simple entry point that invokes the skill.

### Layer 2: Skill (`umbraco-skill-validator`)
Contains:
- **SKILL.md**: Expertise on what constitutes valid skill content
- **scripts/**: Deterministic validation logic
- **Templates**: Report and fix plan formats

### Layer 3: Subagent (`skill-content-fixer`)
Spawned when issues are found:
- Analyzes validation report
- Searches for correct URLs/paths
- Generates fix proposals

---

## Workflow

```
/validate-skills
       │
       ▼
┌─────────────────────────────────────────┐
│ 1. Invoke Skill                         │
│    Load umbraco-skill-validator         │
│    Read expertise from SKILL.md         │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 2. Run Script (Deterministic)           │
│    npx tsx scripts/validate-links.ts    │
│    - Discover SKILL.md files            │
│    - Extract all links/references       │
│    - HTTP HEAD check URLs               │
│    - File exists checks                 │
│    - GitHub API for Umbraco paths       │
│    → Output: validation-report.json     │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 3. Format Report                        │
│    Use templates from SKILL.md          │
│    Display human-readable report        │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 4. Spawn Subagent (if issues found)     │
│    skill-content-fixer agent            │
│    - WebSearch for correct URLs         │
│    - Find valid skill names             │
│    - Propose content corrections        │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 5. Present Fix Plan                     │
│    Show proposed changes with diffs     │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 6. User Approval                        │
│    AskUserQuestion for each fix         │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 7. Execute Approved Fixes               │
│    Edit only selected changes           │
└─────────────────────────────────────────┘
```

---

## Report Template

```markdown
# Skill Validation Report

## Summary
- Skills scanned: X
- Issues found: Y
- Auto-fixable: Z

## Issues by Skill

### `umbraco-dashboard` (plugins/umbraco-backoffice-skills/skills/umbraco-dashboard/SKILL.md)

| Line | Type | Issue | Status |
|------|------|-------|--------|
| 45 | Broken URL | https://docs.umbraco.com/old-page returns 404 | ❌ |
| 72 | Missing skill | `umbraco-nonexistent` not found | ❌ |
| 89 | Invalid path | patterns/missing.md does not exist | ❌ |

### `umbraco-tree` (plugins/umbraco-backoffice-skills/skills/umbraco-tree/SKILL.md)

| Line | Type | Issue | Status |
|------|------|-------|--------|
| 23 | Outdated URL | Page moved to new location | ⚠️ |

## Statistics
- External URLs checked: X (Y broken)
- Skill references checked: X (Y missing)
- File paths checked: X (Y invalid)
```

---

## Fix Plan Template

```markdown
# Fix Plan

## Proposed Changes

### Fix 1: Update broken URL in umbraco-dashboard
**File:** plugins/umbraco-backoffice-skills/skills/umbraco-dashboard/SKILL.md
**Line:** 45
**Issue:** URL returns 404
**Action:** Replace URL with current documentation location

- [Dashboard docs](https://docs.umbraco.com/old-page)
+ [Dashboard docs](https://docs.umbraco.com/new-page)

### Fix 2: Remove invalid skill reference in umbraco-dashboard
**File:** plugins/umbraco-backoffice-skills/skills/umbraco-dashboard/SKILL.md
**Line:** 72
**Issue:** Referenced skill does not exist
**Action:** Remove reference or update to correct skill name

- See also: `umbraco-nonexistent` for more details.
+ See also: `umbraco-workspace` for more details.

## Approval Required
Please approve which fixes to apply:
- [ ] Fix 1: Update broken URL
- [ ] Fix 2: Remove invalid skill reference
```

---

## Implementation Details

### Skill: umbraco-skill-validator

**Location:** `plugins/umbraco-backoffice-skills/skills/umbraco-skill-validator/`

**Structure:**
```
umbraco-skill-validator/
├── SKILL.md              ← Expertise and templates
├── scripts/
│   ├── validate-links.ts ← Deterministic checker
│   └── package.json      ← Dependencies (tsx)
└── index.ts              ← Optional: exports for programmatic use
```

**SKILL.md Contents:**
- What constitutes valid skill content
- Link patterns to check
- Report and fix plan templates
- Instructions for running scripts
- Guidance for interpreting results

### Script: validate-links.ts

```typescript
// Location: plugins/umbraco-backoffice-skills/skills/umbraco-skill-validator/scripts/validate-links.ts

interface ValidationResult {
  skillPath: string;
  issues: Issue[];
}

interface Issue {
  line: number;
  type: 'broken-url' | 'missing-skill' | 'invalid-path' | 'missing-file';
  value: string;
  status: number | null;  // HTTP status or null for file checks
  message: string;
}

// Main functions:
// - discoverSkills(): Find all SKILL.md files
// - extractLinks(content): Parse markdown, return categorized links
// - checkUrl(url): HTTP HEAD request, return status
// - checkSkillRef(name): Glob for SKILL.md, return exists
// - checkFilePath(path): fs.existsSync or GitHub API
// - generateReport(results): Output JSON
```

**Dependencies (scripts/package.json):**
```json
{
  "name": "skill-validator-scripts",
  "type": "module",
  "scripts": {
    "validate": "tsx validate-links.ts"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "glob": "^10.3.0"
  }
}
```

### Command: validate-skills.md

```yaml
---
description: Validate links and references in all SKILL.md files
allowed-tools: Bash, Read, Task, AskUserQuestion, Edit, Skill
---
```

**Content:**
```markdown
Invoke the `umbraco-skill-validator` skill to validate all SKILL.md files.

1. Run the validation script from the skill
2. Display the report
3. If issues found, spawn the fixer subagent
4. Present fix plan for approval
5. Execute approved fixes
```

### Agent: skill-content-fixer.md

```yaml
---
name: skill-content-fixer
description: Analyzes validation issues and suggests intelligent fixes
tools: Read, WebFetch, WebSearch, Glob
model: sonnet
---
```

**Responsibilities:**
1. For broken URLs: WebSearch for current documentation location
2. For missing skills: Find similar skill names, suggest corrections
3. For invalid paths: Search codebase for correct paths
4. Generate diff-style fix proposals

---

## Files to Create

| File | Purpose |
|------|---------|
| `plugins/umbraco-backoffice-skills/skills/umbraco-skill-validator/SKILL.md` | Skill expertise and templates |
| `plugins/umbraco-backoffice-skills/skills/umbraco-skill-validator/scripts/validate-links.ts` | Deterministic checker |
| `plugins/umbraco-backoffice-skills/skills/umbraco-skill-validator/scripts/package.json` | Script dependencies |
| `.claude/commands/validate-skills.md` | Slash command entry point |
| `plugins/umbraco-backoffice-skills/agents/skill-content-fixer.md` | AI fix suggestions |

---

## Edge Cases

1. **Rate limiting**: Batch URL checks with delays
2. **Redirect URLs**: Report as warnings, suggest updated URL
3. **Missing Umbraco-CMS**: Fall back to GitHub API
4. **Private repos**: Skip GitHub API checks, report as unchecked
5. **Large files**: Process in chunks to avoid memory issues
6. **Timeouts**: Set reasonable timeout for HTTP requests (5s)

---

## Benefits of Hybrid Approach

| Aspect | Script (in Skill) | Subagent |
|--------|-------------------|----------|
| Speed | Fast (parallel HTTP) | Slower (token processing) |
| Cost | Free | Token cost |
| Consistency | Deterministic | May vary |
| CI/CD | Yes (can run standalone) | No |
| Fix suggestions | No | Yes (intelligent) |
| Context understanding | No | Yes |
| Reusability | Part of skill | Separate concern |

---

## Why Script Lives in Skill

1. **Encapsulation**: All validation logic in one place
2. **Expertise co-location**: Script knows what SKILL.md documents
3. **Reusability**: Skill can be invoked by other commands/agents
4. **CI/CD friendly**: Script can run standalone via `npm run validate`
5. **Self-documenting**: SKILL.md explains what script checks
