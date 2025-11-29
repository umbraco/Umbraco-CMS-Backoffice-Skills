/**
 * Notes Wiki Types
 *
 * TypeScript interfaces for the Notes Wiki extension.
 * These match the C# models on the server side.
 */

import type { UmbTreeItemModel, UmbTreeRootModel } from "@umbraco-cms/backoffice/tree";
import {
  NOTES_ROOT_ENTITY_TYPE,
  NOTES_FOLDER_ENTITY_TYPE,
  NOTES_NOTE_ENTITY_TYPE,
} from "../constants.js";

// =============================================================================
// BASE INTERFACES
// =============================================================================

/**
 * Base interface for all Notes entities
 */
export interface NotesEntityBase {
  unique: string;
  parentUnique: string | null;
  createdDate: string;
}

// =============================================================================
// NOTE MODEL
// =============================================================================

/**
 * Note model - represents an individual note
 */
export interface NoteModel extends NotesEntityBase {
  entityType: typeof NOTES_NOTE_ENTITY_TYPE;
  title: string;
  content: string;
  tags: string[];
  modifiedDate: string;
  createdBy: string;
  modifiedBy: string;
}

/**
 * Detail model for workspace context
 */
export interface NoteDetailModel {
  unique: string;
  entityType: typeof NOTES_NOTE_ENTITY_TYPE;
  parentUnique: string | null;
  title: string;
  content: string;
  tags: string[];
  createdDate: string;
  modifiedDate: string;
  createdBy: string;
  modifiedBy: string;
}

// =============================================================================
// FOLDER MODEL
// =============================================================================

/**
 * Folder model - represents a folder containing notes
 */
export interface FolderModel extends NotesEntityBase {
  entityType: typeof NOTES_FOLDER_ENTITY_TYPE;
  name: string;
}

/**
 * Detail model for folder workspace context
 */
export interface FolderDetailModel {
  unique: string;
  entityType: typeof NOTES_FOLDER_ENTITY_TYPE;
  parentUnique: string | null;
  name: string;
  createdDate: string;
}

// =============================================================================
// TREE MODELS
// =============================================================================

/**
 * Tree item model for notes tree
 */
export interface NotesTreeItemModel extends UmbTreeItemModel {
  entityType:
    | typeof NOTES_ROOT_ENTITY_TYPE
    | typeof NOTES_FOLDER_ENTITY_TYPE
    | typeof NOTES_NOTE_ENTITY_TYPE;
}

/**
 * Tree root model
 */
export interface NotesTreeRootModel extends UmbTreeRootModel {
  entityType: typeof NOTES_ROOT_ENTITY_TYPE;
}

/**
 * API response model for tree items
 */
export interface NotesTreeItemResponseModel {
  id: string;
  name: string;
  entityType: string;
  hasChildren: boolean;
  isFolder: boolean;
  icon: string;
  parentId: string | null;
}

// =============================================================================
// API REQUEST/RESPONSE MODELS
// =============================================================================

/**
 * Create note request
 */
export interface CreateNoteRequest {
  parentUnique: string | null;
  title: string;
  content?: string;
  tags?: string[];
}

/**
 * Update note request
 */
export interface UpdateNoteRequest {
  title: string;
  content: string;
  tags: string[];
}

/**
 * Create folder request
 */
export interface CreateFolderRequest {
  parentUnique: string | null;
  name: string;
}

/**
 * Update folder request
 */
export interface UpdateFolderRequest {
  name: string;
}

/**
 * Recent notes response
 */
export interface RecentNotesResponse {
  notes: NoteModel[];
}

/**
 * Search results response
 */
export interface SearchResultsResponse {
  results: NoteModel[];
  totalCount: number;
}
