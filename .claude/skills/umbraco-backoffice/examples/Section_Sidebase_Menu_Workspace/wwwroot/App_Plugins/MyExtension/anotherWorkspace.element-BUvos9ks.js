import { EXAMPLE_COUNTER_CONTEXT as f } from "./context-CsyCCYx7.js";
import { UmbTextStyles as C } from "@umbraco-cms/backoffice/style";
import { LitElement as m, html as w, css as x, state as E, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as A } from "@umbraco-cms/backoffice/element-api";
var O = Object.defineProperty, T = Object.getOwnPropertyDescriptor, v = (t) => {
  throw TypeError(t);
}, _ = (t, e, r, o) => {
  for (var s = o > 1 ? void 0 : o ? T(e, r) : e, i = t.length - 1, u; i >= 0; i--)
    (u = t[i]) && (s = (o ? u(e, r, s) : u(s)) || s);
  return o && s && O(e, r, s), s;
}, p = (t, e, r) => e.has(t) || v("Cannot " + r), h = (t, e, r) => (p(t, e, "read from private field"), e.get(t)), l = (t, e, r) => e.has(t) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), W = (t, e, r, o) => (p(t, e, "write to private field"), e.set(t, r), r), k = (t, e, r) => (p(t, e, "access private method"), r), a, c, d;
let n = class extends A(m) {
  constructor() {
    super(), l(this, c), l(this, a), this.count = 0, this.consumeContext(f, (t) => {
      W(this, a, t), k(this, c, d).call(this);
    });
  }
  render() {
    return w`
			<uui-box class="uui-text">
				<h1 class="uui-h2">Another Counter Example</h1>
				<p class="uui-lead">Current count value: ${this.count}</p>
				<p>This workspace view consumes the Counter Context and displays the current count.</p>
			</uui-box>
		`;
  }
};
a = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakSet();
d = function() {
  h(this, a) && this.observe(h(this, a).counter, (t) => {
    this.count = t;
  });
};
n.styles = [
  C,
  x`
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
  y("another-counter-workspace-view")
], n);
const U = n;
export {
  n as AnotherCounterWorkspaceView,
  U as default
};
//# sourceMappingURL=anotherWorkspace.element-BUvos9ks.js.map
