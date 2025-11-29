/**
 * Note Content View Element
 *
 * The main editing view for note content (title and body).
 * This is a WorkspaceView that appears as a tab in the workspace.
 *
 * Skills used: umbraco-workspace (WorkspaceView), umbraco-umbraco-element
 */

import { NOTE_WORKSPACE_CONTEXT } from "../note-workspace.context-token.js";
import { css, html, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";

@customElement("notes-note-content-view")
export class NoteContentViewElement extends UmbLitElement {
  #workspaceContext?: typeof NOTE_WORKSPACE_CONTEXT.TYPE;

  @state()
  private _title = "";

  @state()
  private _content = "";

  constructor() {
    super();

    this.consumeContext(NOTE_WORKSPACE_CONTEXT, (instance) => {
      this.#workspaceContext = instance;
      this.#observeData();
    });
  }

  #observeData() {
    if (!this.#workspaceContext) return;

    this.observe(this.#workspaceContext.title, (title) => {
      this._title = title || "";
    });

    this.observe(this.#workspaceContext.content, (content) => {
      this._content = content || "";
    });
  }

  #handleTitleChange(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    this.#workspaceContext?.setTitle(target.value);
  }

  #handleContentChange(e: InputEvent) {
    const target = e.target as HTMLTextAreaElement;
    this.#workspaceContext?.setContent(target.value);
  }

  override render() {
    return html`
      <uui-box>
        <div class="form-group">
          <label for="title">Title</label>
          <uui-input
            id="title"
            placeholder="Enter note title..."
            .value=${this._title}
            @input=${this.#handleTitleChange}
          ></uui-input>
        </div>

        <div class="form-group">
          <label for="content">Content</label>
          <uui-textarea
            id="content"
            placeholder="Write your note content here..."
            .value=${this._content}
            @input=${this.#handleContentChange}
            rows="20"
          ></uui-textarea>
        </div>
      </uui-box>
    `;
  }

  static override readonly styles = [
    css`
      :host {
        display: block;
        padding: var(--uui-size-layout-1);
      }

      .form-group {
        margin-bottom: var(--uui-size-space-5);
      }

      .form-group:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        margin-bottom: var(--uui-size-space-2);
        font-weight: 600;
        color: var(--uui-color-text);
      }

      uui-input {
        width: 100%;
      }

      uui-textarea {
        width: 100%;
        min-height: 400px;
        font-family: var(--uui-font-family);
      }
    `,
  ];
}

export default NoteContentViewElement;

declare global {
  interface HTMLElementTagNameMap {
    "notes-note-content-view": NoteContentViewElement;
  }
}
