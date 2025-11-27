import { LitElement as p, html as v, css as h, property as i, state as y, customElement as c } from "@umbraco-cms/backoffice/external/lit";
var f = Object.defineProperty, m = Object.getOwnPropertyDescriptor, r = (s, e, a, u) => {
  for (var t = u > 1 ? void 0 : u ? m(e, a) : e, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (t = (u ? o(e, a, t) : o(t)) || t);
  return u && t && f(e, a, t), t;
};
let l = class extends p {
  constructor() {
    super(...arguments), this.value = "";
  }
  set config(s) {
    this._styleValue = s?.getValueByAlias("styleValue") ?? "";
  }
  onChange(s) {
    const e = s.target.value;
    e !== this.value && (this.value = e, console.log(this.value), this.dispatchEvent(new CustomEvent("property-value-change")));
  }
  render() {
    return v`
            <uui-input
              .value=${this.value ?? ""}
              .style=${this._styleValue}
              type="text"
              @input=${this.onChange}></uui-input>
        `;
  }
};
l.styles = h`
        uui-input {
          width: 100%;
        }`;
r([
  i()
], l.prototype, "value", 2);
r([
  y()
], l.prototype, "_styleValue", 2);
r([
  i({ attribute: !1 })
], l.prototype, "config", 1);
l = r([
  c("styled-textbox")
], l);
const g = l;
export {
  l as StyledTextboxUiElement,
  g as default
};
//# sourceMappingURL=styledtext.ui.element-JMsx80EV.js.map
