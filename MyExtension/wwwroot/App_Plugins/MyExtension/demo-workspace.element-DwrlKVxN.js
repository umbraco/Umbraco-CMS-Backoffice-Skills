import { UmbElementMixin as h } from "@umbraco-cms/backoffice/element-api";
import { LitElement as u, html as c, css as v, state as _, customElement as f } from "@umbraco-cms/backoffice/external/lit";
var b = Object.defineProperty, g = Object.getOwnPropertyDescriptor, l = (t) => {
  throw TypeError(t);
}, p = (t, e, a, r) => {
  for (var s = r > 1 ? void 0 : r ? g(e, a) : e, n = t.length - 1, i; n >= 0; n--)
    (i = t[n]) && (s = (r ? i(e, a, s) : i(s)) || s);
  return r && s && b(e, a, s), s;
}, y = (t, e, a) => e.has(t) || l("Cannot " + a), w = (t, e, a) => e.has(t) ? l("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), k = (t, e, a) => (y(t, e, "access private method"), a), d, m;
let o = class extends h(u) {
  constructor() {
    super(), w(this, d);
  }
  render() {
    return c`
      <umb-body-layout header-transparent header-fit-height>
        <div slot="header">
          <umb-workspace-editor-header back-path="section/demo">
            <span slot="name">Demo Workspace</span>
          </umb-workspace-editor-header>
        </div>

        <div class="workspace-content">
          <div class="sidebar">
            <uui-box headline="Demo Tree">
              <umb-tree
                alias="My.Tree.Demo"
                @selection-change=${k(this, d, m)}
              ></umb-tree>
            </uui-box>
          </div>

          <div class="main-content">
            <uui-box headline="Content Area">
              ${this._selectedItem ? c`
                    <h4>Selected Item</h4>
                    <p><strong>Name:</strong> ${this._selectedItem.name}</p>
                    <p><strong>ID:</strong> ${this._selectedItem.unique}</p>
                  ` : c`<p>Select an item from the tree to view details</p>`}
            </uui-box>
          </div>
        </div>
      </umb-body-layout>
    `;
  }
};
d = /* @__PURE__ */ new WeakSet();
m = function(t) {
  const e = t.detail.selection;
  e && e.length > 0 && (this._selectedItem = {
    unique: e[0],
    name: `Item ${e[0]}`
  });
};
o.styles = v`
    :host {
      display: block;
      height: 100%;
    }

    .workspace-content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: var(--uui-size-space-4);
      height: 100%;
      padding: var(--uui-size-space-4);
    }

    .sidebar {
      overflow-y: auto;
    }

    .main-content {
      overflow-y: auto;
    }

    h4 {
      margin-top: 0;
    }
  `;
p([
  _()
], o.prototype, "_selectedItem", 2);
o = p([
  f("demo-workspace")
], o);
const E = o;
export {
  o as DemoWorkspaceElement,
  E as default
};
//# sourceMappingURL=demo-workspace.element-DwrlKVxN.js.map
