var O = (s) => {
  throw TypeError(s);
};
var U = (s, i, t) => i.has(s) || O("Cannot " + t);
var e = (s, i, t) => (U(s, i, "read from private field"), t ? t.call(s) : i.get(s)), p = (s, i, t) => i.has(s) ? O("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(s) : i.set(s, t), d = (s, i, t, a) => (U(s, i, "write to private field"), a ? a.call(s, t) : i.set(s, t), t);
import { N as C } from "./note-workspace.context-token-Kr8682SQ.js";
import { UmbWorkspaceRouteManager as A } from "@umbraco-cms/backoffice/workspace";
import { c as k, b as P } from "./bundle.manifests-JkEH1cPZ.js";
import { html as q, css as D, state as E, customElement as R } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as $ } from "@umbraco-cms/backoffice/lit-element";
import { UmbStringState as g, UmbArrayState as z, UmbBooleanState as I } from "@umbraco-cms/backoffice/observable-api";
import { UmbContextBase as M } from "@umbraco-cms/backoffice/class-api";
import "./client.gen-m1c42xYY.js";
import { N } from "./sdk.gen-DVGT3O8n.js";
var B = Object.defineProperty, K = Object.getOwnPropertyDescriptor, x = (s) => {
  throw TypeError(s);
}, V = (s, i, t, a) => {
  for (var r = a > 1 ? void 0 : a ? K(i, t) : i, m = s.length - 1, y; m >= 0; m--)
    (y = s[m]) && (r = (a ? y(i, t, r) : y(r)) || r);
  return a && r && B(i, t, r), r;
}, T = (s, i, t) => i.has(s) || x("Cannot " + t), w = (s, i, t) => (T(s, i, "read from private field"), i.get(s)), S = (s, i, t) => i.has(s) ? x("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(s) : i.set(s, t), L = (s, i, t, a) => (T(s, i, "write to private field"), i.set(s, t), t), Y = (s, i, t) => (T(s, i, "access private method"), t), v, b, W;
let _ = class extends $ {
  constructor() {
    super(), S(this, b), S(this, v), this._title = "", this._icon = "icon-notepad", this._isNew = !1, this.consumeContext(C, (s) => {
      L(this, v, s), Y(this, b, W).call(this);
    });
  }
  render() {
    const s = this._title || (this._isNew ? "New Note" : "Note");
    return q`
      <umb-workspace-editor alias=${k}>
        <div id="header" slot="header">
          <uui-icon name=${this._icon}></uui-icon>
          <span class="title">${s}</span>
          ${this._isNew ? q`<uui-tag color="positive">New</uui-tag>` : ""}
        </div>
      </umb-workspace-editor>
    `;
  }
};
v = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakSet();
W = function() {
  w(this, v) && (this.observe(w(this, v).title, (s) => {
    this._title = s || "";
  }), this.observe(w(this, v).icon, (s) => {
    this._icon = s || "icon-notepad";
  }), this.observe(w(this, v).isNew, (s) => {
    this._isNew = s;
  }));
};
_.styles = [
  D`
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
V([
  E()
], _.prototype, "_title", 2);
V([
  E()
], _.prototype, "_icon", 2);
V([
  E()
], _.prototype, "_isNew", 2);
_ = V([
  R("notes-note-workspace-editor")
], _);
var l, n, h, o, f, u, c;
class st extends M {
  constructor(t) {
    super(t, C);
    p(this, l);
    p(this, n);
    p(this, h);
    p(this, o);
    p(this, f);
    p(this, u);
    p(this, c);
    this.workspaceAlias = k, d(this, l, new g(void 0)), this.unique = e(this, l).asObservable(), d(this, n, new g("")), this.title = e(this, n).asObservable(), d(this, h, new g("")), this.content = e(this, h).asObservable(), d(this, o, new z([], (a) => a)), this.tags = e(this, o).asObservable(), d(this, f, new g("icon-notepad")), this.icon = e(this, f).asObservable(), d(this, u, new I(!1)), this.isNew = e(this, u).asObservable(), d(this, c, new g(void 0)), this.parentUnique = e(this, c).asObservable(), this.routes = new A(this), this.routes.setRoutes([
      {
        // Edit existing note
        path: "edit/:unique",
        component: _,
        setup: (a, r) => {
          const m = r.match.params.unique;
          this.load(m);
        }
      },
      {
        // Create new note
        path: "create/parent/:parentEntityType/:parentUnique",
        component: _,
        setup: (a, r) => {
          const m = r.match.params.parentUnique === "null" ? null : r.match.params.parentUnique;
          this.createScaffold(m);
        }
      }
    ]);
  }
  /**
   * Load an existing note from the API
   */
  async load(t) {
    e(this, l).setValue(t), e(this, u).setValue(!1);
    try {
      const r = (await N.getNote({
        path: { id: t }
      })).data;
      e(this, n).setValue(r.title), e(this, h).setValue(r.content), e(this, o).setValue(r.tags || []), e(this, c).setValue(r.parentUnique ?? void 0);
    } catch (a) {
      console.error("Error loading note:", a), e(this, n).setValue("Error loading note");
    }
  }
  /**
   * Create a scaffold for a new note
   */
  createScaffold(t) {
    const a = crypto.randomUUID();
    e(this, l).setValue(a), e(this, u).setValue(!0), e(this, c).setValue(t ?? void 0), e(this, n).setValue(""), e(this, h).setValue(""), e(this, o).setValue([]);
  }
  /**
   * Save the note to the API
   */
  async save() {
    const t = e(this, l).getValue(), a = e(this, u).getValue();
    if (!t) return !1;
    try {
      return a ? await N.createNote({
        body: {
          unique: t,
          parentUnique: e(this, c).getValue() || null,
          title: e(this, n).getValue(),
          content: e(this, h).getValue(),
          tags: e(this, o).getValue()
        }
      }) : await N.updateNote({
        path: { id: t },
        body: {
          title: e(this, n).getValue(),
          content: e(this, h).getValue(),
          tags: e(this, o).getValue()
        }
      }), e(this, u).setValue(!1), !0;
    } catch (r) {
      return console.error("Error saving note:", r), !1;
    }
  }
  // Getters
  getUnique() {
    return e(this, l).getValue();
  }
  getEntityType() {
    return P;
  }
  // Setters for editing
  setTitle(t) {
    e(this, n).setValue(t);
  }
  setContent(t) {
    e(this, h).setValue(t);
  }
  setTags(t) {
    e(this, o).setValue(t);
  }
  addTag(t) {
    const a = e(this, o).getValue();
    a.includes(t) || e(this, o).setValue([...a, t]);
  }
  removeTag(t) {
    const a = e(this, o).getValue();
    e(this, o).setValue(a.filter((r) => r !== t));
  }
  destroy() {
    e(this, l).destroy(), e(this, n).destroy(), e(this, h).destroy(), e(this, o).destroy(), e(this, f).destroy(), e(this, u).destroy(), e(this, c).destroy(), super.destroy();
  }
}
l = new WeakMap(), n = new WeakMap(), h = new WeakMap(), o = new WeakMap(), f = new WeakMap(), u = new WeakMap(), c = new WeakMap();
export {
  st as NoteWorkspaceContext,
  st as api
};
//# sourceMappingURL=note-workspace.context-DJIWmnIf.js.map
