var A = (e) => {
  throw TypeError(e);
};
var N = (e, t, i) => t.has(e) || A("Cannot " + i);
var o = (e, t, i) => (N(e, t, "read from private field"), i ? i.call(e) : t.get(e)), y = (e, t, i) => t.has(e) ? A("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), b = (e, t, i, r) => (N(e, t, "write to private field"), r ? r.call(e, i) : t.set(e, i), i);
import { a as x, d as V } from "./bundle.manifests-CPE-rfRR.js";
import { html as f, css as B, state as v, customElement as Q } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as H } from "@umbraco-cms/backoffice/lit-element";
import { UMB_WORKSPACE_CONTEXT as K, UmbSubmittableWorkspaceContextBase as X } from "@umbraco-cms/backoffice/workspace";
import { UMB_MODAL_MANAGER_CONTEXT as G } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as U } from "@umbraco-cms/backoffice/notification";
import { UMB_ACTION_EVENT_CONTEXT as Y } from "@umbraco-cms/backoffice/action";
import { UmbRequestReloadChildrenOfEntityEvent as j } from "@umbraco-cms/backoffice/entity-action";
import "./client.gen-m1c42xYY.js";
import { N as T } from "./sdk.gen-DVGT3O8n.js";
import { a as F, U as J, b as Z } from "./paths-D8xbqxl6.js";
import { F as ee } from "./rename-folder.modal-token-C9b-4SGR.js";
import { UmbStringState as E } from "@umbraco-cms/backoffice/observable-api";
var te = Object.defineProperty, ie = Object.getOwnPropertyDescriptor, z = (e) => {
  throw TypeError(e);
}, g = (e, t, i, r) => {
  for (var a = r > 1 ? void 0 : r ? ie(t, i) : t, l = e.length - 1, s; l >= 0; l--)
    (s = e[l]) && (a = (r ? s(t, i, a) : s(a)) || a);
  return r && a && te(t, i, a), a;
}, C = (e, t, i) => t.has(e) || z("Cannot " + i), _ = (e, t, i) => (C(e, t, "read from private field"), t.get(e)), q = (e, t, i) => t.has(e) ? z("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), re = (e, t, i, r) => (C(e, t, "write to private field"), t.set(e, i), i), u = (e, t, i) => (C(e, t, "access private method"), i), m, n, S, k, P, M, R, $, W, O, D, I;
let p = class extends H {
  constructor() {
    super(), q(this, n), q(this, m), this._name = "", this._children = [], this._loading = !0, this._searchQuery = "", this._createMenuOpen = !1, this.consumeContext(K, (e) => {
      re(this, m, e), u(this, n, S).call(this);
    });
  }
  render() {
    return f`
      <umb-workspace-editor alias="Notes.Workspace.Folder">
        <div id="header" slot="header">
          <uui-icon name="icon-folder"></uui-icon>
          <span>${this._name || "Loading..."}</span>
        </div>
        <div class="content">
          ${u(this, n, D).call(this)}
          ${u(this, n, I).call(this)}
        </div>
      </umb-workspace-editor>
    `;
  }
};
m = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakSet();
S = function() {
  _(this, m) && (this.observe(_(this, m).name, (e) => {
    this._name = e;
  }), this.observe(_(this, m).unique, (e) => {
    e && u(this, n, k).call(this, e);
  }));
};
k = async function(e) {
  this._loading = !0;
  try {
    const t = await T.getChildren({
      path: { parentId: e }
    });
    this._children = t.data.items.map((i) => ({
      unique: i.id,
      name: i.name,
      isFolder: i.isFolder,
      icon: i.isFolder ? "icon-folder" : "icon-notepad"
    }));
  } catch (t) {
    console.error("Error loading children:", t), this._children = [];
  } finally {
    this._loading = !1;
  }
};
P = function(e) {
  return e.isFolder ? F.generateAbsolute({
    unique: e.unique
  }) : J.generateAbsolute({
    unique: e.unique
  });
};
M = function(e) {
  const t = e.target;
  this._searchQuery = t.value;
};
R = function(e) {
  this._createMenuOpen = e.newState === "open";
};
$ = function() {
  var t;
  const e = (t = _(this, m)) == null ? void 0 : t.getUnique();
  return Z.generateAbsolute({
    parentEntityType: x,
    parentUnique: e ?? "null"
  });
};
W = async function() {
  var a;
  const e = ((a = _(this, m)) == null ? void 0 : a.getUnique()) ?? null, t = await this.getContext(G);
  if (!t) return;
  const r = await t.open(this, ee, {
    data: {
      headline: "Create Folder",
      currentName: "",
      confirmLabel: "Create"
    }
  }).onSubmit().catch(() => {
  });
  if (r != null && r.name)
    try {
      const l = crypto.randomUUID();
      await T.createFolder({
        body: { unique: l, name: r.name, parentUnique: e }
      });
      const s = await this.getContext(U);
      s == null || s.peek("positive", {
        data: {
          headline: "Folder created",
          message: `Folder "${r.name}" has been created.`
        }
      });
      const w = await this.getContext(Y);
      w && w.dispatchEvent(
        new j({
          entityType: x,
          unique: e
        })
      );
      const L = F.generateAbsolute({
        unique: l
      });
      history.pushState({}, "", L);
    } catch (l) {
      console.error("Error creating folder:", l);
      const s = await this.getContext(U);
      s == null || s.peek("danger", {
        data: {
          headline: "Error",
          message: "Failed to create the folder. Please try again."
        }
      });
    }
};
O = function() {
  if (!this._searchQuery.trim())
    return this._children;
  const e = this._searchQuery.toLowerCase();
  return this._children.filter(
    (t) => t.name.toLowerCase().includes(e)
  );
};
D = function() {
  return f`
      <div class="toolbar">
        <uui-button
          popovertarget="create-menu-popover"
          label="Create"
          color="default"
          look="outline"
        >
          Create
          <uui-symbol-expand .open=${this._createMenuOpen}></uui-symbol-expand>
        </uui-button>
        <uui-popover-container
          id="create-menu-popover"
          placement="bottom-start"
          @toggle=${u(this, n, R)}
        >
          <umb-popover-layout>
            <uui-scroll-container>
              <uui-menu-item label="Note" href=${u(this, n, $).call(this)}>
                <umb-icon slot="icon" name="icon-notepad"></umb-icon>
              </uui-menu-item>
              <uui-menu-item label="Folder" @click=${u(this, n, W)}>
                <umb-icon slot="icon" name="icon-folder"></umb-icon>
              </uui-menu-item>
            </uui-scroll-container>
          </umb-popover-layout>
        </uui-popover-container>
        <uui-input
          placeholder="Search in folder..."
          .value=${this._searchQuery}
          @input=${u(this, n, M)}
        ></uui-input>
        <span class="item-count">${u(this, n, O).call(this).length} items</span>
      </div>
    `;
};
I = function() {
  if (this._loading)
    return f`
        <div class="loading">
          <uui-loader></uui-loader>
        </div>
      `;
  const e = u(this, n, O).call(this);
  return this._children.length === 0 ? f`
        <div class="empty-state">
          <uui-icon name="icon-folder"></uui-icon>
          <p>This folder is empty.</p>
          <p>Use the actions menu to create notes or subfolders.</p>
        </div>
      ` : e.length === 0 ? f`
        <div class="empty-state">
          <uui-icon name="icon-search"></uui-icon>
          <p>No items match "${this._searchQuery}"</p>
        </div>
      ` : f`
      <div class="grid">
        ${e.map((t) => f`
          <a class="grid-item" href=${u(this, n, P).call(this, t)}>
            <div class="grid-item-icon">
              <uui-icon name=${t.icon}></uui-icon>
            </div>
            <div class="grid-item-name">${t.name}</div>
          </a>
        `)}
      </div>
    `;
};
p.styles = B`
    :host {
      display: block;
      height: 100%;
    }

    #header {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3);
      font-size: var(--uui-type-h5-size);
      font-weight: 700;
    }

    .content {
      padding: var(--uui-size-space-5);
      height: 100%;
      box-sizing: border-box;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-4);
      margin-bottom: var(--uui-size-space-4);
      position: relative;
    }

    .toolbar uui-input {
      flex: 1;
      max-width: 400px;
    }

    .item-count {
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--uui-size-space-6);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-layout-2);
      color: var(--uui-color-text-alt);
      text-align: center;
    }

    .empty-state uui-icon {
      font-size: 64px;
      margin-bottom: var(--uui-size-space-4);
      opacity: 0.5;
    }

    .empty-state p {
      margin: var(--uui-size-space-1) 0;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      grid-auto-rows: min-content;
      gap: var(--uui-size-space-4);
    }

    .grid-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--uui-size-space-4);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      background: var(--uui-color-surface);
      text-decoration: none;
      color: var(--uui-color-text);
      transition: all 0.1s ease;
      cursor: pointer;
    }

    .grid-item:hover {
      border-color: var(--uui-color-border-emphasis);
      background: var(--uui-color-surface-emphasis);
    }

    .grid-item-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      margin-bottom: var(--uui-size-space-3);
      background: var(--uui-color-surface-alt);
      border-radius: var(--uui-border-radius);
    }

    .grid-item-icon uui-icon {
      font-size: 32px;
      color: var(--uui-color-text-alt);
    }

    .grid-item-name {
      font-size: var(--uui-type-small-size);
      text-align: center;
      word-break: break-word;
      max-width: 100%;
    }
  `;
g([
  v()
], p.prototype, "_name", 2);
g([
  v()
], p.prototype, "_children", 2);
g([
  v()
], p.prototype, "_loading", 2);
g([
  v()
], p.prototype, "_searchQuery", 2);
g([
  v()
], p.prototype, "_createMenuOpen", 2);
p = g([
  Q("folder-workspace-editor-element")
], p);
var c, d, h;
class ve extends X {
  constructor(i) {
    super(i, V);
    y(this, c);
    y(this, d);
    y(this, h);
    b(this, c, new E(void 0)), this.unique = o(this, c).asObservable(), b(this, d, new E("")), this.name = o(this, d).asObservable(), b(this, h, new E(void 0)), this.parentUnique = o(this, h).asObservable(), this.routes.setRoutes([
      {
        // View folder contents
        path: "edit/:unique",
        component: p,
        setup: (r, a) => {
          const l = a.match.params.unique;
          this.load(l);
        }
      }
    ]);
  }
  /**
   * Load folder data from the API
   */
  async load(i) {
    o(this, c).setValue(i);
    try {
      const a = (await T.getFolder({
        path: { id: i }
      })).data;
      o(this, d).setValue(a.name), o(this, h).setValue(a.parentUnique ?? void 0);
    } catch (r) {
      console.error("Error loading folder:", r), o(this, d).setValue("Error loading folder");
    }
  }
  // Getters required by UmbSubmittableWorkspaceContextBase
  getUnique() {
    return o(this, c).getValue();
  }
  getEntityType() {
    return x;
  }
  getData() {
    const i = o(this, c).getValue();
    if (i)
      return {
        unique: i,
        name: o(this, d).getValue(),
        parentUnique: o(this, h).getValue() || null
      };
  }
  /**
   * Submit is a no-op for the read-only folder workspace.
   * Folders are renamed via entity actions, not the workspace.
   */
  async submit() {
  }
  destroy() {
    o(this, c).destroy(), o(this, d).destroy(), o(this, h).destroy(), super.destroy();
  }
}
c = new WeakMap(), d = new WeakMap(), h = new WeakMap();
export {
  ve as FolderWorkspaceContext,
  ve as api
};
//# sourceMappingURL=folder-workspace.context-C9fZTAR5.js.map
