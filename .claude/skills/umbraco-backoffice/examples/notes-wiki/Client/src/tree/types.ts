/**
 * Notes Tree Types
 *
 * Type definitions for the Notes tree structure.
 * These extend Umbraco's base tree types.
 *
 * Note: API response types are auto-generated in ../api/types.gen.ts
 */

import type { UmbTreeItemModel, UmbTreeRootModel } from "@umbraco-cms/backoffice/tree";
import {
  NOTES_ROOT_ENTITY_TYPE,
  NOTES_FOLDER_ENTITY_TYPE,
  NOTES_NOTE_ENTITY_TYPE,
} from "../constants.js";

/**
 * Tree item model for notes/folders
 */
export interface NotesTreeItemModel extends UmbTreeItemModel {
  entityType:
    | typeof NOTES_FOLDER_ENTITY_TYPE
    | typeof NOTES_NOTE_ENTITY_TYPE;
}

/**
 * Tree root model
 */
export interface NotesTreeRootModel extends UmbTreeRootModel {
  entityType: typeof NOTES_ROOT_ENTITY_TYPE;
}
