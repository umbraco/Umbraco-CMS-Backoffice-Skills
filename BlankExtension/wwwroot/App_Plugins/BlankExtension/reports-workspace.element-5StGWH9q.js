import { UmbElementMixin as s } from "@umbraco-cms/backoffice/element-api";
import { LitElement as n, html as b, css as c, customElement as d } from "@umbraco-cms/backoffice/external/lit";
var p = Object.getOwnPropertyDescriptor, h = (a, u, o, i) => {
  for (var e = i > 1 ? void 0 : i ? p(u, o) : u, t = a.length - 1, r; t >= 0; t--)
    (r = a[t]) && (e = r(e) || e);
  return e;
};
let l = class extends s(n) {
  render() {
    return b`
      <umb-body-layout header-transparent header-fit-height>
        <div slot="header">
          <umb-workspace-editor-header back-path="section/blank-extension">
            <span slot="name">Reports</span>
          </umb-workspace-editor-header>
        </div>

        <div class="workspace-content">
          <uui-box headline="Reports">
            <p>View and generate reports here.</p>
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Report Name</uui-table-head-cell>
                <uui-table-head-cell>Date</uui-table-head-cell>
                <uui-table-head-cell>Status</uui-table-head-cell>
              </uui-table-head>
              <uui-table-row>
                <uui-table-cell>Monthly Summary</uui-table-cell>
                <uui-table-cell>2024-01-15</uui-table-cell>
                <uui-table-cell>Complete</uui-table-cell>
              </uui-table-row>
              <uui-table-row>
                <uui-table-cell>User Activity</uui-table-cell>
                <uui-table-cell>2024-01-14</uui-table-cell>
                <uui-table-cell>Pending</uui-table-cell>
              </uui-table-row>
            </uui-table>
          </uui-box>
        </div>
      </umb-body-layout>
    `;
  }
};
l.styles = c`
    :host {
      display: block;
      height: 100%;
    }

    .workspace-content {
      padding: var(--uui-size-space-4);
    }
  `;
l = h([
  d("blank-extension-reports-workspace")
], l);
const w = l;
export {
  l as BlankExtensionReportsWorkspaceElement,
  w as default
};
//# sourceMappingURL=reports-workspace.element-5StGWH9q.js.map
