import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
  LitElement,
  css,
  html,
  customElement,
} from "@umbraco-cms/backoffice/external/lit";

@customElement("blueprint-workspace")
export class BlueprintWorkspaceElement extends UmbElementMixin(LitElement) {
  render() {
    return html`
        <umb-workspace-editor headline="Blueprint" alias="Blueprint.Workspace" .enforceNoFooter=${true}>
          <uui-box headline='my workspace content'>
              <p>Some content goes here</p>
          </uui-box>
        </umb-workspace-editor>
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

export default BlueprintWorkspaceElement;

declare global {
  interface HTMLElementTagNameMap {
    "blueprint-workspace": BlueprintWorkspaceElement;
  }
}
