# Analysis: Packaging Skills for Cross-Tool Compatibility

**Issue**: [#31 - Support for Other Agents](https://github.com/umbraco/Umbraco-CMS-Backoffice-Skills/issues/31)
**Date**: 2026-02-09

## Summary

This document analyzes how the 66 SKILL.md files in this repository can be packaged for use across different AI coding assistants (Cursor, GitHub Copilot, Windsurf, Cline, Gemini CLI, etc.), evaluates available tooling, and recommends an approach.

---

## 1. Current State

### What We Have

- **66 skills** across 2 plugins (`umbraco-backoffice-skills`, `umbraco-testing-skills`)
- **1 agent** (`umbraco-extension-reviewer`)
- Skills use **YAML frontmatter + Markdown** format (SKILL.md files)
- Distribution via **Claude Code marketplace** (`.claude-plugin/marketplace.json`)
- Skills are invocable via `/skill-name` syntax in Claude Code

### Claude-Specific Elements in Current Skills

| Element | Where Used | Portability |
|---------|-----------|-------------|
| YAML frontmatter (`name`, `description`, `version`) | All SKILL.md files | Portable - standard metadata |
| `location: managed` | All SKILL.md files | Claude-specific, can be ignored |
| `allowed-tools: Read, Write, Edit, WebFetch` | All SKILL.md files | Claude-specific tool names |
| `user_invocable: true` | Some skills | Claude-specific concept |
| `argument-hint` | Some skills (e.g., quickstart) | Claude-specific |
| `/skill-name` invocation syntax | Workflow sections | Claude-specific |
| `WebFetch` tool references in workflows | Most skills | Concept is universal, name is Claude-specific |
| `.claude-plugin/` directory structure | Plugin packaging | Claude-specific |
| Agent `.md` files with `tools:`, `model:` frontmatter | 1 agent file | Claude-specific |

### What's Already Portable

The **core content** of every SKILL.md is standard Markdown containing:
- Concept explanations
- Documentation URLs (universal)
- Code examples (universal - JSON manifests, TypeScript/JavaScript)
- Workflow steps (largely tool-agnostic)
- Troubleshooting guides

**Roughly 80-90% of each skill's content is already tool-agnostic.** The Claude-specific parts are the frontmatter fields and tool name references (`WebFetch`, `/skill-name` invocations).

---

## 2. Target Tool Formats

Each AI coding assistant consumes instructions differently:

| Tool | Config Location | Format | Skills Support |
|------|----------------|--------|---------------|
| **Claude Code** | `.claude/skills/*/SKILL.md` | YAML frontmatter + MD | Native (current) |
| **Cursor** | `.cursor/rules/*.mdc` | MDC (YAML frontmatter + MD) | Via rules, no native skills |
| **GitHub Copilot** | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` | MD with optional `applyTo` frontmatter | Via instructions files |
| **Windsurf** | `.windsurf/rules/*.md` or `.windsurfrules` | MD | Via rules |
| **Cline** | `.clinerules/` directory | MD with optional YAML frontmatter | Via rules |
| **Gemini CLI** | `GEMINI.md` | MD | Single file (or via rulesync skills) |
| **Codex CLI** | `AGENTS.md` | MD | Single file |
| **Aider** | `CONVENTIONS.md` | MD | Single file via `--read` |
| **Roo Code** | `.roo/rules/*.md` | MD with frontmatter | Via rules |

### Key Format Differences

1. **Single-file tools** (Gemini, Codex, Aider): Need all skills concatenated into one file, or a curated subset
2. **Multi-file tools** (Cursor, Copilot, Cline, Windsurf): Can map 1 skill = 1 rule file
3. **Frontmatter differences**: Cursor uses `globs` and `description` fields; Copilot uses `applyTo`; Claude uses `allowed-tools`
4. **Invocation model**: Only Claude Code has native "invoke a skill by name" (`/skill-name`). Other tools use rules that are always-on or auto-attached by file pattern

---

## 3. Tool Evaluation

### 3A. rulesync (dyoshikawa) - Previously Used

**Repository**: https://github.com/dyoshikawa/rulesync
**Stars**: 771 | **Latest**: v6.8.1 (2026-02-09) | **Status**: Very actively maintained

**How it works**:
- Source files in `.rulesync/rules/*.md`, `.rulesync/skills/*/SKILL.md`, `.rulesync/commands/*.md`
- Config in `rulesync.jsonc`
- Generates native configs for 25+ tools
- Supports skills, commands, subagents, MCP configs, and ignore files
- `rulesync import` can convert existing configs into unified format
- `rulesync generate --targets "*"` outputs for all tools

**Fit for this project**:
- **Good**: Already supports `SKILL.md` format natively. Skills in `.rulesync/skills/` directories use the same Markdown format
- **Good**: Supports "simulated" skills/commands for tools without native support
- **Good**: Active maintenance, frequent releases, enterprise adoption
- **Concern**: 66 skills would need to be reorganized into `.rulesync/` structure (or import used)
- **Concern**: Some Claude-specific frontmatter fields would need mapping

**Effort estimate**: Low-Medium. The `rulesync import --targets claudecode` command could bootstrap the conversion. Main work is reviewing and adjusting the output.

---

### 3B. Ruler (intellectronica)

**Repository**: https://github.com/intellectronica/ruler
**Stars**: ~250+ | **Status**: Actively maintained

**How it works**:
- Source files in `.ruler/` directory
- Config in `ruler.toml`
- Supports 30+ agents (broadest coverage)
- Auto-manages `.gitignore`
- Source markers for traceability

**Fit for this project**:
- **Good**: Broadest agent support (30+ tools)
- **Good**: Simple `.ruler/` directory structure
- **Concern**: Less mature than rulesync
- **Concern**: No native "skills" concept - everything is rules

**Effort estimate**: Medium. Skills would need to be converted to rules format.

---

### 3C. ai-rulez (Goldziher)

**Repository**: https://github.com/Goldziher/ai-rulez
**Stars**: ~400+ | **Status**: Actively maintained

**How it works**:
- Source in `.ai-rulez/` directory with YAML config
- 18 preset generators
- Context compression (34% size reduction)
- Remote includes from git repos/URLs
- Built-in commands system

**Fit for this project**:
- **Good**: Context compression helpful for 66 skills
- **Good**: Remote includes could pull from this repo
- **Good**: Multiple install methods (npm, pip, brew, Go)
- **Concern**: Fewer target generators than rulesync or Ruler
- **Concern**: Would need significant restructuring

**Effort estimate**: Medium-High.

---

### 3D. block/ai-rules

**Repository**: https://github.com/block/ai-rules
**Stars**: ~300+ | **Status**: Maintained (Block/Square backing)

**Fit for this project**:
- **Good**: Corporate backing (Block co-founded AAIF with Anthropic and OpenAI)
- **Concern**: Fewer supported agents than rulesync/Ruler
- **Concern**: Simpler feature set, may not handle 66 skills well

**Effort estimate**: Medium.

---

### 3E. AGENTS.md (Manual / No Tool)

**Approach**: Maintain a single `AGENTS.md` file and symlink it.

**Fit for this project**:
- **Poor**: 66 skills cannot reasonably be concatenated into one file
- **Poor**: Loses the per-skill invocation model entirely
- **Poor**: No way to represent skill metadata, cross-references, or tool restrictions

**Verdict**: Not viable as the sole approach for a project of this size. However, a curated `AGENTS.md` summary pointing users to the skills could supplement any approach.

---

### 3F. Custom Build Script

**Approach**: Write a script that reads the SKILL.md files and generates tool-specific configs.

**Fit for this project**:
- **Good**: Full control over output format
- **Good**: Can preserve all metadata and cross-references
- **Concern**: Maintenance burden - must track format changes across all target tools
- **Concern**: Reinventing what rulesync/Ruler already do

**Effort estimate**: High initially, ongoing maintenance.

---

## 4. Compatibility Analysis

### What Translates Cleanly

| Skill Element | Cursor (.mdc) | Copilot (.instructions.md) | Cline (.clinerules) | Windsurf (.windsurfrules) |
|--------------|---------------|---------------------------|---------------------|--------------------------|
| Skill name | `description` frontmatter | Filename | Filename | Filename |
| Description | `description` field | Content heading | Content heading | Content heading |
| Code examples | Body content | Body content | Body content | Body content |
| Doc URLs | Body content | Body content | Body content | Body content |
| Workflow steps | Body content | Body content | Body content | Body content |

### What Doesn't Translate

| Skill Element | Challenge |
|--------------|-----------|
| `allowed-tools` | No equivalent in other tools (they don't restrict tool access per-rule) |
| `user_invocable` | Only Claude has explicit skill invocation. Other tools attach rules automatically |
| `argument-hint` | No equivalent - other tools don't have parameterized rules |
| `/skill-name` cross-references | Would need to become "See: [filename]" references |
| `location: managed` | Claude-specific, drop entirely |
| `WebFetch` in workflows | Replace with generic "fetch the documentation" phrasing |
| Agent files (`model: sonnet`) | No equivalent in most tools |

### Skills That Are Hardest to Port

1. **umbraco-quickstart**: Heavily relies on `/skill-name` invocation chains and argument parsing
2. **umbraco-backoffice** (router skill): Acts as a dispatcher to other skills
3. **umbraco-extension-reviewer** (agent): Uses Claude-specific agent features (model selection, tool restrictions)

### Skills That Port Easily

The vast majority (50+ of 66) are **reference/implementation skills** like `umbraco-dashboard`, `umbraco-tree`, `umbraco-context-api`. These are structured as:
- "Here's what this concept is"
- "Here are the docs to fetch"
- "Here's a working code example"
- "Here are common issues"

This content works identically in any tool.

---

## 5. Recommendation

### Recommended Approach: rulesync (dyoshikawa)

**Why rulesync over the alternatives**:

1. **Native SKILL.md support**: rulesync already understands the `skills/*/SKILL.md` directory convention. The current files would require minimal restructuring.

2. **Import capability**: `rulesync import --targets claudecode` can read the existing Claude Code structure and generate the `.rulesync/` source files automatically.

3. **Broadest tested compatibility**: 25+ tools with active testing. Handles the nuances of each format (Cursor's MDC, Copilot's `applyTo`, etc.).

4. **Simulated features**: For tools that don't have native skills (most of them), rulesync can generate "simulated" skills by embedding them as rules with special formatting.

5. **CI integration**: `rulesync generate --check` can verify generated files stay in sync with source, useful for this project's existing validation pipeline.

6. **Active maintenance**: Latest release was today (v6.8.1). 771 stars, enterprise adoption, frequent updates.

7. **Reversible**: Generated files are standalone. If rulesync is abandoned, the output files continue to work.

### Implementation Plan

#### Phase 1: Setup and Import (Low effort)

1. Install rulesync: `npm install -g rulesync`
2. Run `rulesync import --targets claudecode` to bootstrap `.rulesync/` from existing structure
3. Configure `rulesync.jsonc` with target tools:
   ```jsonc
   {
     "targets": ["claudecode", "cursor", "copilot", "windsurf", "cline", "gemini-cli"],
     "features": ["rules", "skills"],
     "simulateSkills": true
   }
   ```
4. Run `rulesync generate --dry-run` to preview output

#### Phase 2: Content Adaptation (Medium effort)

1. **Strip Claude-specific frontmatter**: Remove `location: managed`, `allowed-tools`, `user_invocable` from the unified source. These can be re-added as Claude-specific overrides if rulesync supports it.
2. **Generalize tool references**: Replace `/skill-name` with generic references. Replace `WebFetch` with "fetch the documentation at the URL".
3. **Handle cross-references**: Convert `/umbraco-dashboard` references to descriptive text that works in any tool.
4. **Router skills**: The `umbraco-backoffice` router skill and `umbraco-quickstart` will need tool-specific variants or simplification for non-Claude tools.

#### Phase 3: CI Integration

1. Add `rulesync generate --check` to the existing validation pipeline
2. Ensure generated files are committed alongside source
3. Document the workflow in README

### What This Gives Users

After implementation, the repository would contain:

```
.rulesync/                          # Source of truth
  skills/umbraco-dashboard/SKILL.md
  skills/umbraco-tree/SKILL.md
  ...
.claude/skills/                     # Generated: Claude Code
.cursor/rules/                      # Generated: Cursor
.github/instructions/               # Generated: GitHub Copilot
.windsurfrules                      # Generated: Windsurf
.clinerules/                        # Generated: Cline
GEMINI.md                           # Generated: Gemini CLI
```

Users of any supported tool would clone/install and immediately have the skills available in their preferred format.

---

## 6. Challenges and Open Questions

### Content Volume
66 skills is a lot of content. Tools like Cursor and Copilot may not handle this volume well in their context windows. We may need to:
- Use Cursor's `alwaysApply: false` with `description` fields so rules are only loaded when relevant
- Use Copilot's `applyTo` to scope instructions to relevant file patterns
- Consider ai-rulez's context compression as an alternative if token limits become an issue

### Cross-Skill References
Many skills reference others (`"Reference skill: umbraco-context-api"`). In Claude Code, this triggers skill loading. In other tools, this concept doesn't exist. Options:
- Convert to "See file: [path]" references
- Inline the most critical cross-referenced content
- Accept that other tools won't have the same composability

### Dynamic Documentation Fetching
Skills instruct Claude to `WebFetch` live documentation. This works in Claude Code but may not work in all tools:
- Cursor: Can fetch URLs in some modes
- Copilot: Cannot fetch URLs during generation
- Cline: Can fetch URLs
- Windsurf: Limited URL fetching

For tools that can't fetch, we may need to inline more documentation or provide static snapshots.

### Agent Support
The `umbraco-extension-reviewer` agent uses Claude-specific features (model selection, tool restrictions). This cannot be directly ported. Options:
- Include as a "manual checklist" rule in other tools
- Skip agent conversion entirely (agents are a small part of the value)

### Ongoing Maintenance
Any sync tool adds a maintenance step: changes to skills must go through the `.rulesync/` source, then `rulesync generate` must be re-run. This should be enforced via CI.

---

## 7. Alternative Consideration: Dual-Source Approach

If rulesync's import doesn't perfectly handle the current structure, an alternative is to:

1. Keep the current Claude Code structure as-is (it works well)
2. Add a lightweight build script that reads the SKILL.md files and generates Cursor/Copilot/etc. configs
3. This avoids restructuring but means maintaining a custom script

This is a fallback if rulesync integration proves too disruptive to the existing workflow.

---

## 8. Conclusion

**Yes, packaging these skills for other tools is feasible.** The core content (80-90%) is already tool-agnostic Markdown. The main work is:

1. Stripping/mapping Claude-specific frontmatter
2. Generalizing tool references in workflow sections
3. Setting up a generation pipeline

**rulesync is the recommended tool** due to its native SKILL.md support, import capability, broad tool coverage, and active maintenance. The main risk is content volume - 66 skills may need careful scoping for tools with limited context windows.

The effort is **low for initial setup, medium for content adaptation, and low for ongoing maintenance** once the pipeline is established.
