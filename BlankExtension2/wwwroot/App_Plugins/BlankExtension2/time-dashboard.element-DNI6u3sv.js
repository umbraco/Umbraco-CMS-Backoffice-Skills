import { LitElement as d, html as c, css as m, state as u, customElement as p } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as h } from "@umbraco-cms/backoffice/element-api";
var _ = Object.defineProperty, v = Object.getOwnPropertyDescriptor, l = (i, n, s, r) => {
  for (var e = r > 1 ? void 0 : r ? v(n, s) : n, a = i.length - 1, o; a >= 0; a--)
    (o = i[a]) && (e = (r ? o(n, s, e) : o(e)) || e);
  return r && e && _(n, s, e), e;
};
let t = class extends h(d) {
  constructor() {
    super(...arguments), this._currentTime = "";
  }
  connectedCallback() {
    super.connectedCallback(), this._updateTime(), this._intervalId = window.setInterval(() => this._updateTime(), 1e3);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._intervalId && window.clearInterval(this._intervalId);
  }
  _updateTime() {
    const i = /* @__PURE__ */ new Date();
    this._currentTime = i.toLocaleTimeString(void 0, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }
  render() {
    return c`
      <uui-box headline="Current Time">
        <div class="time-display">${this._currentTime}</div>
      </uui-box>
    `;
  }
};
t.styles = m`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    .time-display {
      font-size: 3rem;
      font-weight: bold;
      text-align: center;
      padding: var(--uui-size-space-5);
      font-family: monospace;
    }
  `;
l([
  u()
], t.prototype, "_currentTime", 2);
t = l([
  p("blankextension2-time-dashboard")
], t);
const T = t;
export {
  t as TimeDashboardElement,
  T as default
};
//# sourceMappingURL=time-dashboard.element-DNI6u3sv.js.map
