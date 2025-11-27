import { UmbElementMixin as d } from "@umbraco-cms/backoffice/element-api";
import { LitElement as l, html as p, css as c, customElement as h } from "@umbraco-cms/backoffice/external/lit";
var b = Object.getOwnPropertyDescriptor, m = (t, r, i, o) => {
  for (var e = o > 1 ? void 0 : o ? b(r, i) : r, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (e = n(e) || e);
  return e;
};
let a = class extends d(l) {
  render() {
    return p`
      <umb-body-layout header-transparent header-fit-height>
        <div slot="header">
          <umb-workspace-editor-header back-path="section/blank-extension">
            <span slot="name">Dashboard</span>
          </umb-workspace-editor-header>
        </div>

        <div class="workspace-content">
          <uui-box headline="Dashboard Overview">
            <p>Welcome to the Dashboard workspace!</p>
            <p>This is a central hub for viewing statistics and summaries.</p>
          </uui-box>
        </div>
      </umb-body-layout>
    `;
  }
};
a.styles = c`
    :host {
      display: block;
      height: 100%;
    }

    .workspace-content {
      padding: var(--uui-size-space-4);
    }
  `;
a = m([
  h("blank-extension-dashboard-workspace")
], a);
const v = a;
export {
  a as BlankExtensionDashboardWorkspaceElement,
  v as default
};
//# sourceMappingURL=dashboard-workspace.element-Dzn8_6IR.js.map
