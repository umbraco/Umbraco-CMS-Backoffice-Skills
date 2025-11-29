/**
 * Notes Tree Server Data Source
 *
 * Fetches tree data from the C# backend API using the generated OpenAPI client.
 * Extends Umbraco's UmbTreeServerDataSourceBase for consistent patterns.
 *
 * Skills used: umbraco-repository-pattern, umbraco-tree
 *
 * The data source:
 * - Fetches root items, children, and ancestors from API
 * - Maps API responses to tree item models
 * - Handles pagination (skip/take)
 *
 * IMPORTANT: Uses the generated OpenAPI client which handles authentication
 * via bearer tokens automatically.
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
 * Data source for fetching Notes tree data from the server
 */
export class NotesTreeServerDataSource extends UmbTreeServerDataSourceBase<
  TreeItemModel,
  NotesTreeItemModel
> {
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
 * Fetch root tree items
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
 * Fetch children of a tree item
 */
const getChildrenOf = async (args: UmbTreeChildrenOfRequestArgs) => {
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
 * Fetch ancestors of a tree item (for breadcrumb/path)
 */
const getAncestorsOf = async (args: UmbTreeAncestorsOfRequestArgs) => {
  const response = await NoteswikiService.getAncestors({
    path: { id: args.treeItem.unique },
  });

  return { data: response.data };
};

/**
 * Map API response to tree item model
 *
 * CRITICAL: entityType determines which workspace opens when item is clicked
 */
const mapper = (item: TreeItemModel): NotesTreeItemModel => {
  // Determine entity type based on API response
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
      entityType: item.parentId ? NOTES_FOLDER_ENTITY_TYPE : NOTES_ROOT_ENTITY_TYPE,
    },
    name: item.name,
    entityType: entityType,
    hasChildren: item.hasChildren,
    isFolder: item.isFolder,
    icon: item.icon || (item.isFolder ? "icon-folder" : "icon-notepad"),
  };
};
