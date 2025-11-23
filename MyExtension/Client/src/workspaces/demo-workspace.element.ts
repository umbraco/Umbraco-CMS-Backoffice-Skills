import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, css, html, customElement, state } from "@umbraco-cms/backoffice/external/lit";

@customElement("demo-workspace")
export class DemoWorkspaceElement extends UmbElementMixin(LitElement) {
  @state()
  private _selectedItem?: { unique: string; name: string };

  constructor() {
    super();
  }

  #onTreeSelectionChange(event: CustomEvent) {
    const selection = event.detail.selection;
    if (selection && selection.length > 0) {
      this._selectedItem = {
        unique: selection[0],
        name: `Item ${selection[0]}`,
      };
    }
  }

  render() {
    return html`
      <umb-body-layout header-transparent header-fit-height>
        <div slot="header">
          <umb-workspace-editor-header back-path="section/demo">
            <span slot="name">Demo Workspace</span>
          </umb-workspace-editor-header>
        </div>

        <div class="workspace-content">
          <div class="sidebar">
            <uui-box headline="Demo Tree">
              <umb-tree
                alias="My.Tree.Demo"
                @selection-change=${this.#onTreeSelectionChange}
              ></umb-tree>
            </uui-box>
          </div>

          <div class="main-content">
            <uui-box headline="Content Area">
              ${this._selectedItem
                ? html`
                    <h4>Selected Item</h4>
                    <p><strong>Name:</strong> ${this._selectedItem.name}</p>
                    <p><strong>ID:</strong> ${this._selectedItem.unique}</p>
                  `
                : html`<p>Select an item from the tree to view details</p>`}
            </uui-box>
          </div>
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
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: var(--uui-size-space-4);
      height: 100%;
      padding: var(--uui-size-space-4);
    }

    .sidebar {
      overflow-y: auto;
    }

    .main-content {
      overflow-y: auto;
    }

    h4 {
      margin-top: 0;
    }
  `;
}

export default DemoWorkspaceElement;

declare global {
  interface HTMLElementTagNameMap {
    "demo-workspace": DemoWorkspaceElement;
  }
}
