import { UmbElementMixin as u } from "@umbraco-cms/backoffice/element-api";
import { LitElement as h, html as c, css as v, state as _, customElement as f } from "@umbraco-cms/backoffice/external/lit";
var g = Object.defineProperty, w = Object.getOwnPropertyDescriptor, m = (t) => {
  throw TypeError(t);
}, d = (t, e, i, a) => {
  for (var n = a > 1 ? void 0 : a ? w(e, i) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (a ? o(e, i, n) : o(n)) || n);
  return a && n && g(e, i, n), n;
}, y = (t, e, i) => e.has(t) || m("Cannot " + i), b = (t, e, i) => e.has(t) ? m("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), x = (t, e, i) => (y(t, e, "access private method"), i), l, p;
let s = class extends u(h) {
  constructor() {
    super(...arguments), b(this, l);
  }
  render() {
    return c`
      <div class="container">
        <div class="sidebar">
          <uui-box headline="Demo Tree">
            <umb-tree
              alias="My.Tree.Demo"
              @selection-change=${x(this, l, p)}
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
    `;
  }
};
l = /* @__PURE__ */ new WeakSet();
p = function(t) {
  if (!t.detail) return;
  const e = t.detail.selection;
  e && e.length > 0 && (this._selectedItem = {
    unique: e[0],
    name: `Item ${e[0]}`
  });
};
s.styles = v`
    :host {
      display: block;
      height: 100%;
    }

    .container {
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
d([
  _()
], s.prototype, "_selectedItem", 2);
s = d([
  f("demo-section-view")
], s);
const I = s;
export {
  s as DemoSectionViewElement,
  I as default
};
//# sourceMappingURL=demo-section-view.element-BsaYm038.js.map
