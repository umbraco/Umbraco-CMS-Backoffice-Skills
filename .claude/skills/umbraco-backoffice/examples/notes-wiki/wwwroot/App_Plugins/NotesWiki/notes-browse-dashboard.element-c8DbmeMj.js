var W = (e) => {
  throw TypeError(e);
};
var B = (e, t, i) => t.has(e) || W("Cannot " + i);
var s = (e, t, i) => (B(e, t, "read from private field"), i ? i.call(e) : t.get(e)), f = (e, t, i) => t.has(e) ? W("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), v = (e, t, i, r) => (B(e, t, "write to private field"), r ? r.call(e, i) : t.set(e, i), i);
import { css as A, property as ue, state as x, customElement as Y, html as c } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as G } from "@umbraco-cms/backoffice/lit-element";
import { UmbControllerBase as ce } from "@umbraco-cms/backoffice/class-api";
import { UmbArrayState as L, UmbNumberState as de, UmbStringState as M } from "@umbraco-cms/backoffice/observable-api";
import { UmbRepositoryBase as he } from "@umbraco-cms/backoffice/repository";
import "./client.gen-m1c42xYY.js";
import { N as $ } from "./sdk.gen-DVGT3O8n.js";
import { N as R, a as pe } from "./bundle.manifests-CPE-rfRR.js";
import { UmbContextToken as me } from "@umbraco-cms/backoffice/context-api";
import { U as fe } from "./paths-D8xbqxl6.js";
class ve {
  constructor() {
  }
  async getCollection(t) {
    var i;
    try {
      if ((i = t.filter) != null && i.trim()) {
        const o = await $.searchNotes({
          query: { q: t.filter }
        });
        return {
          data: {
            items: o.data.results.map((T) => ({
              unique: T.unique,
              entityType: R,
              name: T.title || "Untitled",
              icon: "icon-notepad",
              isFolder: !1,
              modifiedDate: T.modifiedDate
            })),
            total: o.data.totalCount
          }
        };
      }
      let r;
      return t.parentUnique ? r = await $.getChildren({
        path: { parentId: t.parentUnique },
        query: {
          skip: t.skip ?? 0,
          take: t.take ?? 50
        }
      }) : r = await $.getRoot({
        query: {
          skip: t.skip ?? 0,
          take: t.take ?? 50
        }
      }), {
        data: {
          items: r.data.items.map((o) => ({
            unique: o.id,
            entityType: o.isFolder ? pe : R,
            name: o.name,
            icon: o.icon,
            isFolder: o.isFolder
          })),
          total: r.data.total
        }
      };
    } catch (r) {
      return console.error("Error fetching collection:", r), { error: r };
    }
  }
}
var F;
class be extends he {
  constructor(i) {
    super(i);
    f(this, F);
    v(this, F, new ve());
  }
  async requestCollection(i) {
    return s(this, F).getCollection(i);
  }
}
F = new WeakMap();
const _e = new me("NotesCollectionContext");
var N, b, y, _, h, g;
class ge extends ce {
  constructor(i) {
    super(i);
    f(this, N);
    f(this, b);
    f(this, y);
    f(this, _);
    f(this, h);
    f(this, g);
    v(this, b, new L([], (r) => r.unique)), this.items = s(this, b).asObservable(), v(this, y, new de(0)), this.totalItems = s(this, y).asObservable(), v(this, _, new M("")), this.filter = s(this, _).asObservable(), v(this, h, new M(void 0)), this.parentUnique = s(this, h).asObservable(), v(this, g, new L([!1], () => "loading")), this.loading = s(this, g).asObservable(), this.provideContext(_e, this), v(this, N, new be(i));
  }
  async load() {
    s(this, g).setValue([!0]);
    const i = {
      filter: s(this, _).getValue() || void 0,
      parentUnique: s(this, h).getValue() ?? null,
      skip: 0,
      take: 100
    }, { data: r, error: a } = await s(this, N).requestCollection(i);
    r && (s(this, b).setValue(r.items), s(this, y).setValue(r.total)), a && console.error("Error loading collection:", a), s(this, g).setValue([!1]);
  }
  setFilter(i) {
    s(this, _).setValue(i), this.load();
  }
  setParentUnique(i) {
    s(this, h).setValue(i ?? void 0), this.load();
  }
  getItems() {
    return s(this, b).getValue();
  }
  getParentUnique() {
    return s(this, h).getValue() ?? null;
  }
  destroy() {
    s(this, b).destroy(), s(this, y).destroy(), s(this, _).destroy(), s(this, h).destroy(), s(this, g).destroy();
  }
}
N = new WeakMap(), b = new WeakMap(), y = new WeakMap(), _ = new WeakMap(), h = new WeakMap(), g = new WeakMap();
var ye = Object.defineProperty, we = Object.getOwnPropertyDescriptor, H = (e) => {
  throw TypeError(e);
}, w = (e, t, i, r) => {
  for (var a = r > 1 ? void 0 : r ? we(t, i) : t, o = e.length - 1, m; o >= 0; o--)
    (m = e[o]) && (a = (r ? m(t, i, a) : m(a)) || a);
  return r && a && ye(t, i, a), a;
}, D = (e, t, i) => t.has(e) || H("Cannot " + i), u = (e, t, i) => (D(e, t, "read from private field"), i ? i.call(e) : t.get(e)), O = (e, t, i) => t.has(e) ? H("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), K = (e, t, i, r) => (D(e, t, "write to private field"), t.set(e, i), i), d = (e, t, i) => (D(e, t, "access private method"), i), n, k, l, X, J, Q, Z, j, ee, te, ie, re, se, ae;
let p = class extends G {
  constructor() {
    super(), O(this, l), O(this, n), this.initialFolderUnique = null, this._items = [], this._loading = !1, this._filter = "", this._totalItems = 0, this._breadcrumbs = [{ unique: null, name: "Notes" }], O(this, k, !1), K(this, n, new ge(this)), this.observe(u(this, n).items, (e) => {
      this._items = e;
    }), this.observe(u(this, n).loading, (e) => {
      this._loading = e[0] ?? !1;
    }), this.observe(u(this, n).totalItems, (e) => {
      this._totalItems = e;
    });
  }
  connectedCallback() {
    super.connectedCallback(), d(this, l, X).call(this);
  }
  updated(e) {
    super.updated(e), e.has("initialFolderUnique") && u(this, k) && this.initialFolderUnique && this.setInitialFolder(this.initialFolderUnique);
  }
  /**
   * Navigate to a specific folder and build breadcrumbs.
   * Called when /folder/<unique> path segment is present.
   * Pass empty string to navigate back to root.
   */
  async setInitialFolder(e) {
    if (!e) {
      this._breadcrumbs = [{ unique: null, name: "Notes" }], this._filter = "", u(this, n).setParentUnique(null);
      return;
    }
    try {
      const i = (await $.getFolder({
        path: { id: e }
      })).data;
      this._breadcrumbs = [
        { unique: null, name: "Notes" },
        { unique: i.unique, name: i.name }
      ], this._filter = "", u(this, n).setParentUnique(e);
    } catch {
      console.error("Failed to load folder:", e), this._breadcrumbs = [{ unique: null, name: "Notes" }], u(this, n).load();
    }
  }
  render() {
    return c`
      ${d(this, l, re).call(this)}
      ${d(this, l, se).call(this)}
    `;
  }
};
n = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
X = async function() {
  u(this, k) || (K(this, k, !0), this.initialFolderUnique ? await this.setInitialFolder(this.initialFolderUnique) : u(this, n).load());
};
J = function(e) {
  const t = e.target;
  this._filter = t.value;
};
Q = function() {
  u(this, n).setFilter(this._filter);
};
Z = function(e) {
  e.key === "Enter" && d(this, l, Q).call(this);
};
j = function(e) {
  this._breadcrumbs = [...this._breadcrumbs, { unique: e.unique, name: e.name }], this._filter = "", u(this, n).setParentUnique(e.unique);
};
ee = function(e) {
  const t = this._breadcrumbs[e];
  this._breadcrumbs = this._breadcrumbs.slice(0, e + 1), this._filter = "", u(this, n).setParentUnique(t.unique);
};
te = function(e) {
  return fe.generateAbsolute({
    unique: e.unique
  });
};
ie = function() {
  return this._breadcrumbs.length <= 1 ? null : c`
      <div class="breadcrumbs">
        ${this._breadcrumbs.map((e, t) => c`
          ${t > 0 ? c`<uui-icon name="icon-arrow-right" class="breadcrumb-separator"></uui-icon>` : ""}
          <button
            class="breadcrumb ${t === this._breadcrumbs.length - 1 ? "current" : ""}"
            @click=${() => d(this, l, ee).call(this, t)}
            ?disabled=${t === this._breadcrumbs.length - 1}
          >
            ${e.name}
          </button>
        `)}
      </div>
    `;
};
re = function() {
  return c`
      <div class="toolbar">
        <div class="toolbar-left">
          <slot name="actions"></slot>
        </div>
        <div class="toolbar-center">
          <uui-input
            placeholder="Type to search..."
            .value=${this._filter}
            @input=${d(this, l, J)}
            @keypress=${d(this, l, Z)}
          ></uui-input>
        </div>
        <div class="toolbar-right">
          <span class="item-count">${this._totalItems} items</span>
        </div>
      </div>
      ${d(this, l, ie).call(this)}
    `;
};
se = function() {
  return this._loading ? c`
        <div class="loading">
          <uui-loader></uui-loader>
        </div>
      ` : this._items.length === 0 ? c`
        <div class="empty-state">
          <uui-icon name="icon-notepad"></uui-icon>
          <p>${this._filter ? "No items match your search." : "No items yet. Create your first note or folder!"}</p>
        </div>
      ` : c`
      <div class="grid">
        ${this._items.map((e) => d(this, l, ae).call(this, e))}
      </div>
    `;
};
ae = function(e) {
  const t = d(this, l, te).call(this, e);
  return e.isFolder ? c`
        <button
          class="grid-item"
          @click=${() => d(this, l, j).call(this, e)}
        >
          <div class="grid-item-icon">
            <uui-icon name=${e.icon}></uui-icon>
          </div>
          <div class="grid-item-name">${e.name}</div>
        </button>
      ` : c`
      <a class="grid-item" href=${t}>
        <div class="grid-item-icon">
          <uui-icon name=${e.icon}></uui-icon>
        </div>
        <div class="grid-item-name">${e.name}</div>
      </a>
    `;
};
p.styles = A`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-4);
      padding: var(--uui-size-space-4) var(--uui-size-space-5);
      border-bottom: 1px solid var(--uui-color-border);
      background: var(--uui-color-surface);
    }

    .toolbar-left {
      display: flex;
      gap: var(--uui-size-space-2);
    }

    .toolbar-center {
      flex: 1;
      max-width: 400px;
    }

    .toolbar-center uui-input {
      width: 100%;
    }

    .toolbar-right {
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      padding: var(--uui-size-space-3) var(--uui-size-space-5);
      background: var(--uui-color-surface-alt);
      border-bottom: 1px solid var(--uui-color-border);
    }

    .breadcrumb {
      background: none;
      border: none;
      padding: var(--uui-size-space-1) var(--uui-size-space-2);
      cursor: pointer;
      color: var(--uui-color-interactive);
      font-size: var(--uui-type-small-size);
      border-radius: var(--uui-border-radius);
    }

    .breadcrumb:hover:not(:disabled) {
      background: var(--uui-color-surface-emphasis);
      text-decoration: underline;
    }

    .breadcrumb:disabled,
    .breadcrumb.current {
      color: var(--uui-color-text);
      cursor: default;
      font-weight: 600;
    }

    .breadcrumb-separator {
      font-size: 10px;
      color: var(--uui-color-text-alt);
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--uui-size-space-6);
      flex: 1;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-layout-2);
      color: var(--uui-color-text-alt);
      flex: 1;
    }

    .empty-state uui-icon {
      font-size: 64px;
      margin-bottom: var(--uui-size-space-4);
      opacity: 0.5;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      grid-auto-rows: min-content;
      gap: var(--uui-size-space-4);
      padding: var(--uui-size-space-5);
      overflow: auto;
      align-content: start;
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
      height: fit-content;
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
w([
  ue({ attribute: !1 })
], p.prototype, "initialFolderUnique", 2);
w([
  x()
], p.prototype, "_items", 2);
w([
  x()
], p.prototype, "_loading", 2);
w([
  x()
], p.prototype, "_filter", 2);
w([
  x()
], p.prototype, "_totalItems", 2);
w([
  x()
], p.prototype, "_breadcrumbs", 2);
p = w([
  Y("notes-collection-element")
], p);
var qe = Object.defineProperty, xe = Object.getOwnPropertyDescriptor, oe = (e) => {
  throw TypeError(e);
}, ne = (e, t, i, r) => {
  for (var a = r > 1 ? void 0 : r ? xe(t, i) : t, o = e.length - 1, m; o >= 0; o--)
    (m = e[o]) && (a = (r ? m(t, i, a) : m(a)) || a);
  return r && a && qe(t, i, a), a;
}, V = (e, t, i) => t.has(e) || oe("Cannot " + i), C = (e, t, i) => (V(e, t, "read from private field"), t.get(e)), I = (e, t, i) => t.has(e) ? oe("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Ce = (e, t, i, r) => (V(e, t, "write to private field"), t.set(e, i), i), P = (e, t, i) => (V(e, t, "access private method"), i), z, q, U, S, le;
let E = class extends G {
  constructor() {
    super(...arguments), I(this, U), this._initialFolderUnique = null, I(this, z, null), I(this, q, () => {
      P(this, U, S).call(this);
    });
  }
  connectedCallback() {
    super.connectedCallback(), P(this, U, S).call(this), window.addEventListener("navigationsuccess", C(this, q)), window.addEventListener("popstate", C(this, q));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("navigationsuccess", C(this, q)), window.removeEventListener("popstate", C(this, q));
  }
  render() {
    return c`
      <notes-collection-element .initialFolderUnique=${this._initialFolderUnique}>
      </notes-collection-element>
    `;
  }
};
z = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
U = /* @__PURE__ */ new WeakSet();
S = function() {
  var i;
  const e = P(this, U, le).call(this, window.location.pathname);
  if (e === C(this, z))
    return;
  Ce(this, z, e), this._initialFolderUnique = e;
  const t = (i = this.shadowRoot) == null ? void 0 : i.querySelector("notes-collection-element");
  t && t.setInitialFolder(e ?? "");
};
le = function(e) {
  const t = e.match(/\/folder\/([^/]+)/);
  return t ? decodeURIComponent(t[1]) : null;
};
E.styles = A`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  `;
ne([
  x()
], E.prototype, "_initialFolderUnique", 2);
E = ne([
  Y("notes-browse-dashboard-element")
], E);
const Se = E;
export {
  E as NotesBrowseDashboardElement,
  Se as default
};
//# sourceMappingURL=notes-browse-dashboard.element-c8DbmeMj.js.map
