---
name: umbraco-version-guard
description: Deterministically verify that the Umbraco major of the site you are working on matches the major these skills target. Run this FIRST, before any Umbraco backoffice work, to avoid mixing guidance across Umbraco majors (e.g. 17 vs 18 vs 19). Trigger on the first Umbraco task in a session, or whenever the site's version is uncertain.
version: 1.0.0
location: managed
allowed-tools: Bash, Read, Grep, Glob, WebFetch
user_invocable: true
---

# Umbraco Version Guard

## What this skill does

The Umbraco backoffice API changes between majors (tree data sources, auth, OpenAPI
registration, and more). **These skills target one specific major.** Applying them to a
site on a different major produces confidently-wrong code.

This skill is a **preflight check**: it derives the target major from the plugin itself
(so it never goes stale as new majors ship), detects the target site's major
deterministically, compares them, and STOPS with the correct install command on a
mismatch. Nothing here hardcodes a specific major number — both sides are computed.

## Step 1 — Determine the major these skills target

The plugin's own version is the source of truth, and it bumps every major at release. Read
it and take the leading number:

```bash
# Primary: the installed plugin's version. First path is the Claude Code plugin layout;
# the greps are fallbacks for when the skill was copied flat into an editor's skills dir.
cat "${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json" 2>/dev/null \
  || cat ../../.claude-plugin/plugin.json 2>/dev/null \
  | grep -m1 '"version"' | grep -oE '[0-9]+' | head -1
```

Call this **TARGET_MAJOR**. If none of the paths resolve (a flat copy with no
`plugin.json` alongside), fall back to the marketplace version, and only then to reading
the value a sibling skill states — never invent a number. If you genuinely cannot
determine it, say so and skip the guard rather than guessing.

## Step 2 — Detect the site's Umbraco major (deterministic, no running instance needed)

Try these signals in order and stop at the first that yields a number. Each extracts just
the **major**, so it works with `17.0.0`, `17.*`, `[17.0.0,)`, or plain `17`.

**A. `Umbraco.Cms` package reference (ground truth — what is actually installed).** Covers
`*.csproj` PackageReference and central-package-management `*.props` (PackageVersion); the
trailing `"` after `Cms` excludes `Umbraco.Cms.DevelopmentMode` etc.

```bash
grep -rhoE 'Umbraco\.Cms"[^0-9]*[0-9]+' --include='*.csproj' --include='*.props' . 2>/dev/null \
  | grep -oE '[0-9]+$' | sort -u
```

**B. Fallback — the backoffice client dependency major** (handles `^17.0.0`, `~17.0.0`, `17.0.0`):

```bash
grep -rhoE '"@umbraco-cms/backoffice":[^0-9]*[0-9]+' --include='package.json' . 2>/dev/null \
  | grep -oE '[0-9]+$' | sort -u
```

**C. Last resort — a running instance's Server Information API** (needs the site up; prefer A/B):

```
GET {baseUrl}/umbraco/management/api/v1/server/information
```

Call the result **SITE_MAJOR**. If A/B/C all return nothing, there is no Umbraco site in
the workspace yet — say so and continue (nothing to guard). If multiple different majors
are found (a mixed solution), surface all of them and ask which project is the target.

## Step 3 — Compare and act

- **`SITE_MAJOR == TARGET_MAJOR`** → ✅ Silent pass. Say one line confirming the match
  (e.g. "Site is Umbraco {SITE_MAJOR}.x — matches these skills.") and proceed.
- **`SITE_MAJOR != TARGET_MAJOR`** → ⛔ STOP. Do not generate version-specific code. Warn
  as below, then only continue if the user explicitly confirms.

**Which skill line to recommend** follows the repo's branch convention — the *latest*
major lives on `main`; every older major `N` lives on a `vN/main` branch:

- **`SITE_MAJOR < TARGET_MAJOR`** (site is older than these skills) → point at the older
  line for the site's major:
  ```
  /plugin marketplace add https://github.com/umbraco/Umbraco-CMS-Backoffice-Skills.git#v{SITE_MAJOR}/main
  ```
- **`SITE_MAJOR > TARGET_MAJOR`** (these skills are older than the site) → the latest major
  lives on the default `main`, so re-add and update the default marketplace:
  ```
  /plugin marketplace add umbraco/Umbraco-CMS-Backoffice-Skills
  ```
  If no released line exists yet for `SITE_MAJOR`, say so — the skills may not have caught
  up to that major.

Substitute the actual numbers when you present this. Template for the message:

> ⚠️ **Version mismatch.** This site is Umbraco **{SITE_MAJOR}**, but the loaded skills
> target Umbraco **{TARGET_MAJOR}**. The backoffice API differs between majors, so this
> skill set will produce incorrect code for your site. Install the matching line:
> `<computed command above>`
>
> For the Vercel Skills CLI (Cursor/Copilot/Windsurf), point the repo URL at the matching
> branch (`main` for the latest major, `v{N}/main` for an older one).

## When to run this

Run it **once at the start** of any Umbraco backoffice task, before writing code. The
entry skills (`umbraco-quickstart`, `umbraco-backoffice`, `umbraco-extension-template`)
reference this guard as their first step. Re-run only if the workspace changes.
