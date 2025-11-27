import { UmbElementMixin as u } from "@umbraco-cms/backoffice/element-api";
import { LitElement as m, html as v, css as b, property as n, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { TIME_MANAGEMENT_CONTEXT_TOKEN as y } from "./time.context-DShPQY3b.js";
var _ = Object.defineProperty, x = Object.getOwnPropertyDescriptor, c = (e) => {
  throw TypeError(e);
}, r = (e, t, i, h) => {
  for (var a = h > 1 ? void 0 : h ? x(t, i) : t, d = e.length - 1, p; d >= 0; d--)
    (p = e[d]) && (a = (h ? p(t, i, a) : p(a)) || a);
  return h && a && _(t, i, a), a;
}, g = (e, t, i) => t.has(e) || c("Cannot " + i), l = (e, t, i) => (g(e, t, "read from private field"), t.get(e)), P = (e, t, i) => t.has(e) ? c("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), T = (e, t, i, h) => (g(e, t, "write to private field"), t.set(e, i), i), o;
let s = class extends u(m) {
  constructor() {
    super(), P(this, o), this.isPolling = !1, this.title = "", this.description = "Show the time the server thinks it is.", this.consumeContext(y, (e) => {
      e && (T(this, o, e), this.observe(e.time, (t) => {
        this.time = t;
      }), this.observe(e.date, (t) => {
        this.date = t;
      }), this.observe(e.polling, (t) => {
        this.isPolling = t;
      }));
    });
  }
  connectedCallback() {
    super.connectedCallback(), l(this, o) != null && (l(this, o).getDateAndTime(), l(this, o).togglePolling());
  }
  async getTime() {
    await l(this, o)?.getTime();
  }
  async getDate() {
    await l(this, o)?.getDate();
  }
  toggle() {
    console.log("toggle"), l(this, o)?.togglePolling();
  }
  render() {
    return v`
            <uui-box headline="${this.localize.term("time_name")}">
                <div slot="header">
                    <umb-localize key="time_description"></umb-localize>
                </div>
                <div class="time-box">
                  <h2>${this.time}</h2>
                  <uui-button
                    .disabled=${this.isPolling}
                    @click=${this.getTime} look="primary" color="positive" label="get time"></uui-button>
                </div>

                <div class="time-box">
                  <h2>${this.date}</h2>
                  <uui-button
                    .disabled=${this.isPolling}
                    @click=${this.getDate} look="primary" color="default" label="get date"></uui-button>
                </div>

                <div>
                    <uui-toggle label="update"
                        .checked="${this.isPolling || !1}"
                        @change=${this.toggle}>automatically update</uui-toggle>
                </div>
            </uui-box>
        `;
  }
};
o = /* @__PURE__ */ new WeakMap();
s.styles = b`
        :host {
            display: block;
            padding: 20px;
        }

        .time-box {
            display: flex;
            margin-bottom: 10px;
            justify-content: space-between;
        }
    `;
r([
  n({ type: String })
], s.prototype, "time", 2);
r([
  n({ type: String })
], s.prototype, "date", 2);
r([
  n({ type: Boolean })
], s.prototype, "isPolling", 2);
r([
  n()
], s.prototype, "title", 2);
r([
  n()
], s.prototype, "description", 2);
s = r([
  f("timedashboard-dashboard")
], s);
const C = s;
export {
  s as TimeDashboardDashboard,
  C as default
};
//# sourceMappingURL=dashboard.element-BNDeE0Da.js.map
