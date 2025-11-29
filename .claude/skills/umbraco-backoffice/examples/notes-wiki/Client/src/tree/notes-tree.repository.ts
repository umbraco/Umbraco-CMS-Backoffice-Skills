/**
 * @fileoverview Notes Tree Repository
 *
 * The repository is the main interface for tree data operations in the
 * Umbraco backoffice. It implements the Repository Pattern to coordinate
 * between the data source (API) and the store (cache).
 *
 * **Architecture Overview:**
 *
 * ```
 * Tree UI ─────> Repository ─────> Data Source ─────> API
 *                    │
 *                    └──────────> Store (Cache)
 * ```
 *
 * **Repository Pattern Benefits:**
 *
 * 1. **Abstraction**: Tree UI doesn't know about API details
 * 2. **Caching**: Store provides transparent caching
 * 3. **Testability**: Easy to mock for unit tests
 * 4. **Consistency**: Standard Umbraco tree operations
 *
 * **Registration:**
 *
 * The repository is registered via manifest and referenced by the tree:
 *
 * ```typescript
 * // In tree manifest
 * {
 *   type: "tree",
 *   meta: {
 *     repositoryAlias: NOTES_TREE_REPOSITORY_ALIAS,
 *   },
 * }
 *
 * // Repository manifest
 * {
 *   type: "repository",
 *   alias: NOTES_TREE_REPOSITORY_ALIAS,
 *   api: () => import("./notes-tree.repository.js"),
 * }
 * ```
 *
 * Skills demonstrated: umbraco-repository-pattern, umbraco-tree
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
 * Repository for Notes tree operations.
 *
 * Extends `UmbTreeRepositoryBase` which provides standard tree operations:
 * - `requestRootTreeItems()` - Get items at the root level
 * - `requestTreeItemsOf(parent)` - Get children of a parent item
 * - `requestTreeRoot()` - Get the virtual root model
 *
 * **Type Parameters:**
 * - `NotesTreeItemModel` - The shape of tree items (notes and folders)
 * - `NotesTreeRootModel` - The shape of the tree root
 *
 * **Constructor Parameters:**
 * - Data source class: Handles API communication
 * - Store context: Provides caching via dependency injection
 *
 * @implements {UmbApi} - Required for Umbraco extension registration
 *
 * @example
 * // The repository is typically consumed via context in a component:
 * const repository = await this.getContext(NOTES_TREE_REPOSITORY_CONTEXT);
 * const { data } = await repository.requestRootTreeItems();
 * console.log(data); // Array of NotesTreeItemModel
 */
export class NotesTreeRepository
  extends UmbTreeRepositoryBase<NotesTreeItemModel, NotesTreeRootModel>
  implements UmbApi
{
  /**
   * Creates a new Notes tree repository.
   *
   * @param {UmbControllerHost} host - The controller host for context consumption.
   *   This is typically the component or context that creates the repository.
   */
  constructor(host: UmbControllerHost) {
    super(host, NotesTreeServerDataSource, NOTES_TREE_STORE_CONTEXT);
  }

  /**
   * Returns the root model for the tree.
   *
   * The tree root is a virtual item that represents the top of the hierarchy.
   * It's displayed when `hideTreeRoot: false` in the tree manifest.
   *
   * **Why is this needed?**
   *
   * Unlike regular tree items that come from the API, the root is synthetic.
   * It provides:
   * - A consistent top-level item for navigation
   * - A target for "Create at root" actions
   * - An entity type for root-level entity actions
   *
   * @returns {Promise<{data: NotesTreeRootModel}>} The tree root model
   *
   * @example
   * const { data: root } = await repository.requestTreeRoot();
   * console.log(root.entityType); // "notes-root"
   * console.log(root.name);       // "Notes"
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

/**
 * Export the repository class as `api` for Umbraco's extension loader.
 *
 * When the manifest specifies `api: () => import("./notes-tree.repository.js")`,
 * Umbraco looks for the `api` export to instantiate the repository.
 */
export { NotesTreeRepository as api };
