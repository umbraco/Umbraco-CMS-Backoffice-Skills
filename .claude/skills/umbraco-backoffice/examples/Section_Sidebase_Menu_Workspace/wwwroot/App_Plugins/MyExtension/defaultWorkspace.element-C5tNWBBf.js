import { EXAMPLE_COUNTER_CONTEXT as f } from "./context-CsyCCYx7.js";
import { UmbTextStyles as m } from "@umbraco-cms/backoffice/style";
import { LitElement as C, html as x, css as w, state as E, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as O } from "@umbraco-cms/backoffice/element-api";
var T = Object.defineProperty, W = Object.getOwnPropertyDescriptor, v = (e) => {
  throw TypeError(e);
}, _ = (e, t, r, a) => {
  for (var s = a > 1 ? void 0 : a ? W(t, r) : t, i = e.length - 1, u; i >= 0; i--)
    (u = e[i]) && (s = (a ? u(t, r, s) : u(s)) || s);
  return a && s && T(t, r, s), s;
}, c = (e, t, r) => t.has(e) || v("Cannot " + r), l = (e, t, r) => (c(e, t, "read from private field"), t.get(e)), h = (e, t, r) => t.has(e) ? v("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), k = (e, t, r, a) => (c(e, t, "write to private field"), t.set(e, r), r), P = (e, t, r) => (c(e, t, "access private method"), r), o, p, d;
let n = class extends O(C) {
  constructor() {
    super(), h(this, p), h(this, o), this.count = 0, this.consumeContext(f, (e) => {
      k(this, o, e), P(this, p, d).call(this);
    });
  }
  render() {
    return x`
			<uui-box class="uui-text">
				<h1 class="uui-h2">Counter Example</h1>
				<p class="uui-lead">Current count value: ${this.count}</p>
				<p>This workspace view consumes the Counter Context and displays the current count.</p>
			</uui-box>
		`;
  }
};
o = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakSet();
d = function() {
  l(this, o) && this.observe(l(this, o).counter, (e) => {
    this.count = e;
  });
};
n.styles = [
  m,
  w`
			:host {
				display: block;
				padding: var(--uui-size-layout-1);
			}
		`
];
_([
  E()
], n.prototype, "count", 2);
n = _([
  y("example-counter-workspace-view")
], n);
const V = n;
export {
  n as ExampleCounterWorkspaceView,
  V as default
};
//# sourceMappingURL=defaultWorkspace.element-C5tNWBBf.js.map
