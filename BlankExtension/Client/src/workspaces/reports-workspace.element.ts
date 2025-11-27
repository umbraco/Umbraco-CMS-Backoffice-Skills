import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
  LitElement,
  css,
  html,
  customElement,
} from "@umbraco-cms/backoffice/external/lit";

@customElement("blank-extension-reports-workspace")
export class BlankExtensionReportsWorkspaceElement extends UmbElementMixin(LitElement) {
  render() {
    return html`
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

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .workspace-content {
      padding: var(--uui-size-space-4);
    }
  `;
}

export default BlankExtensionReportsWorkspaceElement;

declare global {
  interface HTMLElementTagNameMap {
    "blank-extension-reports-workspace": BlankExtensionReportsWorkspaceElement;
  }
}
