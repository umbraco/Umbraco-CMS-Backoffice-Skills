var U = (e) => {
  throw TypeError(e);
};
var O = (e, s, t) => s.has(e) || U("Cannot " + t);
var i = (e, s, t) => (O(e, s, "read from private field"), t ? t.call(e) : s.get(e)), d = (e, s, t) => s.has(e) ? U("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(e) : s.set(e, t), m = (e, s, t, a) => (O(e, s, "write to private field"), a ? a.call(e, t) : s.set(e, t), t);
import { UmbContextToken as D } from "@umbraco-cms/backoffice/context-api";
import { N as S, d as k } from "./bundle.manifests-JkEH1cPZ.js";
import { UmbWorkspaceRouteManager as P } from "@umbraco-cms/backoffice/workspace";
import { html as V, css as R, state as E, customElement as z } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as A } from "@umbraco-cms/backoffice/lit-element";
import { UmbStringState as _, UmbBooleanState as $ } from "@umbraco-cms/backoffice/observable-api";
import { UmbContextBase as L } from "@umbraco-cms/backoffice/class-api";
import "./client.gen-m1c42xYY.js";
import { N as b } from "./sdk.gen-DVGT3O8n.js";
const F = new D(
  "UmbWorkspaceContext",
  // MUST match UMB_WORKSPACE_CONTEXT for conditions to work
  void 0,
  (e) => {
    var s;
    return ((s = e.getEntityType) == null ? void 0 : s.call(e)) === S;
  }
);
var I = Object.defineProperty, M = Object.getOwnPropertyDescriptor, x = (e) => {
  throw TypeError(e);
}, g = (e, s, t, a) => {
  for (var r = a > 1 ? void 0 : a ? M(s, t) : s, c = e.length - 1, y; c >= 0; c--)
    (y = e[c]) && (r = (a ? y(s, t, r) : y(r)) || r);
  return a && r && I(s, t, r), r;
}, N = (e, s, t) => s.has(e) || x("Cannot " + t), f = (e, s, t) => (N(e, s, "read from private field"), s.get(e)), q = (e, s, t) => s.has(e) ? x("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(e) : s.set(e, t), B = (e, s, t, a) => (N(e, s, "write to private field"), s.set(e, t), t), C = (e, s, t) => (N(e, s, "access private method"), t), h, w, T, W;
let p = class extends A {
  constructor() {
    super(), q(this, w), q(this, h), this._name = "", this._icon = "icon-folder", this._isNew = !1, this.consumeContext(F, (e) => {
      B(this, h, e), C(this, w, T).call(this);
    });
  }
  render() {
    const e = this._name || (this._isNew ? "New Folder" : "Folder");
    return V`
      <umb-workspace-editor alias=${k}>
        <div id="header" slot="header">
          <uui-icon name=${this._icon}></uui-icon>
          <span class="title">${e}</span>
          ${this._isNew ? V`<uui-tag color="positive">New</uui-tag>` : ""}
        </div>

        <div class="content">
          <uui-box headline="Folder Details">
            <div class="form-group">
              <label for="name">Folder Name</label>
              <uui-input
                id="name"
                placeholder="Enter folder name..."
                .value=${this._name}
                @input=${C(this, w, W)}
              ></uui-input>
            </div>
          </uui-box>
        </div>
      </umb-workspace-editor>
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakSet();
T = function() {
  f(this, h) && (this.observe(f(this, h).name, (e) => {
    this._name = e || "";
  }), this.observe(f(this, h).icon, (e) => {
    this._icon = e || "icon-folder";
  }), this.observe(f(this, h).isNew, (e) => {
    this._isNew = e;
  }));
};
W = function(e) {
  var t;
  const s = e.target;
  (t = f(this, h)) == null || t.setName(s.value);
};
p.styles = [
  R`
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

      .content {
        padding: var(--uui-size-layout-1);
      }

      .form-group {
        margin-bottom: var(--uui-size-space-5);
      }

      label {
        display: block;
        margin-bottom: var(--uui-size-space-2);
        font-weight: 600;
        color: var(--uui-color-text);
      }

      uui-input {
        width: 100%;
        max-width: 400px;
      }
    `
];
g([
  E()
], p.prototype, "_name", 2);
g([
  E()
], p.prototype, "_icon", 2);
g([
  E()
], p.prototype, "_isNew", 2);
p = g([
  z("notes-folder-workspace-editor")
], p);
var n, o, v, l, u;
class te extends L {
  constructor(t) {
    super(t, F);
    d(this, n);
    d(this, o);
    d(this, v);
    d(this, l);
    d(this, u);
    this.workspaceAlias = k, m(this, n, new _(void 0)), this.unique = i(this, n).asObservable(), m(this, o, new _("")), this.name = i(this, o).asObservable(), m(this, v, new _("icon-folder")), this.icon = i(this, v).asObservable(), m(this, l, new $(!1)), this.isNew = i(this, l).asObservable(), m(this, u, new _(void 0)), this.parentUnique = i(this, u).asObservable(), this.routes = new P(this), this.routes.setRoutes([
      {
        // Edit existing folder
        path: "edit/:unique",
        component: p,
        setup: (a, r) => {
          const c = r.match.params.unique;
          this.load(c);
        }
      },
      {
        // Create new folder
        path: "create/parent/:parentEntityType/:parentUnique",
        component: p,
        setup: (a, r) => {
          const c = r.match.params.parentUnique === "null" ? null : r.match.params.parentUnique;
          this.createScaffold(c);
        }
      }
    ]);
  }
  /**
   * Load an existing folder from the API
   */
  async load(t) {
    i(this, n).setValue(t), i(this, l).setValue(!1);
    try {
      const r = (await b.getFolder({
        path: { id: t }
      })).data;
      i(this, o).setValue(r.name), i(this, u).setValue(r.parentUnique ?? void 0);
    } catch (a) {
      console.error("Error loading folder:", a), i(this, o).setValue("Error loading folder");
    }
  }
  /**
   * Create a scaffold for a new folder
   */
  createScaffold(t) {
    const a = crypto.randomUUID();
    i(this, n).setValue(a), i(this, l).setValue(!0), i(this, u).setValue(t ?? void 0), i(this, o).setValue("");
  }
  /**
   * Save the folder to the API
   */
  async save() {
    const t = i(this, n).getValue(), a = i(this, l).getValue();
    if (!t) return !1;
    try {
      return a ? await b.createFolder({
        body: {
          unique: t,
          parentUnique: i(this, u).getValue() || null,
          name: i(this, o).getValue()
        }
      }) : await b.updateFolder({
        path: { id: t },
        body: {
          name: i(this, o).getValue()
        }
      }), i(this, l).setValue(!1), !0;
    } catch (r) {
      return console.error("Error saving folder:", r), !1;
    }
  }
  // Getters
  getUnique() {
    return i(this, n).getValue();
  }
  getEntityType() {
    return S;
  }
  // Setters for editing
  setName(t) {
    i(this, o).setValue(t);
  }
  destroy() {
    i(this, n).destroy(), i(this, o).destroy(), i(this, v).destroy(), i(this, l).destroy(), i(this, u).destroy(), super.destroy();
  }
}
n = new WeakMap(), o = new WeakMap(), v = new WeakMap(), l = new WeakMap(), u = new WeakMap();
export {
  te as FolderWorkspaceContext,
  te as api
};
//# sourceMappingURL=folder-workspace.context-BI_liN6A.js.map
