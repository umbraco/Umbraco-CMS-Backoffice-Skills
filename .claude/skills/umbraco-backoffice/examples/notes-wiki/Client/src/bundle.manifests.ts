/**
 * Notes Wiki Bundle Manifests
 *
 * This is the main entry point that aggregates all manifests from the extension.
 * The umbraco-package.json references this file to load the extension.
 *
 * Skills used: umbraco-bundle
 *
 * TIERED LEARNING COMMENTS:
 *
 * BEGINNER: Start with section + dashboard to create a simple admin panel.
 * Look at section/manifest.ts and dashboard/manifest.ts.
 *
 * INTERMEDIATE: Add tree navigation for hierarchical data.
 * Look at sidebar/manifest.ts, menu/manifest.ts, and tree/manifest.ts.
 * The key is understanding how entityType links tree items to workspaces.
 *
 * ADVANCED: Create full workspaces with multiple views and context management.
 * Look at workspace/manifest.ts and the workspace contexts.
 * Understand the repository pattern for data operations.
 *
 * CONNECTION PATTERNS DEMONSTRATED:
 *
 * 1. Section → Dashboard (via condition SectionAlias)
 *    Dashboard appears when its section is active.
 *
 * 2. Section → SidebarApp → Menu → MenuItem → Tree
 *    SidebarApp uses condition to appear in section.
 *    SidebarApp references Menu via meta.menu.
 *    MenuItem belongs to Menu via meta.menus.
 *    MenuItem shows Tree via meta.treeAlias.
 *
 * 3. Tree Item → Workspace (via entityType)
 *    Tree item click uses entityType to find matching workspace.
 *    Workspace.meta.entityType must match tree item's entityType.
 *
 * 4. Workspace → WorkspaceView (via condition)
 *    WorkspaceView uses condition to appear in specific workspace.
 */

// Import all manifest collections
import { manifests as entrypoints } from "./entrypoints/manifest.js";
import { manifests as section } from "./section/manifest.js";
import { manifests as sidebar } from "./sidebar/manifest.js";
import { manifests as menu } from "./menu/manifest.js";
import { manifests as dashboard } from "./dashboard/manifest.js";
import { manifests as tree } from "./tree/manifest.js";
import { manifests as workspace } from "./workspace/manifest.js";
import { manifests as localization } from "./localization/manifest.js";

/**
 * All manifests aggregated for the extension.
 * Order doesn't matter - Umbraco resolves dependencies automatically.
 */
export const manifests: Array<UmbExtensionManifest> = [
  // Core initialization
  ...entrypoints,

  // Section registration
  ...section,

  // Navigation structure
  ...sidebar,
  ...menu,
  ...tree,

  // Content areas
  ...dashboard,
  ...workspace,

  // Localization
  ...localization,
];
