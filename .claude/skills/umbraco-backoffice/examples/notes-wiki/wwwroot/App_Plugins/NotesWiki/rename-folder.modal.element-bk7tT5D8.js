import { html as f, css as v, state as b, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement as C } from "@umbraco-cms/backoffice/modal";
var E = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, m = (e) => {
  throw TypeError(e);
}, c = (e, t, a, n) => {
  for (var i = n > 1 ? void 0 : n ? $(t, a) : t, u = e.length - 1, s; u >= 0; u--)
    (s = e[u]) && (i = (n ? s(t, a, i) : s(i)) || i);
  return n && i && E(t, a, i), i;
}, w = (e, t, a) => t.has(e) || m("Cannot " + a), k = (e, t, a) => t.has(e) ? m("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), r = (e, t, a) => (w(e, t, "access private method"), a), o, h, d, p, _;
let l = class extends C {
  constructor() {
    super(...arguments), k(this, o), this._name = "";
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), this._name = ((e = this.data) == null ? void 0 : e.currentName) ?? "";
  }
  render() {
    var a, n;
    const e = ((a = this.data) == null ? void 0 : a.headline) ?? "Folder", t = ((n = this.data) == null ? void 0 : n.confirmLabel) ?? "Save";
    return f`
      <umb-body-layout headline=${e}>
        <div id="content">
          <uui-form-layout-item>
            <uui-label slot="label" for="name" required>Name</uui-label>
            <uui-input
              id="name"
              .value=${this._name}
              @input=${r(this, o, h)}
              @keydown=${r(this, o, _)}
              placeholder="Enter folder name"
              required
            ></uui-input>
          </uui-form-layout-item>
        </div>
        <div slot="actions">
          <uui-button
            label="Cancel"
            @click=${r(this, o, p)}
          ></uui-button>
          <uui-button
            label=${t}
            look="primary"
            color="positive"
            @click=${r(this, o, d)}
            ?disabled=${!this._name.trim()}
          ></uui-button>
        </div>
      </umb-body-layout>
    `;
  }
};
o = /* @__PURE__ */ new WeakSet();
h = function(e) {
  const t = e.target;
  this._name = t.value;
};
d = function() {
  var e;
  this._name.trim() && (this.updateValue({ name: this._name.trim() }), (e = this.modalContext) == null || e.submit());
};
p = function() {
  var e;
  (e = this.modalContext) == null || e.reject();
};
_ = function(e) {
  e.key === "Enter" && (e.preventDefault(), r(this, o, d).call(this));
};
l.styles = v`
    #content {
      padding: var(--uui-size-layout-1);
    }

    uui-input {
      width: 100%;
    }
  `;
c([
  b()
], l.prototype, "_name", 2);
l = c([
  y("rename-folder-modal")
], l);
const x = l;
export {
  l as RenameFolderModalElement,
  x as default
};
//# sourceMappingURL=rename-folder.modal.element-bk7tT5D8.js.map
