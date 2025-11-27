import { LitElement as s, html as a, css as m, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as c } from "@umbraco-cms/backoffice/element-api";
var d = Object.getOwnPropertyDescriptor, g = (n, i, u, l) => {
  for (var e = l > 1 ? void 0 : l ? d(i, u) : i, t = n.length - 1, r; t >= 0; t--)
    (r = n[t]) && (e = r(e) || e);
  return e;
};
let o = class extends c(s) {
  render() {
    return a`
      <uui-box headline="Quick Links">
        <uui-button
          look="primary"
          color="positive"
          href="https://www.google.com"
          target="_blank"
        >
          <uui-icon name="icon-link"></uui-icon>
          Go to Google
        </uui-button>
      </uui-box>
    `;
  }
};
o.styles = m`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    uui-button {
      font-size: 1.2rem;
    }
  `;
o = g([
  b("blankextension2-google-link-dashboard")
], o);
const k = o;
export {
  o as GoogleLinkDashboardElement,
  k as default
};
//# sourceMappingURL=google-link-dashboard.element-BOCLXqdj.js.map
