---
name: umbraco-chrome-navigation
description: Drive and inspect the Umbraco backoffice reliably with Claude-in-Chrome browser automation. Use this WHENEVER you are about to use the mcp__claude-in-chrome tools against a running Umbraco backoffice — navigating sections, clicking tree items, filling forms, opening/closing modals, or visually verifying a backoffice extension (property editor, dashboard, workspace, tree, section, menu). The backoffice is Lit/web-components with open shadow DOM and modals that render off-screen, so the built-in find/read_page tools see nothing and screenshots lag behind the live DOM. This skill provides a shadow-DOM-piercing JS helper toolkit plus a navigation playbook so you read state from the DOM instead of guessing from pixels. Trigger even when the user only says "open the backoffice", "test the extension in Umbraco", "click through the backoffice", "log in and check it works", or "take a screenshot of the editor in Umbraco".
version: 1.0.0
location: managed
---

# Umbraco Backoffice Navigation (Claude-in-Chrome)

## Why this skill exists

The Umbraco backoffice is built from Lit web-components. That creates three problems for
browser automation that will waste many tool calls if you fight them blind:

1. **Everything is in (open) shadow DOM.** The built-in `find` and `read_page` tools do
   not pierce shadow roots, so they return almost nothing on backoffice pages.
2. **Modals portal into their own stacking context** and frequently render off the
   ~1536px captured viewport, or stack so the newest one is off-screen.
3. **Screenshots lag** behind the live DOM during modal transitions — you can screenshot
   a frame that no longer reflects the current state and misread it completely.

The fix is to stop navigating by pixels. Inject a small shadow-DOM-piercing helper and
read state from the DOM (which never lags), acting by *label/text* instead of coordinates.
Take a screenshot only when a picture is the actual deliverable (verifying how something
*looks*, or evidence for the user) — not as your primary way to figure out what's on screen.

## Setup (once per browser session)

The toolkit lives at `scripts/umbraco-chrome-helpers.js` in this skill. Read that file and
paste its entire contents into `mcp__claude-in-chrome__javascript_tool` (on the backoffice
tab). It defines `window.__umb` and stashes its own source in `localStorage.__umbSrc`.

A page load (navigate/reload/login redirect) wipes `window.__umb` but not localStorage, so
**re-inject after every navigation with the one-liner:**

```js
eval(localStorage.__umbSrc)
```

Start a browser session the usual way first: `tabs_context_mcp` → `tabs_create_mcp` (or
reuse the backoffice tab), then `navigate` to the backoffice at `<your-host>/umbraco`
(this repo's host is `localhost:44325`).

## The API

All finders return the element's center `{x, y}` so you can fall back to the computer tool.

| Call | Use it to |
|------|-----------|
| `__umb.snapshot()` | List visible actionable elements as `tag[role] "label" @x,y` — "what can I click" |
| `__umb.find(text, {role, tag})` | Locate elements by label/text (string or RegExp) with coords |
| `__umb.click(text, {role, tag, nth})` | Click most in-workspace / in-modal buttons and options |
| `__umb.fill(labelSubstr, value)` | Set an `<uui-input>`/`<input>`/`<textarea>` (dispatches input+change) |
| `__umb.modals()` | List open modals/sidebars/dialogs + their action buttons |
| `__umb.waitFor(text, {role})` | Poll until an element appears (the section tree loads async) |
| `__umb.waitGone(text)` | Poll until an element disappears (e.g. a modal closed) |
| `__umb.section(name)` | Locate a section tab (Content/Settings/…) — returns coords to click with the computer tool |
| `__umb.treeActions(itemName)` | Open a tree item's "View actions for 'X'" menu |

## The one rule that saves you: synthetic vs. trusted clicks

`__umb.click()` uses the element's real `.click()`. That works for **buttons and options
inside a workspace or modal** (Save, Submit, Discard, result rows, create options, etc.).

It does **NOT** work for two things, because they need a *trusted* user gesture:
- **Section tabs** (Content, Settings…) — the SPA router ignores synthetic clicks.
- **Sidebar tree GROUP headers** (the `h3` "Structure"/"Templating") that expand/collapse.

For those, get coords from `__umb.find(...)` (or `__umb.section(...)`) and click them with
`mcp__claude-in-chrome__computer` (`left_click` at `{x,y}`) — a real, trusted click.

So the division of labor is: **DOM helpers to see state and do in-page actions; the
computer tool (at helper-provided coords) for route navigation and tree-group toggles.**

## Gotchas the helpers expose for you

- **Hidden "discard changes" modal.** Leaving a workspace with unsaved state pops
  `umb-discard-changes-modal`, which silently blocks navigation. If a nav seems to do
  nothing, run `__umb.modals()` — you'll see it — then `__umb.click('Discard changes')`
  (or `'Save'`) to proceed.
- **Blank create workspaces.** Deep-linking to a `…/create/…` workspace URL frequently
  renders blank. Enter create via the tree/collection **"Create"** action instead.
- **Async tree load.** After navigating to a section, the sidebar tree loads a moment
  later. `__umb.waitFor('<a known item>')` before acting.
- **Session invalidation.** Recreating the DB (fresh unattended install) invalidates the
  old token; the tab bounces to `/umbraco/login`. Re-inject helpers, then log in by
  setting the username/password inputs and clicking the submit button.
- **Privacy guard.** Do not return hrefs/URLs/base64 in bulk from `javascript_tool` — the
  guard blocks the whole result. Return labels + coords only (the helpers already do this).

## Reliability boundary — prefer the API for setup

Driving the *UI* through multi-step **setup** (create data type → document type → content)
is inherently fragile: async trees, blank create workspaces, discard guards. When you only
need the entities to *exist*, the **Management API is the right surface**, via the Umbraco
e2e/Playwright testhelpers (`@umbraco-cms/acceptance-test-helpers`), which authenticate
properly and seed with a few `umbracoApi.*` calls. Use this skill for the parts that must
happen in the live backoffice UI (verifying a custom editor renders and behaves, clicking
through a flow, capturing a screenshot). Note: the backoffice OAuth token is held in memory,
not in localStorage/sessionStorage, so it can't be borrowed from the page for direct API
calls from Claude-in-Chrome.

## Typical loop

1. `navigate` to the backoffice tab, inject the toolkit (or `eval(localStorage.__umbSrc)`).
2. `__umb.snapshot()` / `__umb.find(...)` to see what's there — not a screenshot.
3. Navigate sections/expand tree groups with the computer tool at helper coords; do
   in-page actions with `__umb.click` / `__umb.fill`.
4. After each step, verify with `__umb.find` / `__umb.modals` / `location.pathname`.
5. Take **one** screenshot at the end if the deliverable is visual (how it looks) or is
   evidence for the user.
