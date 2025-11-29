/**
 * Folder Workspace Context
 *
 * The workspace context manages the state and operations for editing a folder.
 * Folders are simpler than notes - they only have a name.
 *
 * Skills used: umbraco-workspace, umbraco-context-api, umbraco-state-management
 */

import { FOLDER_WORKSPACE_CONTEXT } from "./folder-workspace.context-token.js";
import { NOTES_FOLDER_WORKSPACE_ALIAS } from "../manifest.js";
import { FolderWorkspaceEditorElement } from "./folder-workspace-editor.element.js";
import { UmbWorkspaceRouteManager } from "@umbraco-cms/backoffice/workspace";
import { UmbStringState, UmbBooleanState } from "@umbraco-cms/backoffice/observable-api";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbContextBase } from "@umbraco-cms/backoffice/class-api";
import { NOTES_FOLDER_ENTITY_TYPE } from "../../constants.js";
import { NoteswikiService } from "../../api/index.js";

/**
 * Workspace context for editing folders
 */
export class FolderWorkspaceContext extends UmbContextBase {
  public readonly workspaceAlias = NOTES_FOLDER_WORKSPACE_ALIAS;

  // Observable state
  #unique = new UmbStringState(undefined);
  readonly unique = this.#unique.asObservable();

  #name = new UmbStringState("");
  readonly name = this.#name.asObservable();

  #icon = new UmbStringState("icon-folder");
  readonly icon = this.#icon.asObservable();

  #isNew = new UmbBooleanState(false);
  readonly isNew = this.#isNew.asObservable();

  #parentUnique = new UmbStringState(undefined);
  readonly parentUnique = this.#parentUnique.asObservable();

  // Route manager for workspace navigation
  readonly routes = new UmbWorkspaceRouteManager(this);

  constructor(host: UmbControllerHost) {
    super(host, FOLDER_WORKSPACE_CONTEXT);

    // Define workspace routes
    this.routes.setRoutes([
      {
        // Edit existing folder
        path: "edit/:unique",
        component: FolderWorkspaceEditorElement,
        setup: (_component, info) => {
          const unique = info.match.params.unique;
          this.load(unique);
        },
      },
      {
        // Create new folder
        path: "create/parent/:parentEntityType/:parentUnique",
        component: FolderWorkspaceEditorElement,
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
   * Load an existing folder from the API
   */
  async load(unique: string) {
    this.#unique.setValue(unique);
    this.#isNew.setValue(false);

    try {
      const response = await NoteswikiService.getFolder({
        path: { id: unique },
      });

      const data = response.data;
      this.#name.setValue(data.name);
      this.#parentUnique.setValue(data.parentUnique ?? undefined);
    } catch (error) {
      console.error("Error loading folder:", error);
      this.#name.setValue("Error loading folder");
    }
  }

  /**
   * Create a scaffold for a new folder
   */
  createScaffold(parentUnique: string | null) {
    const newUnique = crypto.randomUUID();
    this.#unique.setValue(newUnique);
    this.#isNew.setValue(true);
    this.#parentUnique.setValue(parentUnique ?? undefined);
    this.#name.setValue("");
  }

  /**
   * Save the folder to the API
   */
  async save(): Promise<boolean> {
    const unique = this.#unique.getValue();
    const isNew = this.#isNew.getValue();

    if (!unique) return false;

    try {
      if (isNew) {
        await NoteswikiService.createFolder({
          body: {
            unique,
            parentUnique: this.#parentUnique.getValue() || null,
            name: this.#name.getValue(),
          },
        });
      } else {
        await NoteswikiService.updateFolder({
          path: { id: unique },
          body: {
            name: this.#name.getValue(),
          },
        });
      }

      this.#isNew.setValue(false);
      return true;
    } catch (error) {
      console.error("Error saving folder:", error);
      return false;
    }
  }

  // Getters
  getUnique() {
    return this.#unique.getValue();
  }

  getEntityType() {
    return NOTES_FOLDER_ENTITY_TYPE;
  }

  // Setters for editing
  setName(name: string) {
    this.#name.setValue(name);
  }

  override destroy() {
    this.#unique.destroy();
    this.#name.destroy();
    this.#icon.destroy();
    this.#isNew.destroy();
    this.#parentUnique.destroy();
    super.destroy();
  }
}

export { FolderWorkspaceContext as api };
