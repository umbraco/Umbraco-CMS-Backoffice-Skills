import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
  LitElement,
  css,
  html,
  customElement,
} from "@umbraco-cms/backoffice/external/lit";

@customElement("blank-extension-dashboard-workspace")
export class BlankExtensionDashboardWorkspaceElement extends UmbElementMixin(LitElement) {
  render() {
    return html`
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

export default BlankExtensionDashboardWorkspaceElement;

declare global {
  interface HTMLElementTagNameMap {
    "blank-extension-dashboard-workspace": BlankExtensionDashboardWorkspaceElement;
  }
}
