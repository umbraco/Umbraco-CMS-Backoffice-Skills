/**
 * @fileoverview Notes Tree Server Data Source
 *
 * The data source is responsible for fetching tree data from the C# backend API.
 * It uses the generated OpenAPI client (hey-api) for type-safe API calls.
 *
 * **Role in the Repository Pattern:**
 *
 * ```
 * Repository ─────> Data Source ─────> OpenAPI Client ─────> C# API
 * ```
 *
 * The data source handles the low-level details of:
 * - Making HTTP requests to the tree API endpoints
 * - Transforming API responses to Umbraco tree models
 * - Handling pagination parameters (skip/take)
 *
 * **Required Methods:**
 *
 * The base class `UmbTreeServerDataSourceBase` expects four functions:
 * 1. `getRootItems` - Fetch items at the root level
 * 2. `getChildrenOf` - Fetch children of a parent item
 * 3. `getAncestorsOf` - Fetch ancestors for breadcrumb/path
 * 4. `mapper` - Transform API response to tree item model
 *
 * **Authentication:**
 *
 * The OpenAPI client is configured with Umbraco's auth token in the entry point.
 * All requests automatically include the bearer token for authentication.
 *
 * Skills demonstrated: umbraco-repository-pattern, umbraco-tree, umbraco-openapi-client
 */

import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import type {
  UmbTreeAncestorsOfRequestArgs,
  UmbTreeChildrenOfRequestArgs,
  UmbTreeRootItemsRequestArgs,
} from "@umbraco-cms/backoffice/tree";
import { UmbTreeServerDataSourceBase } from "@umbraco-cms/backoffice/tree";
import {
  NOTES_ROOT_ENTITY_TYPE,
  NOTES_FOLDER_ENTITY_TYPE,
  NOTES_NOTE_ENTITY_TYPE,
} from "../constants.js";
import type { NotesTreeItemModel } from "./types.js";
import type { TreeItemModel } from "../api/index.js";
import { NoteswikiService } from "../api/index.js";

/**
 * Data source for fetching Notes tree data from the server.
 *
 * Extends `UmbTreeServerDataSourceBase` which provides the standard interface
 * expected by tree repositories. The type parameters define:
 * - `TreeItemModel` - The shape of API responses (from OpenAPI types)
 * - `NotesTreeItemModel` - The shape of transformed tree items
 *
 * @example
 * // The data source is typically not used directly.
 * // Instead, it's passed to the repository constructor:
 * class NotesTreeRepository extends UmbTreeRepositoryBase {
 *   constructor(host: UmbControllerHost) {
 *     super(host, NotesTreeServerDataSource, NOTES_TREE_STORE_CONTEXT);
 *   }
 * }
 */
export class NotesTreeServerDataSource extends UmbTreeServerDataSourceBase<
  TreeItemModel,
  NotesTreeItemModel
> {
  /**
   * Creates a new data source instance.
   *
   * @param {UmbControllerHost} host - The controller host (unused but required by base class)
   */
  constructor(host: UmbControllerHost) {
    super(host, {
      getRootItems,
      getChildrenOf,
      getAncestorsOf,
      mapper,
    });
  }
}

/**
 * Fetches root-level tree items from the API.
 *
 * Called when the tree first loads or when requesting root items.
 * Supports pagination via skip/take parameters.
 *
 * @param {UmbTreeRootItemsRequestArgs} args - Request arguments with pagination
 * @param {number} args.skip - Number of items to skip (offset)
 * @param {number} args.take - Maximum number of items to return
 *
 * @returns {Promise<{data: {items: TreeItemModel[], total: number}}>}
 *   Paged response with items and total count
 *
 * @example
 * // Called internally by the repository
 * const result = await getRootItems({ skip: 0, take: 100 });
 * console.log(result.data.items); // Array of API response items
 * console.log(result.data.total); // Total count for pagination
 */
const getRootItems = async (args: UmbTreeRootItemsRequestArgs) => {
  const response = await NoteswikiService.getRoot({
    query: { skip: args.skip, take: args.take },
  });

  // Return paged model format expected by UmbTreeServerDataSourceBase
  return {
    data: {
      items: response.data.items,
      total: response.data.total,
    },
  };
};

