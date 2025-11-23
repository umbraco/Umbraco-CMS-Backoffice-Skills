import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";

@customElement("demo-section-view")
export class DemoSectionViewElement extends UmbElementMixin(LitElement) {
  @state()
  private _selectedItem?: { unique: string; name: string };

  #onTreeSelectionChange(event: CustomEvent) {
    if (!event.detail) return;

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
      <div class="container">
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
    `;
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .container {
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

export default DemoSectionViewElement;

declare global {
  interface HTMLElementTagNameMap {
    "demo-section-view": DemoSectionViewElement;
  }
}
