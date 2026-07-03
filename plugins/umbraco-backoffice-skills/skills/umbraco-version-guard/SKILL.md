---
name: umbraco-version-guard
description: Deterministically verify that the Umbraco major version of the site you are working on matches the major these skills target (this line targets Umbraco 18). Run this FIRST, before any Umbraco backoffice work, to avoid mixing v17 and v18 guidance. Trigger on the first Umbraco task in a session, or whenever the site's version is uncertain.
version: 1.0.0
location: managed
allowed-tools: Bash, Read, Grep, Glob, WebFetch
user_invocable: true
---

# Umbraco Version Guard

## What this skill does

The Umbraco backoffice API changes between majors (v17 → v18 changed tree data
sources, auth, OpenAPI registration, and more). **These skills target one specific
major.** Applying them to a site on a different major produces confidently-wrong code.

This skill is a **preflight check**: it determines the target site's Umbraco major
deterministically and compares it to the major these skills target. On a mismatch it
STOPS and tells the user to install the matching skill line — it does not guess.

## The major these skills target

> **This skill line targets Umbraco `18`.**

That number is the single source of truth for this branch. (The `v17/main` branch ships
its own copy of this skill stating `17`.) You can cross-check it against the installed
plugin's version when available:

```bash
# Optional confirmation — the plugin's own major. First path works when installed as a
# Claude Code plugin; second when the skill was copied into an editor's skills dir.
cat "${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json" 2>/dev/null | grep -m1 '"version"' \
  || grep -m1 '"version"' ../../.claude-plugin/plugin.json 2>/dev/null
```

If that version's major disagrees with the `18` stated above, trust `plugin.json` and
warn the user their install is inconsistent.

## Step 1 — Detect the site's Umbraco major (deterministic, no running instance needed)

Try these signals in order and stop at the first that yields a number.

**A. `Umbraco.Cms` package reference (ground truth — what is actually installed).**
Extracts just the **major**, so it works with `18.0.0`, `18.*`, `[18.0.0,)`, or plain
`18`. Covers `*.csproj` PackageReference and central-package-management `*.props`
(PackageVersion); the trailing `"` after `Cms` excludes `Umbraco.Cms.DevelopmentMode` etc.

```bash
grep -rhoE 'Umbraco\.Cms"[^0-9]*[0-9]+' --include='*.csproj' --include='*.props' . 2>/dev/null \
  | grep -oE '[0-9]+$' | sort -u
```

**B. Fallback — the backoffice client dependency major** (handles `^18.0.0`, `~18.0.0`, `18.0.0`):

```bash
grep -rhoE '"@umbraco-cms/backoffice":[^0-9]*[0-9]+' --include='package.json' . 2>/dev/null \
  | grep -oE '[0-9]+$' | sort -u
```

**C. Last resort — a running instance's Server Information API** (needs the site up; the
`^` version may be an internal build number, so prefer A/B):

```
GET {baseUrl}/umbraco/management/api/v1/server/information
```

Take the **major** (the first number) of whatever you find. If A/B/C all return nothing,
there is no Umbraco site in the workspace yet — say so and continue (nothing to guard).

## Step 2 — Compare majors

- **Site major == target major (18)** → ✅ Silent pass. Say one line confirming the match
  (e.g. "Site is Umbraco 18.x — matches these skills.") and proceed with the task.
- **Site major != target major** → ⛔ STOP. Do not generate version-specific code. Warn
  as below.
- **Multiple different majors detected** (e.g. a solution with mixed references) → surface
  all of them and ask the user which project is the target before proceeding.

## Step 3 — On mismatch, warn and point to the right line

Tell the user plainly, then stop for their decision:

> ⚠️ **Version mismatch.** This site is Umbraco **`<detected>`**, but the loaded skills
> target Umbraco **18**. The backoffice API differs between these majors, so this skill
> set will produce incorrect code for your site.
>
> Install the matching skill line instead:
>
> - **Umbraco 18** (default / `main`):
>   ```
>   /plugin marketplace add umbraco/Umbraco-CMS-Backoffice-Skills
>   ```
> - **Umbraco 17** (`v17/main` branch):
>   ```
>   /plugin marketplace add https://github.com/umbraco/Umbraco-CMS-Backoffice-Skills.git#v17/main
>   ```
>   Or, for the Vercel Skills CLI in other editors, add `#v17/main` to the repo URL.

Only continue if the user explicitly confirms they understand and want to proceed anyway.

## When to run this

Run it **once at the start** of any Umbraco backoffice task, before writing code. The
entry skills (`umbraco-quickstart`, `umbraco-backoffice`, `umbraco-extension-template`)
reference this guard as their first step. Re-run only if the workspace changes.
