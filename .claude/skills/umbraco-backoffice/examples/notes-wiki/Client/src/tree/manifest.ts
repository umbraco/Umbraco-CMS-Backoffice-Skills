/**
 * Notes Tree Manifests
 *
 * Registers all tree-related extensions:
 * - Repository: Data operations
 * - Store: Caching
 * - Tree: The tree structure itself
 * - TreeItem: Custom rendering for tree nodes
 *
 * Skills used: umbraco-tree, umbraco-tree-item, umbraco-repository-pattern
 *
 * CONNECTION PATTERN:
 * Tree.meta.repositoryAlias --> Repository.alias
 * MenuItem.meta.treeAlias --> Tree.alias
 * TreeItem.forEntityTypes --> determines which items use this renderer
 */

import {
  NOTES_TREE_ALIAS,
  NOTES_TREE_REPOSITORY_ALIAS,
  NOTES_TREE_STORE_ALIAS,
  NOTES_TREE_ITEM_ALIAS,
  NOTES_ROOT_ENTITY_TYPE,
  NOTES_FOLDER_ENTITY_TYPE,
  NOTES_NOTE_ENTITY_TYPE,
} from "../constants.js";

/**
 * Repository manifest
 * The repository handles data operations for the tree.
 */
const repositoryManifest: UmbExtensionManifest = {
  type: "repository",
  alias: NOTES_TREE_REPOSITORY_ALIAS,
  name: "Notes Tree Repository",
  api: () => import("./notes-tree.repository.js"),
};

/**
 * Store manifest
 * The store caches tree items to avoid repeated API calls.
 */
const storeManifest: UmbExtensionManifest = {
  type: "treeStore",
  alias: NOTES_TREE_STORE_ALIAS,
  name: "Notes Tree Store",
  api: () => import("./notes-tree.store.js"),
};

/**
 * Tree manifest
 * Defines the tree and links it to the repository.
 */
const treeManifest: UmbExtensionManifest = {
  type: "tree",
  kind: "default",
  alias: NOTES_TREE_ALIAS,
  name: "Notes Tree",
  meta: {
    repositoryAlias: NOTES_TREE_REPOSITORY_ALIAS, // Links to our repository
  },
};

/**
 * TreeItem manifest
 * Defines how tree items are rendered.
 * forEntityTypes determines which entity types use this renderer.
 */
const treeItemManifest: UmbExtensionManifest = {
  type: "treeItem",
  kind: "default", // Uses default tree item rendering
  alias: NOTES_TREE_ITEM_ALIAS,
  name: "Notes Tree Item",
  forEntityTypes: [
    NOTES_ROOT_ENTITY_TYPE,
    NOTES_FOLDER_ENTITY_TYPE,
    NOTES_NOTE_ENTITY_TYPE,
  ],
};

export const manifests: Array<UmbExtensionManifest> = [
  repositoryManifest,
  storeManifest,
  treeManifest,
  treeItemManifest,
];
