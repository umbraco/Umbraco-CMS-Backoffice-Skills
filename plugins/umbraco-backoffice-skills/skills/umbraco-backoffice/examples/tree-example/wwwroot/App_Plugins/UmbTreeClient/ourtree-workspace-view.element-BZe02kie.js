import { O as m } from "./ourtree-workspace.context-token-D6vAhhCS.js";
import { nothing as y, html as b, css as x, state as v, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as g } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as E } from "@umbraco-cms/backoffice/style";
var O = Object.defineProperty, T = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, n = (e, r, t, o) => {
  for (var i = o > 1 ? void 0 : o ? T(r, t) : r, u = e.length - 1, c; u >= 0; u--)
    (c = e[u]) && (i = (o ? c(r, t, i) : c(i)) || i);
  return o && i && O(r, t, i), i;
}, d = (e, r, t) => r.has(e) || h("Cannot " + t), p = (e, r, t) => (d(e, r, "read from private field"), r.get(e)), _ = (e, r, t) => r.has(e) ? h("Cannot add the same private member more than once") : r instanceof WeakSet ? r.add(e) : r.set(e, t), C = (e, r, t, o) => (d(e, r, "write to private field"), r.set(e, t), t), W = (e, r, t) => (d(e, r, "access private method"), t), s, l, f;
let a = class extends g {
  constructor() {
    super(), _(this, l), _(this, s), this.consumeContext(m, (e) => {
      C(this, s, e), W(this, l, f).call(this);
    });
  }
  render() {
    return this._unique ? b`
      <uui-box headline="Tree Item Details">
        <div class="property">
          <div class="property-label">Name</div>
          <div class="property-value">${this._name}</div>
        </div>
        <div class="property">
          <div class="property-label">ID</div>
          <div class="property-value"><code>${this._unique}</code></div>
        </div>
        <div class="property">
          <div class="property-label">Icon</div>
          <div class="property-value">
            <uui-icon name=${this._icon ?? "icon-bug"}></uui-icon>
            <span>${this._icon}</span>
          </div>
        </div>
      </uui-box>
    ` : y;
  }
};
s = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
f = function() {
  p(this, s) && (this.observe(p(this, s).name, (e) => {
    this._name = e;
  }), this.observe(p(this, s).unique, (e) => {
    this._unique = e;
  }), this.observe(p(this, s).icon, (e) => {
    this._icon = e;
  }));
};
a.styles = [
  E,
  x`
      :host {
        display: block;
        padding: var(--uui-size-space-6);
      }

      .property {
        display: flex;
        padding: var(--uui-size-space-4) 0;
        border-bottom: 1px solid var(--uui-color-divider);
      }

      .property:last-child {
        border-bottom: none;
      }

      .property-label {
        flex: 0 0 150px;
        font-weight: 600;
        color: var(--uui-color-text-alt);
      }

      .property-value {
        flex: 1;
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-2);
      }

      code {
        background: var(--uui-color-surface-alt);
        padding: var(--uui-size-space-1) var(--uui-size-space-2);
        border-radius: var(--uui-border-radius);
        font-family: monospace;
      }

      uui-icon {
        font-size: 1.2rem;
      }
    `
];
n([
  v()
], a.prototype, "_name", 2);
n([
  v()
], a.prototype, "_unique", 2);
n([
  v()
], a.prototype, "_icon", 2);
a = n([
  w("our-tree-workspace-view")
], a);
const P = a;
export {
  a as OurTreeWorkspaceViewElement,
  P as default
};
//# sourceMappingURL=ourtree-workspace-view.element-BZe02kie.js.map
