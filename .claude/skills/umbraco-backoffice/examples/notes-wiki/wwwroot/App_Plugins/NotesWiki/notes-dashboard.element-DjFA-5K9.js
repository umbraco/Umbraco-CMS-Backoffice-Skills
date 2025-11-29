import { html as s, css as _, state as p, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as b } from "@umbraco-cms/backoffice/lit-element";
import "./client.gen-m1c42xYY.js";
import { N as x } from "./sdk.gen-DVGT3O8n.js";
import { U as N } from "./paths-D8xbqxl6.js";
var w = Object.defineProperty, z = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, d = (e, t, i, n) => {
  for (var o = n > 1 ? void 0 : n ? z(t, i) : t, l = e.length - 1, u; l >= 0; l--)
    (u = e[l]) && (o = (n ? u(t, i, o) : u(o)) || o);
  return n && o && w(t, i, o), o;
}, k = (e, t, i) => t.has(e) || h("Cannot " + i), E = (e, t, i) => t.has(e) ? h("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), c = (e, t, i) => (k(e, t, "access private method"), i), a, m, v, f, g;
let r = class extends b {
  constructor() {
    super(...arguments), E(this, a), this._recentNotes = [], this._loading = !0;
  }
  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================
  /**
   * Called when the element is added to the DOM.
   * Triggers initial data loading for recent notes.
   * @override
   */
  connectedCallback() {
    super.connectedCallback(), c(this, a, m).call(this);
  }
  render() {
    return s`
      <div class="dashboard">
        <uui-box headline="Notes Wiki">
          <div class="welcome-content">
            <p>
              Welcome to the Notes Wiki! This is your internal knowledge base for
              documentation, notes, and team information.
            </p>
          </div>
        </uui-box>

        <uui-box headline="Recent Notes" class="recent-notes">
          ${c(this, a, g).call(this)}
        </uui-box>

        <uui-box headline="Getting Started" class="getting-started">
          <ul>
            <li>Use the tree on the left to browse notes and folders</li>
            <li>Right-click on the tree to create new notes or folders</li>
            <li>Use tags to organize your notes</li>
          </ul>
        </uui-box>
      </div>
    `;
  }
};
a = /* @__PURE__ */ new WeakSet();
m = async function() {
  this._loading = !0;
  try {
    const e = await x.getRecentNotes({
      query: { count: 5 }
    });
    this._recentNotes = e.data ?? [];
  } catch (e) {
    console.error("Error loading recent notes:", e), this._recentNotes = [];
  } finally {
    this._loading = !1;
  }
};
v = function(e) {
  const t = N.generateAbsolute({
    unique: e.unique
  });
  history.pushState({}, "", t);
};
f = function(e) {
  return new Date(e).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
g = function() {
  return this._loading ? s`
        <div class="loading-state">
          <uui-loader></uui-loader>
        </div>
      ` : this._recentNotes.length === 0 ? s`
        <div class="empty-state">
          <uui-icon name="icon-notepad"></uui-icon>
          <p>No notes yet. Right-click in the tree to create your first note!</p>
        </div>
      ` : s`
      <div class="notes-list">
        ${this._recentNotes.map(
    (e) => s`
            <button
              class="note-item"
              @click=${() => c(this, a, v).call(this, e)}
            >
              <uui-icon name="icon-notepad"></uui-icon>
              <div class="note-info">
                <span class="note-title">${e.title || "Untitled"}</span>
                <span class="note-date">Modified ${c(this, a, f).call(this, e.modifiedDate)}</span>
              </div>
              <uui-icon name="icon-arrow-right" class="arrow"></uui-icon>
            </button>
          `
  )}
      </div>
    `;
};
r.styles = _`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    .dashboard {
      display: grid;
      gap: var(--uui-size-layout-1);
      max-width: 1200px;
    }

    .welcome-content p {
      margin: 0;
      color: var(--uui-color-text-alt);
    }

    .recent-notes,
    .getting-started {
      margin-top: var(--uui-size-space-3);
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: var(--uui-size-space-6);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--uui-size-space-6);
      color: var(--uui-color-text-alt);
    }

    .empty-state uui-icon {
      font-size: 48px;
      margin-bottom: var(--uui-size-space-4);
      opacity: 0.5;
    }

    .notes-list {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
    }

    .note-item {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3);
      padding: var(--uui-size-space-3) var(--uui-size-space-4);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      background: var(--uui-color-surface);
      cursor: pointer;
      text-align: left;
      width: 100%;
      transition: background-color 0.1s ease;
    }

    .note-item:hover {
      background: var(--uui-color-surface-emphasis);
    }

    .note-item uui-icon {
      font-size: 1.2rem;
      color: var(--uui-color-text-alt);
    }

    .note-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
    }

    .note-title {
      font-weight: 600;
      color: var(--uui-color-text);
    }

    .note-date {
      font-size: var(--uui-type-small-size);
      color: var(--uui-color-text-alt);
    }

    .note-item .arrow {
      opacity: 0;
      transition: opacity 0.1s ease;
    }

    .note-item:hover .arrow {
      opacity: 1;
    }

    .getting-started ul {
      margin: 0;
      padding-left: var(--uui-size-space-6);
    }

    .getting-started li {
      margin-bottom: var(--uui-size-space-2);
    }
  `;
d([
  p()
], r.prototype, "_recentNotes", 2);
d([
  p()
], r.prototype, "_loading", 2);
r = d([
  y("notes-dashboard-element")
], r);
const T = r;
export {
  r as NotesDashboardElement,
  T as default
};
//# sourceMappingURL=notes-dashboard.element-DjFA-5K9.js.map
