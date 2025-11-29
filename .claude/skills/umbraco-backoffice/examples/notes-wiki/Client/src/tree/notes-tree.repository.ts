/**
 * Notes Tree Repository
 *
 * The repository is the main interface for tree data operations.
 * It coordinates between the data source (API) and the store (cache).
 *
 * Skills used: umbraco-repository-pattern, umbraco-tree
 *
 * The repository:
 * - Extends UmbTreeRepositoryBase for standard tree operations
 * - Provides the tree root model
 * - Is registered via manifest and referenced by the tree
 */

import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import type { UmbApi } from "@umbraco-cms/backoffice/extension-api";
import { UmbTreeRepositoryBase } from "@umbraco-cms/backoffice/tree";
import { NotesTreeServerDataSource } from "./notes-tree.server.data-source.js";
import { NOTES_TREE_STORE_CONTEXT } from "./notes-tree.store.js";
import {
  NOTES_ROOT_ENTITY_TYPE,
} from "../constants.js";
import type { NotesTreeItemModel, NotesTreeRootModel } from "./types.js";

/**
 * Repository for Notes tree operations
 */
export class NotesTreeRepository
  extends UmbTreeRepositoryBase<NotesTreeItemModel, NotesTreeRootModel>
  implements UmbApi
{
  constructor(host: UmbControllerHost) {
    super(host, NotesTreeServerDataSource, NOTES_TREE_STORE_CONTEXT);
  }

  /**
   * Returns the root model for the tree.
   * This is displayed when hideTreeRoot is false.
   */
  async requestTreeRoot() {
    const data: NotesTreeRootModel = {
      unique: null,
      entityType: NOTES_ROOT_ENTITY_TYPE,
      name: "Notes",
      icon: "icon-notepad",
      hasChildren: true,
      isFolder: true,
    };

    return { data };
  }
}

export { NotesTreeRepository as api };
