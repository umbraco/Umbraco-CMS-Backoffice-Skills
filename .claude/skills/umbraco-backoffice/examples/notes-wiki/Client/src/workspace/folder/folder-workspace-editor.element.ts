/**
 * Folder Workspace Editor Element
 *
 * The main editor component for the Folder workspace.
 * Folders are simpler than notes - just name editing.
 *
 * Skills used: umbraco-workspace, umbraco-umbraco-element, umbraco-context-api
 */

import { FOLDER_WORKSPACE_CONTEXT } from "./folder-workspace.context-token.js";
import { css, html, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { NOTES_FOLDER_WORKSPACE_ALIAS } from "../manifest.js";

@customElement("notes-folder-workspace-editor")
export class FolderWorkspaceEditorElement extends UmbLitElement {
  #workspaceContext?: typeof FOLDER_WORKSPACE_CONTEXT.TYPE;

  @state()
  private _name = "";

  @state()
  private _icon = "icon-folder";

  @state()
  private _isNew = false;

  constructor() {
    super();

    this.consumeContext(FOLDER_WORKSPACE_CONTEXT, (instance) => {
      this.#workspaceContext = instance;
      this.#observeData();
    });
  }

  #observeData() {
    if (!this.#workspaceContext) return;

    this.observe(this.#workspaceContext.name, (name) => {
      this._name = name || "";
    });

    this.observe(this.#workspaceContext.icon, (icon) => {
      this._icon = icon || "icon-folder";
    });

    this.observe(this.#workspaceContext.isNew, (isNew) => {
      this._isNew = isNew;
    });
  }

  #handleNameChange(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    this.#workspaceContext?.setName(target.value);
  }

  override render() {
    const displayName = this._name || (this._isNew ? "New Folder" : "Folder");

    return html`
      <umb-workspace-editor alias=${NOTES_FOLDER_WORKSPACE_ALIAS}>
        <div id="header" slot="header">
          <uui-icon name=${this._icon}></uui-icon>
          <span class="title">${displayName}</span>
          ${this._isNew ? html`<uui-tag color="positive">New</uui-tag>` : ""}
        </div>

        <div class="content">
          <uui-box headline="Folder Details">
            <div class="form-group">
              <label for="name">Folder Name</label>
              <uui-input
                id="name"
                placeholder="Enter folder name..."
                .value=${this._name}
                @input=${this.#handleNameChange}
              ></uui-input>
            </div>
          </uui-box>
        </div>
      </umb-workspace-editor>
    `;
  }

  static override readonly styles = [
    css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      #header {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-3);
        font-size: 1.2rem;
        font-weight: bold;
      }

      uui-icon {
        font-size: 1.5rem;
      }

      .title {
        flex: 1;
      }

      .content {
        padding: var(--uui-size-layout-1);
      }

      .form-group {
        margin-bottom: var(--uui-size-space-5);
      }

      label {
        display: block;
        margin-bottom: var(--uui-size-space-2);
        font-weight: 600;
        color: var(--uui-color-text);
      }

      uui-input {
        width: 100%;
        max-width: 400px;
      }
    `,
  ];
}

export default FolderWorkspaceEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "notes-folder-workspace-editor": FolderWorkspaceEditorElement;
  }
}
