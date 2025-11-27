import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
  LitElement,
  css,
  html,
  customElement,
} from "@umbraco-cms/backoffice/external/lit";

@customElement("blank-extension-settings-workspace")
export class BlankExtensionSettingsWorkspaceElement extends UmbElementMixin(LitElement) {
  render() {
    return html`
      <umb-body-layout header-transparent header-fit-height>
        <div slot="header">
          <umb-workspace-editor-header back-path="section/blank-extension">
            <span slot="name">Settings</span>
          </umb-workspace-editor-header>
        </div>

        <div class="workspace-content">
          <uui-box headline="Extension Settings">
            <p>Configure your extension settings here.</p>
            <uui-form>
              <uui-form-layout-item>
                <uui-label slot="label">Option 1</uui-label>
                <uui-toggle slot="editor"></uui-toggle>
              </uui-form-layout-item>
              <uui-form-layout-item>
                <uui-label slot="label">Option 2</uui-label>
                <uui-input slot="editor" placeholder="Enter value..."></uui-input>
              </uui-form-layout-item>
            </uui-form>
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

export default BlankExtensionSettingsWorkspaceElement;

declare global {
  interface HTMLElementTagNameMap {
    "blank-extension-settings-workspace": BlankExtensionSettingsWorkspaceElement;
  }
}
