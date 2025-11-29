/**
 * Notes Workspace Manifests
 *
 * Registers workspaces for notes and folders.
 *
 * CRITICAL CONNECTION: entityType links tree items to workspaces
 * When a tree item with entityType "notes-note" is clicked,
 * Umbraco finds the workspace with meta.entityType: "notes-note"
 *
 * Skills used: umbraco-workspace, umbraco-conditions, umbraco-routing
 */

import { UMB_WORKSPACE_CONDITION_ALIAS } from "@umbraco-cms/backoffice/workspace";
import {
  NOTES_NOTE_WORKSPACE_ALIAS,
  NOTES_FOLDER_WORKSPACE_ALIAS,
  NOTES_NOTE_ENTITY_TYPE,
  NOTES_FOLDER_ENTITY_TYPE,
} from "../constants.js";

// Re-export workspace aliases for use in other files
export { NOTES_NOTE_WORKSPACE_ALIAS, NOTES_FOLDER_WORKSPACE_ALIAS };

// =============================================================================
// NOTE WORKSPACE
// =============================================================================

/**
 * Note Workspace
 *
 * meta.entityType MUST match the tree item's entityType
 * This is how Umbraco knows to open this workspace when a note is clicked.
 */
const noteWorkspaceManifest: UmbExtensionManifest = {
  type: "workspace",
  kind: "routable", // Supports routing (edit/:unique, create/...)
  alias: NOTES_NOTE_WORKSPACE_ALIAS,
  name: "Notes Note Workspace",
  api: () => import("./note/note-workspace.context.js"),
  meta: {
    entityType: NOTES_NOTE_ENTITY_TYPE, // CRITICAL: Links to tree item clicks
  },
};

/**
 * Note Content View
 *
 * The main editing view (title + content).
 * Uses condition to only appear in the Note workspace.
 */
const noteContentViewManifest: UmbExtensionManifest = {
  type: "workspaceView",
  alias: "Notes.WorkspaceView.Note.Content",
  name: "Notes Note Content View",
  element: () => import("./note/views/note-content.view.element.js"),
  weight: 100, // Higher weight = appears first
  meta: {
    label: "Content",
    pathname: "content",
    icon: "icon-document",
  },
  conditions: [
    {
      alias: UMB_WORKSPACE_CONDITION_ALIAS,
      match: NOTES_NOTE_WORKSPACE_ALIAS, // Only in Note workspace
    },
  ],
};

/**
 * Note Settings View
 *
 * Secondary view for metadata (tags, dates).
 */
const noteSettingsViewManifest: UmbExtensionManifest = {
  type: "workspaceView",
  alias: "Notes.WorkspaceView.Note.Settings",
  name: "Notes Note Settings View",
  element: () => import("./note/views/note-settings.view.element.js"),
  weight: 90, // Lower than content = appears second
  meta: {
    label: "Settings",
    pathname: "settings",
    icon: "icon-settings",
  },
  conditions: [
    {
      alias: UMB_WORKSPACE_CONDITION_ALIAS,
      match: NOTES_NOTE_WORKSPACE_ALIAS,
    },
  ],
};

// =============================================================================
// FOLDER WORKSPACE
// =============================================================================

/**
 * Folder Workspace
 *
 * Simpler workspace for editing folder names.
 */
const folderWorkspaceManifest: UmbExtensionManifest = {
  type: "workspace",
  kind: "routable",
  alias: NOTES_FOLDER_WORKSPACE_ALIAS,
  name: "Notes Folder Workspace",
  api: () => import("./folder/folder-workspace.context.js"),
  meta: {
    entityType: NOTES_FOLDER_ENTITY_TYPE, // CRITICAL: Links to tree item clicks
  },
};

// =============================================================================
// EXPORT ALL MANIFESTS
// =============================================================================

export const manifests: Array<UmbExtensionManifest> = [
  // Note workspace
  noteWorkspaceManifest,
  noteContentViewManifest,
  noteSettingsViewManifest,
  // Folder workspace
  folderWorkspaceManifest,
];
