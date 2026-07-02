import { html as h, css as _, property as p, state as c, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as y } from "@umbraco-cms/backoffice/lit-element";
import { UmbChangeEvent as d } from "@umbraco-cms/backoffice/event";
var m = Object.defineProperty, x = Object.getOwnPropertyDescriptor, v = (e) => {
  throw TypeError(e);
}, n = (e, t, a, l) => {
  for (var r = l > 1 ? void 0 : l ? x(t, a) : t, i = e.length - 1, u; i >= 0; i--)
    (u = e[i]) && (r = (l ? u(t, a, r) : u(r)) || r);
  return l && r && m(t, a, r), r;
}, E = (e, t, a) => t.has(e) || v("Cannot " + a), g = (e, t, a) => (E(e, t, "read from private field"), a ? a.call(e) : t.get(e)), w = (e, t, a) => t.has(e) ? v("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), o;
let s = class extends y {
  constructor() {
    super(...arguments), this.value = "", w(this, o, (e) => {
      const t = e.target.value;
      t !== this.value && (this.value = t, this.dispatchEvent(new d()));
    });
  }
  set config(e) {
    this._styleValue = e?.getValueByAlias("styleValue") ?? "";
  }
  render() {
    return h`
            <uui-input
              .value=${this.value ?? ""}
              .style=${this._styleValue}
              type="text"
              @input=${g(this, o)}></uui-input>
        `;
  }
};
o = /* @__PURE__ */ new WeakMap();
s.styles = _`
        uui-input {
          width: 100%;
        }
    `;
n([
  p()
], s.prototype, "value", 2);
n([
  c()
], s.prototype, "_styleValue", 2);
n([
  p({ attribute: !1 })
], s.prototype, "config", 1);
s = n([
  f("styled-textbox")
], s);
const P = s;
export {
  s as StyledTextboxUiElement,
  P as default
};
//# sourceMappingURL=styledtext.ui.element-ucpr2qZa.js.map
