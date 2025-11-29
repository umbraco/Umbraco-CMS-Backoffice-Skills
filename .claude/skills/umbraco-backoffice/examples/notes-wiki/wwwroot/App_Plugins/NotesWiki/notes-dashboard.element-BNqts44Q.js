import { html as f, css as g, state as y, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as _ } from "@umbraco-cms/backoffice/lit-element";
var x = Object.defineProperty, k = Object.getOwnPropertyDescriptor, d = (e) => {
  throw TypeError(e);
}, p = (e, t, i, n) => {
  for (var a = n > 1 ? void 0 : n ? k(t, i) : t, u = e.length - 1, c; u >= 0; u--)
    (c = e[u]) && (a = (n ? c(t, i, a) : c(a)) || a);
  return n && a && x(t, i, a), a;
}, z = (e, t, i) => t.has(e) || d("Cannot " + i), C = (e, t, i) => t.has(e) ? d("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), s = (e, t, i) => (z(e, t, "access private method"), i), o, h, l, v, m;
let r = class extends _ {
  constructor() {
    super(), C(this, o), this._searchQuery = "";
  }
  render() {
    return f`
      <div class="dashboard">
        <uui-box headline="Notes Wiki">
          <div class="welcome-content">
            <p>
              Welcome to the Notes Wiki! This is your internal knowledge base for
              documentation, notes, and team information.
            </p>

            <div class="search-section">
              <uui-input
                placeholder="Search notes..."
                .value=${this._searchQuery}
                @input=${s(this, o, h)}
                @keyup=${(e) => e.key === "Enter" && s(this, o, l).call(this)}
              >
                <uui-icon slot="prepend" name="icon-search"></uui-icon>
              </uui-input>
              <uui-button
                look="primary"
                @click=${s(this, o, l)}
                label="Search"
              >
                Search
              </uui-button>
            </div>

            <div class="quick-actions">
              <h3>Quick Actions</h3>
              <div class="action-buttons">
                <uui-button
                  look="primary"
                  color="positive"
                  @click=${s(this, o, v)}
                  label="Create Note"
                >
                  <uui-icon name="icon-add"></uui-icon>
                  Create Note
                </uui-button>
                <uui-button
                  look="secondary"
                  @click=${s(this, o, m)}
                  label="Create Folder"
                >
                  <uui-icon name="icon-folder"></uui-icon>
                  Create Folder
                </uui-button>
              </div>
            </div>
          </div>
        </uui-box>

        <uui-box headline="Recent Notes" class="recent-notes">
          <div class="empty-state">
            <uui-icon name="icon-notepad"></uui-icon>
            <p>No recent notes yet. Create your first note to get started!</p>
          </div>
        </uui-box>

        <uui-box headline="Getting Started" class="getting-started">
          <ul>
            <li>Use the tree on the left to browse notes and folders</li>
            <li>Click the + button to create new notes or folders</li>
            <li>Use tags to organize your notes</li>
            <li>Search to quickly find what you're looking for</li>
          </ul>
        </uui-box>
      </div>
    `;
  }
};
o = /* @__PURE__ */ new WeakSet();
h = function(e) {
  const t = e.target;
  this._searchQuery = t.value;
};
l = function() {
  this._searchQuery.trim() && console.log("Searching for:", this._searchQuery);
};
v = function() {
  console.log("Create note clicked");
};
m = function() {
  console.log("Create folder clicked");
};
r.styles = g`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    .dashboard {
      display: grid;
      gap: var(--uui-size-layout-1);
      max-width: 1200px;
    }

    .welcome-content {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-5);
    }

    .welcome-content p {
      margin: 0;
      color: var(--uui-color-text-alt);
    }

    .search-section {
      display: flex;
      gap: var(--uui-size-space-3);
      max-width: 500px;
    }

    .search-section uui-input {
      flex: 1;
    }

    .quick-actions h3 {
      margin: 0 0 var(--uui-size-space-3);
      font-size: var(--uui-type-small-size);
      text-transform: uppercase;
      color: var(--uui-color-text-alt);
    }

    .action-buttons {
      display: flex;
      gap: var(--uui-size-space-3);
    }

    .recent-notes,
    .getting-started {
      margin-top: var(--uui-size-space-3);
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

    .getting-started ul {
      margin: 0;
      padding-left: var(--uui-size-space-6);
    }

    .getting-started li {
      margin-bottom: var(--uui-size-space-2);
    }
  `;
p([
  y()
], r.prototype, "_searchQuery", 2);
r = p([
  b("notes-dashboard-element")
], r);
const S = r;
export {
  r as NotesDashboardElement,
  S as default
};
//# sourceMappingURL=notes-dashboard.element-BNqts44Q.js.map
