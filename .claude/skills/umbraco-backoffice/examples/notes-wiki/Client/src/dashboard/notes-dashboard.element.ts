/**
 * Notes Dashboard Element
 *
 * The welcome dashboard for the Notes section.
 * Shows when no note/folder is selected in the tree.
 *
 * Features:
 * - Welcome message
 * - Quick actions to create notes/folders
 * - Search functionality (Phase 4)
 * - Recent notes list (Phase 4)
 *
 * Skills used: umbraco-umbraco-element, umbraco-modals
 */

import { html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";

@customElement("notes-dashboard-element")
export class NotesDashboardElement extends UmbLitElement {
  @state()
  private _searchQuery = "";

  constructor() {
    super();
  }

  #handleSearchInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    this._searchQuery = target.value;
  }

  #handleSearch() {
    if (this._searchQuery.trim()) {
      // TODO: Implement search in Phase 4
      console.log("Searching for:", this._searchQuery);
    }
  }

  #handleCreateNote() {
    // TODO: Open create note modal in Phase 4
    console.log("Create note clicked");
  }

  #handleCreateFolder() {
    // TODO: Open create folder modal in Phase 4
    console.log("Create folder clicked");
  }

  override render() {
    return html`
      <div class="dashboard">
        <uui-box headline="Notes Wiki">
          <div class="welcome-content">
            <p>
              Welcome to the Notes Wiki! This is your internal knowledge base for
              documentation, notes, and team information.
            </p>

            <div class="search-section">
              <uui-input
                placeholder="Search notes..."
                .value=${this._searchQuery}
                @input=${this.#handleSearchInput}
                @keyup=${(e: KeyboardEvent) => e.key === "Enter" && this.#handleSearch()}
              >
                <uui-icon slot="prepend" name="icon-search"></uui-icon>
              </uui-input>
              <uui-button
                look="primary"
                @click=${this.#handleSearch}
                label="Search"
              >
                Search
              </uui-button>
            </div>

            <div class="quick-actions">
              <h3>Quick Actions</h3>
              <div class="action-buttons">
                <uui-button
                  look="primary"
                  color="positive"
                  @click=${this.#handleCreateNote}
                  label="Create Note"
                >
                  <uui-icon name="icon-add"></uui-icon>
                  Create Note
                </uui-button>
                <uui-button
                  look="secondary"
                  @click=${this.#handleCreateFolder}
                  label="Create Folder"
                >
                  <uui-icon name="icon-folder"></uui-icon>
                  Create Folder
                </uui-button>
              </div>
            </div>
          </div>
        </uui-box>

        <uui-box headline="Recent Notes" class="recent-notes">
          <div class="empty-state">
            <uui-icon name="icon-notepad"></uui-icon>
            <p>No recent notes yet. Create your first note to get started!</p>
          </div>
        </uui-box>

        <uui-box headline="Getting Started" class="getting-started">
          <ul>
            <li>Use the tree on the left to browse notes and folders</li>
            <li>Click the + button to create new notes or folders</li>
            <li>Use tags to organize your notes</li>
            <li>Search to quickly find what you're looking for</li>
          </ul>
        </uui-box>
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    .dashboard {
      display: grid;
      gap: var(--uui-size-layout-1);
      max-width: 1200px;
    }

    .welcome-content {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-5);
    }

    .welcome-content p {
      margin: 0;
      color: var(--uui-color-text-alt);
    }

    .search-section {
      display: flex;
      gap: var(--uui-size-space-3);
      max-width: 500px;
    }

    .search-section uui-input {
      flex: 1;
    }

    .quick-actions h3 {
      margin: 0 0 var(--uui-size-space-3);
      font-size: var(--uui-type-small-size);
      text-transform: uppercase;
      color: var(--uui-color-text-alt);
    }

    .action-buttons {
      display: flex;
      gap: var(--uui-size-space-3);
    }

    .recent-notes,
    .getting-started {
      margin-top: var(--uui-size-space-3);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--uui-size-space-6);
      color: var(--uui-color-text-alt);
    }

    .empty-state uui-icon {
      font-size: 48px;
      margin-bottom: var(--uui-size-space-4);
      opacity: 0.5;
    }

    .getting-started ul {
      margin: 0;
      padding-left: var(--uui-size-space-6);
    }

    .getting-started li {
      margin-bottom: var(--uui-size-space-2);
    }
  `;
}

export default NotesDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "notes-dashboard-element": NotesDashboardElement;
  }
}