/**
 * Fetches children of a parent tree item.
 *
 * Called when expanding a tree node to show its children.
 * If the parent is the root (unique === null), delegates to getRootItems.
 *
 * @param {UmbTreeChildrenOfRequestArgs} args - Request arguments
 * @param {Object} args.parent - Parent item reference
 * @param {string|null} args.parent.unique - Parent's unique ID, null for root
 * @param {number} args.skip - Number of items to skip
 * @param {number} args.take - Maximum number of items to return
 *
 * @returns {Promise<{data: {items: TreeItemModel[], total: number}}>}
 *   Paged response with child items
 *
 * @example
 * // Fetch children of folder "abc-123"
 * const result = await getChildrenOf({
 *   parent: { unique: "abc-123", entityType: NOTES_FOLDER_ENTITY_TYPE },
 *   skip: 0,
 *   take: 100,
 * });
 */
const getChildrenOf = async (args: UmbTreeChildrenOfRequestArgs) => {
  // If parent is null, we're requesting root items
  if (args.parent?.unique === null) {
    return await getRootItems(args);
  }

  const response = await NoteswikiService.getChildren({
    path: { parentId: args.parent.unique },
    query: { skip: args.skip, take: args.take },
  });

  return {
    data: {
      items: response.data.items,
      total: response.data.total,
    },
  };
};

/**
 * Fetches ancestors of a tree item for breadcrumb navigation.
 *
 * Returns the path from root to the specified item, enabling
 * breadcrumb displays and "reveal in tree" functionality.
 *
 * @param {UmbTreeAncestorsOfRequestArgs} args - Request arguments
 * @param {Object} args.treeItem - The item to get ancestors for
 * @param {string} args.treeItem.unique - Unique ID of the item
 *
 * @returns {Promise<{data: TreeItemModel[]}>} Array of ancestor items from root to parent
 *
 * @example
 * // Get ancestors of note "note-xyz"
 * const result = await getAncestorsOf({
 *   treeItem: { unique: "note-xyz", entityType: NOTES_NOTE_ENTITY_TYPE },
 * });
 * // Result might be: [root-folder, sub-folder] (parents of note-xyz)
 */
const getAncestorsOf = async (args: UmbTreeAncestorsOfRequestArgs) => {
  const response = await NoteswikiService.getAncestors({
    path: { id: args.treeItem.unique },
  });

  return { data: response.data };
};

/**
 * Maps an API response item to a tree item model.
 *
 * This is the **critical transformation** that connects API data to the
 * Umbraco tree system. The `entityType` property is especially important
 * as it determines which workspace opens when a tree item is clicked.
 *
 * **Entity Type Mapping:**
 *
 * | API isFolder | entityType Result    | Opens Workspace      |
 * |--------------|---------------------|----------------------|
 * | true         | NOTES_FOLDER_ENTITY | Folder workspace     |
 * | false        | NOTES_NOTE_ENTITY   | Note editor workspace|
 *
 * **Parent Entity Type:**
 *
 * The parent's entity type is inferred from whether it has a parentId:
 * - Has parentId → Parent is a folder
 * - No parentId → Parent is the root
 *
 * @param {TreeItemModel} item - The API response item to transform
 * @returns {NotesTreeItemModel} The transformed tree item model
 *
 * @example
 * // API returns:
 * const apiItem = {
 *   id: "123",
 *   name: "My Note",
 *   isFolder: false,
 *   entityType: "notes-note",
 *   hasChildren: false,
 *   icon: "icon-notepad",
 *   parentId: "folder-456",
 * };
 *
 * // Mapper transforms to:
 * const treeItem = mapper(apiItem);
 * // {
 * //   unique: "123",
 * //   name: "My Note",
 * //   entityType: "notes-note",  // Critical for workspace routing
 * //   hasChildren: false,
 * //   isFolder: false,
 * //   icon: "icon-notepad",
 * //   parent: { unique: "folder-456", entityType: "notes-folder" },
 * // }
 */
const mapper = (item: TreeItemModel): NotesTreeItemModel => {
  // Determine entity type based on API response
  // This is CRITICAL - it controls which workspace opens on click
  let entityType: typeof NOTES_FOLDER_ENTITY_TYPE | typeof NOTES_NOTE_ENTITY_TYPE;

  if (item.isFolder || item.entityType === "notes-folder") {
    entityType = NOTES_FOLDER_ENTITY_TYPE;
  } else {
    entityType = NOTES_NOTE_ENTITY_TYPE;
  }

  return {
    unique: item.id,
    parent: {
      unique: item.parentId || null,
      // Infer parent entity type: if no parentId, parent is root
      entityType: item.parentId ? NOTES_FOLDER_ENTITY_TYPE : NOTES_ROOT_ENTITY_TYPE,
    },
    name: item.name,
    entityType: entityType,
    hasChildren: item.hasChildren,
    isFolder: item.isFolder,
    icon: item.icon || (item.isFolder ? "icon-folder" : "icon-notepad"),
  };
};
