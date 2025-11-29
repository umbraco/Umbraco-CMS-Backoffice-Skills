/**
 * Note Workspace Context
 *
 * The workspace context manages the state and operations for editing a note.
 * It provides observable state for reactive UI updates.
 *
 * Skills used: umbraco-workspace, umbraco-context-api, umbraco-state-management
 *
 * Key responsibilities:
 * - Load note data from API
 * - Track changes (dirty state)
 * - Save note to API
 * - Provide observable properties for UI binding
 */

import { NOTE_WORKSPACE_CONTEXT } from "./note-workspace.context-token.js";
import { NOTES_NOTE_WORKSPACE_ALIAS } from "../manifest.js";
import { NoteWorkspaceEditorElement } from "./note-workspace-editor.element.js";
import { UmbWorkspaceRouteManager } from "@umbraco-cms/backoffice/workspace";
import { UmbStringState, UmbArrayState, UmbBooleanState } from "@umbraco-cms/backoffice/observable-api";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbContextBase } from "@umbraco-cms/backoffice/class-api";
import { NOTES_NOTE_ENTITY_TYPE } from "../../constants.js";
import { NoteswikiService } from "../../api/index.js";

/**
 * Workspace context for editing notes
 */
export class NoteWorkspaceContext extends UmbContextBase {
  public readonly workspaceAlias = NOTES_NOTE_WORKSPACE_ALIAS;

  // Observable state
  #unique = new UmbStringState(undefined);
  readonly unique = this.#unique.asObservable();

  #title = new UmbStringState("");
  readonly title = this.#title.asObservable();

  #content = new UmbStringState("");
  readonly content = this.#content.asObservable();

  #tags = new UmbArrayState<string>([], (x) => x);
  readonly tags = this.#tags.asObservable();

  #icon = new UmbStringState("icon-notepad");
  readonly icon = this.#icon.asObservable();

  #isNew = new UmbBooleanState(false);
  readonly isNew = this.#isNew.asObservable();

  #parentUnique = new UmbStringState(undefined);
  readonly parentUnique = this.#parentUnique.asObservable();

  // Route manager for workspace navigation
  readonly routes = new UmbWorkspaceRouteManager(this);

  constructor(host: UmbControllerHost) {
    super(host, NOTE_WORKSPACE_CONTEXT);

    // Define workspace routes
    this.routes.setRoutes([
      {
        // Edit existing note
        path: "edit/:unique",
        component: NoteWorkspaceEditorElement,
        setup: (_component, info) => {
          const unique = info.match.params.unique;
          this.load(unique);
        },
      },
      {
        // Create new note
        path: "create/parent/:parentEntityType/:parentUnique",
        component: NoteWorkspaceEditorElement,
        setup: (_component, info) => {
          const parentUnique =
            info.match.params.parentUnique === "null"
              ? null
              : info.match.params.parentUnique;
          this.createScaffold(parentUnique);
        },
      },
    ]);
  }

  /**
   * Load an existing note from the API
   */
  async load(unique: string) {
    this.#unique.setValue(unique);
    this.#isNew.setValue(false);

    try {
      const response = await NoteswikiService.getNote({
        path: { id: unique },
      });

      const data = response.data;
      this.#title.setValue(data.title);
      this.#content.setValue(data.content);
      this.#tags.setValue(data.tags || []);
      this.#parentUnique.setValue(data.parentUnique ?? undefined);
    } catch (error) {
      console.error("Error loading note:", error);
      // Set default values on error
      this.#title.setValue("Error loading note");
    }
  }

  /**
   * Create a scaffold for a new note
   */
  createScaffold(parentUnique: string | null) {
    const newUnique = crypto.randomUUID();
    this.#unique.setValue(newUnique);
    this.#isNew.setValue(true);
    this.#parentUnique.setValue(parentUnique ?? undefined);
    this.#title.setValue("");
    this.#content.setValue("");
    this.#tags.setValue([]);
  }

  /**
   * Save the note to the API
   */
  async save(): Promise<boolean> {
    const unique = this.#unique.getValue();
    const isNew = this.#isNew.getValue();

    if (!unique) return false;

    try {
      if (isNew) {
        await NoteswikiService.createNote({
          body: {
            unique,
            parentUnique: this.#parentUnique.getValue() || null,
            title: this.#title.getValue(),
            content: this.#content.getValue(),
            tags: this.#tags.getValue(),
          },
        });
      } else {
        await NoteswikiService.updateNote({
          path: { id: unique },
          body: {
            title: this.#title.getValue(),
            content: this.#content.getValue(),
            tags: this.#tags.getValue(),
          },
        });
      }

      this.#isNew.setValue(false);
      return true;
    } catch (error) {
      console.error("Error saving note:", error);
      return false;
    }
  }

  // Getters
  getUnique() {
    return this.#unique.getValue();
  }

  getEntityType() {
    return NOTES_NOTE_ENTITY_TYPE;
  }

  // Setters for editing
  setTitle(title: string) {
    this.#title.setValue(title);
  }

  setContent(content: string) {
    this.#content.setValue(content);
  }

  setTags(tags: string[]) {
    this.#tags.setValue(tags);
  }

  addTag(tag: string) {
    const currentTags = this.#tags.getValue();
    if (!currentTags.includes(tag)) {
      this.#tags.setValue([...currentTags, tag]);
    }
  }

  removeTag(tag: string) {
    const currentTags = this.#tags.getValue();
    this.#tags.setValue(currentTags.filter((t) => t !== tag));
  }

  override destroy() {
    this.#unique.destroy();
    this.#title.destroy();
    this.#content.destroy();
    this.#tags.destroy();
    this.#icon.destroy();
    this.#isNew.destroy();
    this.#parentUnique.destroy();
    super.destroy();
  }
}

export { NoteWorkspaceContext as api };
