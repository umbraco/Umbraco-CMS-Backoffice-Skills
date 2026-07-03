/**
 * Umbraco backoffice helpers for Claude-in-Chrome (mcp__claude-in-chrome__javascript_tool).
 * ===========================================================================================
 *
 * WHY THIS EXISTS
 *   The backoffice is Lit/web-components: everything lives in (open) shadow DOM, modals
 *   portal into their own stacking context and often render off the ~1536px captured
 *   viewport, and screenshots LAG behind the live DOM during modal transitions. The
 *   built-in `find`/`read_page` tools can't see into shadow DOM. These helpers pierce
 *   shadow DOM so you inspect state and act by *label/text* instead of pixels.
 *
 * INSTALL (once per browser session):
 *   Paste this whole file into javascript_tool. It defines `window.__umb` AND stashes its
 *   own source in localStorage.__umbSrc.
 *
 * RE-INJECT after any navigate/reload (a page load wipes window.__umb, but localStorage
 * survives), one-liner:
 *   eval(localStorage.__umbSrc)
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * NAVIGATION CHEATSHEET (learned the hard way)
 *
 *   SEE state, never trust a lone screenshot mid-transition:
 *     __umb.snapshot()  → visible actionable elements as `tag[role] "label" @x,y`
 *     __umb.find(text)  → matches with center {x,y} coords (regex or substring)
 *     __umb.modals()    → open modals/sidebars/dialogs + their action buttons
 *                          (this is how you catch a HIDDEN "discard changes" modal that
 *                           is silently blocking navigation)
 *
 *   DO things:
 *     __umb.fill(labelSubstr, value)   → set an input (dispatches input+change)
 *     __umb.click(text, {role,tag,nth})→ click most in-workspace buttons/options
 *
 *   USE THE COMPUTER TOOL (real, trusted click) for, using coords from __umb.find:
 *     - Section tabs (Content/Settings/…)   ← the SPA router ignores synthetic clicks
 *     - Sidebar tree GROUP headers (h3 "Structure") to expand/collapse
 *     Synthetic .click() works for buttons INSIDE a workspace/modal; it does NOT drive
 *     the router or those toggles.
 *
 *   GOTCHAS this surfaces for you:
 *     - Deep-linking to a *create* workspace (…/document-type/create/…) frequently renders
 *       BLANK. Enter create via the tree/collection "Create" action instead.
 *     - Leaving a workspace with unsaved state pops `umb-discard-changes-modal`; it blocks
 *       navigation. Click "Discard changes" (or "Save") to proceed.
 *     - The section tree loads ASYNC after navigation — waitFor() a known item first.
 *
 *   RELIABILITY NOTE: driving the UI for multi-step *setup* (create data type → doc type →
 *   content) is inherently fragile. When you just need the entities to exist, prefer the
 *   Management API via the e2e/Playwright testhelpers (they authenticate properly). The
 *   token is in-memory in the backoffice and cannot be borrowed from the page.
 *
 *   Don't return hrefs/URLs/base64 in bulk from javascript_tool — the privacy guard blocks
 *   the whole result. Return labels + coords only.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */
