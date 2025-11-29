/**
 * Notes Wiki Extension - Central Constants
 *
 * This file defines all aliases and entity types used throughout the extension.
 * Centralizing these values:
 * 1. Prevents typos when referencing across files
 * 2. Makes refactoring easier
 * 3. Documents all extension points in one place
 *
 * PATTERN: entityType is the critical link between tree items and workspaces.
 * When a tree item is clicked, Umbraco uses its entityType to find the matching workspace.
 */

// =============================================================================
// SECTION
// =============================================================================
export const NOTES_SECTION_ALIAS = "Notes.Section";
export const NOTES_SECTION_PATHNAME = "notes";

// =============================================================================
// SIDEBAR
// =============================================================================
export const NOTES_SIDEBAR_APP_ALIAS = "Notes.SidebarApp";

// =============================================================================
// MENU
// =============================================================================
export const NOTES_MENU_ALIAS = "Notes.Menu";
export const NOTES_MENU_ITEM_ALIAS = "Notes.MenuItem";

// =============================================================================
// DASHBOARD
// =============================================================================
export const NOTES_DASHBOARD_ALIAS = "Notes.Dashboard";

// =============================================================================
// TREE
// =============================================================================
export const NOTES_TREE_ALIAS = "Notes.Tree";
export const NOTES_TREE_REPOSITORY_ALIAS = "Notes.Tree.Repository";
export const NOTES_TREE_STORE_ALIAS = "Notes.Tree.Store";
export const NOTES_TREE_ITEM_ALIAS = "Notes.TreeItem";

// =============================================================================
// ENTITY TYPES - The critical link between tree items and workspaces
// =============================================================================

/**
 * Root entity type - represents the tree root node
 * Not directly editable, used for tree structure
 */
export const NOTES_ROOT_ENTITY_TYPE = "notes-root";

/**
 * Folder entity type - represents folders containing notes
 * Links to: NOTES_FOLDER_WORKSPACE_ALIAS
 */
export const NOTES_FOLDER_ENTITY_TYPE = "notes-folder";

/**
 * Note entity type - represents individual notes
 * Links to: NOTES_NOTE_WORKSPACE_ALIAS
 */
export const NOTES_NOTE_ENTITY_TYPE = "notes-note";

// =============================================================================
// WORKSPACES
// =============================================================================

/**
 * Note workspace - for editing notes
 * meta.entityType MUST match NOTES_NOTE_ENTITY_TYPE
 */
export const NOTES_NOTE_WORKSPACE_ALIAS = "Notes.Workspace.Note";

/**
 * Folder workspace - for editing folders
 * meta.entityType MUST match NOTES_FOLDER_ENTITY_TYPE
 */
export const NOTES_FOLDER_WORKSPACE_ALIAS = "Notes.Workspace.Folder";

// =============================================================================
// REPOSITORIES
// =============================================================================
export const NOTES_DETAIL_REPOSITORY_ALIAS = "Notes.Detail.Repository";
export const NOTES_DETAIL_STORE_ALIAS = "Notes.Detail.Store";

// =============================================================================
// API BASE PATH
// =============================================================================
export const NOTES_API_BASE_PATH = "/umbraco/notes/api/v1";
