var I = (s) => {
  throw TypeError(s);
};
var x = (s, i, e) => i.has(s) || I("Cannot " + e);
var t = (s, i, e) => (x(s, i, "read from private field"), e ? e.call(s) : i.get(s)), h = (s, i, e) => i.has(s) ? I("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(s) : i.set(s, e), l = (s, i, e, a) => (x(s, i, "write to private field"), a ? a.call(s, e) : i.set(s, e), e);
import { c as P, a as R, b as Y, N as $ } from "./bundle.manifests-CPE-rfRR.js";
import { N as M } from "./note-workspace.context-token-DNUQtk0q.js";
import { html as k, css as z, state as q, customElement as L } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as X } from "@umbraco-cms/backoffice/lit-element";
import { UmbSubmittableWorkspaceContextBase as F, UmbWorkspaceIsNewRedirectController as K } from "@umbraco-cms/backoffice/workspace";
import { UmbStringState as m, UmbArrayState as G } from "@umbraco-cms/backoffice/observable-api";
import "./client.gen-m1c42xYY.js";
import { N as O } from "./sdk.gen-DVGT3O8n.js";
import { UMB_NOTIFICATION_CONTEXT as H } from "@umbraco-cms/backoffice/notification";
import { UMB_ACTION_EVENT_CONTEXT as J } from "@umbraco-cms/backoffice/action";
import { UmbRequestReloadChildrenOfEntityEvent as Q } from "@umbraco-cms/backoffice/entity-action";
var Z = Object.defineProperty, j = Object.getOwnPropertyDescriptor, W = (s) => {
  throw TypeError(s);
}, b = (s, i, e, a) => {
  for (var o = a > 1 ? void 0 : a ? j(i, e) : i, p = s.length - 1, v; p >= 0; p--)
    (v = s[p]) && (o = (a ? v(i, e, o) : v(o)) || o);
  return a && o && Z(i, e, o), o;
}, U = (s, i, e) => i.has(s) || W("Cannot " + e), T = (s, i, e) => (U(s, i, "read from private field"), i.get(s)), D = (s, i, e) => i.has(s) ? W("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(s) : i.set(s, e), tt = (s, i, e, a) => (U(s, i, "write to private field"), i.set(s, e), e), et = (s, i, e) => (U(s, i, "access private method"), e), N, C, A;
let y = class extends X {
  constructor() {
    super(), D(this, C), D(this, N), this._title = "", this._icon = "icon-notepad", this._isNew = !1, this.consumeContext(M, (s) => {
      tt(this, N, s), et(this, C, A).call(this);
    });
  }
  render() {
    const s = this._title || (this._isNew ? "New Note" : "Note");
    return k`
      <umb-workspace-editor alias=${P}>
        <div id="header" slot="header">
          <uui-icon name=${this._icon}></uui-icon>
          <span class="title">${s}</span>
          ${this._isNew ? k`<uui-tag color="positive">New</uui-tag>` : ""}
        </div>
      </umb-workspace-editor>
    `;
  }
};
N = /* @__PURE__ */ new WeakMap();
C = /* @__PURE__ */ new WeakSet();
A = function() {
  T(this, N) && (this.observe(T(this, N).title, (s) => {
    this._title = s || "";
  }), this.observe(T(this, N).icon, (s) => {
    this._icon = s || "icon-notepad";
  }), this.observe(T(this, N).isNew, (s) => {
    this._isNew = s ?? !1;
  }));
};
y.styles = [
  z`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      #header {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-3);
        font-size: 1.2rem;
        font-weight: bold;
      }

      uui-icon {
        font-size: 1.5rem;
      }

      .title {
        flex: 1;
      }
    `
];
b([
  q()
], y.prototype, "_title", 2);
b([
  q()
], y.prototype, "_icon", 2);
b([
  q()
], y.prototype, "_isNew", 2);
y = b([
  L("notes-note-workspace-editor")
], y);
var c, n, u, r, V, d, _, g, f, w, E;
class vt extends F {
  /**
   * Creates a new note workspace context.
   *
   * Sets up:
   * - Route definitions for edit/create modes
   * - Notification context consumption for toasts
   *
   * **Important:** Do NOT call `provideContext` here.
   * `UmbSubmittableWorkspaceContextBase` already provides `UMB_WORKSPACE_CONTEXT`.
   * Our `NOTE_WORKSPACE_CONTEXT` token uses "UmbWorkspaceContext" as its alias,
   * which matches the base class provision.
   *
   * @param {UmbControllerHost} host - The controller host (typically the workspace element)
   */
  constructor(e) {
    super(e, P);
    h(this, c);
    h(this, n);
    h(this, u);
    h(this, r);
    h(this, V);
    h(this, d);
    h(this, _);
    h(this, g);
    h(this, f);
    h(this, w);
    // ===========================================================================
    // CONSUMED CONTEXTS
    // ===========================================================================
    /** Notification context for displaying toast messages */
    h(this, E);
    l(this, c, new m(void 0)), this.unique = t(this, c).asObservable(), l(this, n, new m("")), this.title = t(this, n).asObservable(), l(this, u, new m("")), this.content = t(this, u).asObservable(), l(this, r, new G([], (a) => a)), this.tags = t(this, r).asObservable(), l(this, V, new m("icon-notepad")), this.icon = t(this, V).asObservable(), l(this, d, new m(void 0)), this.parentUnique = t(this, d).asObservable(), l(this, _, new m(void 0)), this.createdDate = t(this, _).asObservable(), l(this, g, new m(void 0)), this.modifiedDate = t(this, g).asObservable(), l(this, f, new m(void 0)), this.createdBy = t(this, f).asObservable(), l(this, w, new m(void 0)), this.modifiedBy = t(this, w).asObservable(), this.consumeContext(H, (a) => {
      l(this, E, a);
    }), this.routes.setRoutes([
      {
        // Route: Edit an existing note
        // URL: /section/notes/workspace/notes-note/edit/{guid}
        path: "edit/:unique",
        component: y,
        setup: (a, o) => {
          const p = o.match.params.unique;
          this.load(p);
        }
      },
      {
        // Route: Create a new note
        // URL: /section/notes/workspace/notes-note/create/parent/{parentEntityType}/{parentId}
        path: "create/parent/:parentEntityType/:parentUnique",
        component: y,
        setup: (a, o) => {
          const p = o.match.params.parentUnique === "null" ? null : o.match.params.parentUnique;
          this.createScaffold(p), new K(
            this,
            this,
            this.getHostElement().shadowRoot.querySelector("umb-router-slot")
          );
        }
      }
    ]);
  }
  // ===========================================================================
  // DATA LOADING
  // ===========================================================================
  /**
   * Loads an existing note from the API.
   *
   * Called by the edit route when the workspace opens.
   * Fetches note data and populates all state properties.
   *
   * @param {string} unique - The unique ID (GUID) of the note to load
   *
   * @example
   * // Called automatically by route setup, but can be called manually:
   * await context.load("abc-123-def-456");
   */
  async load(e) {
    t(this, c).setValue(e), this.setIsNew(!1);
    try {
      const o = (await O.getNote({
        path: { id: e }
      })).data;
      t(this, n).setValue(o.title), t(this, u).setValue(o.content), t(this, r).setValue(o.tags || []), t(this, d).setValue(o.parentUnique ?? void 0), t(this, _).setValue(o.createdDate), t(this, g).setValue(o.modifiedDate), t(this, f).setValue(o.createdBy), t(this, w).setValue(o.modifiedBy);
    } catch (a) {
      console.error("Error loading note:", a), t(this, n).setValue("Error loading note");
    }
  }
  /**
   * Creates a scaffold for a new note.
   *
   * Called by the create route when creating a new note.
   * Generates a new unique ID and initializes all state to defaults.
   *
   * @param {string | null} parentUnique - Parent folder ID, or null for root level
   *
   * @example
   * // Create note in folder
   * context.createScaffold("folder-abc-123");
   *
   * // Create note at root
   * context.createScaffold(null);
   */
  createScaffold(e) {
    const a = crypto.randomUUID();
    t(this, c).setValue(a), this.setIsNew(!0), t(this, d).setValue(e ?? void 0), t(this, n).setValue(""), t(this, u).setValue(""), t(this, r).setValue([]), t(this, _).setValue(void 0), t(this, g).setValue(void 0), t(this, f).setValue(void 0), t(this, w).setValue(void 0);
  }
  // ===========================================================================
  // DATA SAVING
  // ===========================================================================
  /**
   * Saves the note to the API.
   *
   * **IMPORTANT:** This is the `submit` method required by `UmbSubmittableWorkspaceContextBase`.
   * It's called automatically when the user clicks the Save button in the workspace header.
   *
   * The method:
   * 1. Validates that we have a unique ID
   * 2. Creates or updates the note via API
   * 3. Shows success/error notification
   * 4. Triggers tree refresh to show new/updated item
   *
   * @returns {Promise<void>} Resolves on success, throws on failure
   * @throws {Error} If unique ID is missing or API call fails
   *
   * @protected - Called by base class, not directly by consumers
   */
  async submit() {
    var o, p;
    const e = t(this, c).getValue(), a = this.getIsNew();
    if (!e)
      throw new Error("Cannot save: no unique identifier");
    try {
      a ? await O.createNote({
        body: {
          unique: e,
          parentUnique: t(this, d).getValue() || null,
          title: t(this, n).getValue(),
          content: t(this, u).getValue(),
          tags: t(this, r).getValue()
        }
      }) : await O.updateNote({
        path: { id: e },
        body: {
          title: t(this, n).getValue(),
          content: t(this, u).getValue(),
          tags: t(this, r).getValue()
        }
      }), this.setIsNew(!1), (o = t(this, E)) == null || o.peek("positive", {
        data: {
          headline: "Note saved",
          message: `"${t(this, n).getValue()}" has been saved successfully.`
        }
      });
      const v = await this.getContext(J);
      if (v) {
        const S = t(this, d).getValue(), B = new Q({
          entityType: S ? R : Y,
          unique: S ?? null
        });
        v.dispatchEvent(B);
      }
    } catch (v) {
      throw console.error("Error saving note:", v), (p = t(this, E)) == null || p.peek("danger", {
        data: {
          headline: "Error saving note",
          message: "An error occurred while saving the note. Please try again."
        }
      }), v;
    }
  }
  // ===========================================================================
  // GETTERS - Required by UmbSubmittableWorkspaceContextBase
  // These methods are called by the base class and workspace system
  // ===========================================================================
  /**
   * Gets the unique identifier of the current note.
   *
   * Required by `UmbSubmittableWorkspaceContextBase`.
   *
   * @returns {string | undefined} The note's unique ID, or undefined if not set
   */
  getUnique() {
    return t(this, c).getValue();
  }
  /**
   * Gets the entity type for this workspace.
   *
   * Required by `UmbSubmittableWorkspaceContextBase`.
   * Used by the system to identify what type of content this workspace edits.
   *
   * @returns {string} Always returns NOTES_NOTE_ENTITY_TYPE ("notes-note")
   */
  getEntityType() {
    return $;
  }
  /**
   * Gets the current note data as a single object.
   *
   * Required by `UmbSubmittableWorkspaceContextBase`.
   * Returns all editable fields in a single object format.
   *
   * @returns {NoteWorkspaceData | undefined} The note data, or undefined if no note loaded
   */
  getData() {
    const e = t(this, c).getValue();
    if (e)
      return {
        unique: e,
        title: t(this, n).getValue(),
        content: t(this, u).getValue(),
        tags: t(this, r).getValue(),
        parentUnique: t(this, d).getValue() || null
      };
  }
  // ===========================================================================
  // SETTERS - Used by UI components to update state
  // These methods update the private state, triggering observable updates
  // ===========================================================================
  /**
   * Sets the note title.
   *
   * @param {string} title - The new title
   *
   * @example
   * // In a form component:
   * context.setTitle(inputElement.value);
   */
  setTitle(e) {
    t(this, n).setValue(e);
  }
  /**
   * Sets the note content (markdown).
   *
   * @param {string} content - The new markdown content
   */
  setContent(e) {
    t(this, u).setValue(e);
  }
  /**
   * Replaces all tags with a new array.
   *
   * @param {string[]} tags - The new tags array
   */
  setTags(e) {
    t(this, r).setValue(e);
  }
  /**
   * Adds a single tag if it doesn't already exist.
   *
   * @param {string} tag - The tag to add
   *
   * @example
   * context.addTag("important");
   * context.addTag("important"); // No duplicate added
   */
  addTag(e) {
    const a = t(this, r).getValue();
    a.includes(e) || t(this, r).setValue([...a, e]);
  }
  /**
   * Removes a tag from the list.
   *
   * @param {string} tag - The tag to remove
   */
  removeTag(e) {
    const a = t(this, r).getValue();
    t(this, r).setValue(a.filter((o) => o !== e));
  }
  // ===========================================================================
  // CLEANUP
  // ===========================================================================
  /**
   * Cleans up all state objects when the context is destroyed.
   *
   * Called automatically when the workspace closes.
   * Important for memory management - state objects must be destroyed
   * to prevent memory leaks from lingering subscriptions.
   *
   * @override
   */
  destroy() {
    t(this, c).destroy(), t(this, n).destroy(), t(this, u).destroy(), t(this, r).destroy(), t(this, V).destroy(), t(this, d).destroy(), t(this, _).destroy(), t(this, g).destroy(), t(this, f).destroy(), t(this, w).destroy(), super.destroy();
  }
}
c = new WeakMap(), n = new WeakMap(), u = new WeakMap(), r = new WeakMap(), V = new WeakMap(), d = new WeakMap(), _ = new WeakMap(), g = new WeakMap(), f = new WeakMap(), w = new WeakMap(), E = new WeakMap();
export {
  vt as NoteWorkspaceContext,
  vt as api
};
//# sourceMappingURL=note-workspace.context-CDjQ-Nuk.js.map