function __umbInstall() {
  const U = {};

  // Depth-first walk of the whole DOM, descending into every open shadow root.
  U._walk = function* (root) {
    root = root || document;
    for (const el of root.querySelectorAll("*")) {
      yield el;
      if (el.shadowRoot) yield* U._walk(el.shadowRoot);
    }
  };

  U._vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  U._label = (el) =>
    (
      (el.getAttribute &&
        (el.getAttribute("label") ||
          el.getAttribute("aria-label") ||
          el.getAttribute("name") ||
          el.getAttribute("placeholder"))) ||
      el.textContent ||
      ""
    )
      .replace(/\s+/g, " ")
      .trim();

  U._center = (el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  };
  U._rect = (el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  U._match = (label, text, exact) =>
    text instanceof RegExp ? text.test(label) : exact ? label === text : label.toLowerCase().includes(String(text).toLowerCase());

  const CLICKABLE = [
    "uui-button", "button", "a", "uui-menu-item", "uui-ref-item", "uui-ref-node",
    "uui-card", "uui-tab", "li", "uui-symbol-expand", "uui-toggle", "uui-checkbox",
  ];
  const INTERACTIVE = CLICKABLE.concat([
    "uui-input", "input", "uui-textarea", "textarea", "uui-select", "uui-combobox", "select",
  ]);

  /** Find matches by label/text. opts: {role, tag, exact, visibleOnly=true, limit=15}. */
  U.find = (text, opts) => {
    opts = opts || {};
    const { role, tag, exact = false, visibleOnly = true, limit = 15 } = opts;
    const out = [];
    for (const el of U._walk()) {
      if (visibleOnly && !U._vis(el)) continue;
      const t = el.tagName.toLowerCase();
      if (tag && t !== tag) continue;
      if (role && (el.getAttribute("role") || "") !== role) continue;
      const label = U._label(el);
      if (!label) continue;
      if (U._match(label, text, exact)) {
        out.push({ tag: t, role: el.getAttribute("role") || null, label: label.slice(0, 60), ...U._center(el) });
        if (out.length >= limit) break;
      }
    }
    return out;
  };

  /**
   * Click the first element whose label/text matches. Restricted to clickable tags
   * unless {tag} or {any:true} given. Works for in-workspace/in-modal buttons; NOT for
   * section tabs or tree group toggles (use the computer tool at the returned coords).
   * opts: {role, tag, exact, nth=0, any=false}. Returns {clicked,tag,x,y} or null.
   */
  U.click = (text, opts) => {
    opts = opts || {};
    const { role, tag, exact = false, nth = 0, any = false } = opts;
    let seen = 0;
    for (const el of U._walk()) {
      if (!U._vis(el)) continue;
      const t = el.tagName.toLowerCase();
      if (tag ? t !== tag : !any && !CLICKABLE.includes(t)) continue;
      if (role && (el.getAttribute("role") || "") !== role) continue;
      const label = U._label(el);
      if (!label || !U._match(label, text, exact)) continue;
      if (seen++ < nth) continue;
      el.scrollIntoView({ block: "center", inline: "center" });
      el.click();
      return { clicked: label.slice(0, 60), tag: t, ...U._center(el) };
    }
    return null;
  };

  /**
   * Fill an <uui-input>/<input>/<textarea> located by its label/aria-label/placeholder
   * substring. Dispatches input & change (composed) so Lit handlers fire. opts: {nth=0}.
   */
  U.fill = (labelSubstr, value, opts) => {
    opts = opts || {};
    const { nth = 0 } = opts;
    let seen = 0;
    for (const el of U._walk()) {
      const t = el.tagName.toLowerCase();
      if (!["uui-input", "input", "uui-textarea", "textarea"].includes(t)) continue;
      if (!U._vis(el)) continue;
      const lab = (el.getAttribute("label") || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "").toLowerCase();
      if (!lab.includes(labelSubstr.toLowerCase())) continue;
      if (seen++ < nth) continue;
      el.scrollIntoView({ block: "center" });
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      el.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      return { filled: labelSubstr, value, tag: t };
    }
    return null;
  };

  /** List open modals/sidebars/dialogs with their action buttons (incl. discard/keep). */
  U.modals = () => {
    const out = [];
    for (const el of U._walk()) {
      const t = el.tagName.toLowerCase();
      if (!/(modal|dialog|sidebar)/.test(t) || !U._vis(el)) continue;
      const acts = new Set();
      for (const b of U._walk(el.shadowRoot || el)) {
        if (b.tagName.toLowerCase() !== "uui-button" || !U._vis(b)) continue;
        const l = U._label(b);
        if (l && /submit|save|cancel|choose|create|close|confirm|delete|remove|select|done|back|next|discard|keep|apply/i.test(l)) {
          acts.add(l.slice(0, 30));
        }
      }
      out.push({ tag: t, ...U._rect(el), actions: [...acts] });
    }
    return out;
  };

  /** Compact list of visible, actionable elements: `tag[role] "label" @x,y`. opts:{limit=70}. */
  U.snapshot = (opts) => {
    opts = opts || {};
    const { limit = 70 } = opts;
    const out = [];
    for (const el of U._walk()) {
      if (!U._vis(el)) continue;
      const t = el.tagName.toLowerCase();
      const role = el.getAttribute("role");
      if (!INTERACTIVE.includes(t) && !role) continue;
      const label = U._label(el);
      if (!label) continue;
      const c = U._center(el);
      out.push(`${t}${role ? `[${role}]` : ""} "${label.slice(0, 50)}" @${c.x},${c.y}`);
      if (out.length >= limit) break;
    }
    return out;
  };

  /** Poll until an element matching text appears. opts:{role,timeout=8000,interval=250}. */
  U.waitFor = async (text, opts) => {
    opts = opts || {};
    const { role, timeout = 8000, interval = 250 } = opts;
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      const hits = U.find(text, { role, limit: 1 });
      if (hits.length) return hits[0];
      await new Promise((r) => setTimeout(r, interval));
    }
    return null;
  };

  /** Poll until an element matching text is GONE (e.g. a modal closed). */
  U.waitGone = async (text, opts) => {
    opts = opts || {};
    const { timeout = 8000, interval = 250 } = opts;
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      if (!U.find(text, { limit: 1 }).length) return true;
      await new Promise((r) => setTimeout(r, interval));
    }
    return false;
  };

  /**
   * Locate a top-level section tab (Content/Settings/…). Returns {x,y,...} — then click
   * those coords with the COMPUTER TOOL (the router ignores synthetic clicks).
   */
  U.section = (name) => U.find(name, { role: "tab", limit: 1 })[0] || null;

  /** Open a tree item's actions menu (the hover-only "View actions for 'X'" button). */
  U.treeActions = (itemName) =>
    U.click(`View actions for '${itemName}'`, { tag: "button" }) || U.click(`actions for '${itemName}'`);

  window.__umb = U;
  return "umb helpers ready -> " + Object.keys(U).filter((k) => !k.startsWith("_")).join(", ");
}

// Stash source for one-liner re-injection after reloads, then install now.
try { localStorage.setItem("__umbSrc", "(" + __umbInstall.toString() + ")()"); } catch (e) {}
__umbInstall();
