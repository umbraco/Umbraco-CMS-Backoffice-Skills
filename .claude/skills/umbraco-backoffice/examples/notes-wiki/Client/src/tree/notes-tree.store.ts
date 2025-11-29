/**
 * @fileoverview Notes Tree Store
 *
 * The tree store provides caching for tree items to avoid repeated API calls.
 * It extends Umbraco's `UmbUniqueTreeStore` which handles the caching logic.
 *
 * **Role in the Repository Pattern:**
 *
 * ```
 * Repository ─────> Data Source (API)
 *     │
 *     └─────> Store (Cache) <─── Items cached here
 * ```
 *
 * **Why Use a Store?**
 *
 * 1. **Performance**: Avoid redundant API calls when re-rendering the tree
 * 2. **Reactivity**: Provides observable state for UI updates
 * 3. **Consistency**: Single source of truth for tree data
 * 4. **Offline**: Cached data available even if API is slow
 *
 * **How It Works:**
 *
 * - Items are cached by their unique ID
 * - When the repository requests an item, it checks the store first
 * - If not cached, it fetches from the data source and updates the store
 * - UI components observe the store for reactive updates
 *
 * **Registration:**
 *
 * The store is registered via manifest and injected via context:
 *
 * ```typescript
 * // Store manifest
 * {
 *   type: "treeStore",
 *   alias: NOTES_TREE_STORE_ALIAS,
 *   api: () => import("./notes-tree.store.js"),
 * }
 *
 * // Context token (defined in this file) enables DI
 * export const NOTES_TREE_STORE_CONTEXT = new UmbContextToken<NotesTreeStore>("NotesTreeStore");
 * ```
 *
 * Skills demonstrated: umbraco-state-management, umbraco-repository-pattern, umbraco-context-api
 */

import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbUniqueTreeStore } from "@umbraco-cms/backoffice/tree";

/**
 * Store for caching Notes tree items.
 *
 * Extends `UmbUniqueTreeStore` which provides:
 * - Key-value caching by unique ID
 * - Observable state via RxJS
 * - Automatic cleanup on destroy
 *
 * **Note on Context Token:**
 *
 * The context token is defined in this file (not in constants.ts) to avoid
 * circular dependency issues. The store class needs to reference the token
 * in its constructor, and other files need to import the token to consume
 * the store via context.
 *
 * @example
 * // Consuming the store in a component
 * this.consumeContext(NOTES_TREE_STORE_CONTEXT, (store) => {
 *   // Store is now available
 *   store.getItems().subscribe((items) => {
 *     console.log("Cached items:", items);
 *   });
 * });
 */
export class NotesTreeStore extends UmbUniqueTreeStore {
  /**
   * Creates a new tree store instance.
   *
   * @param {UmbControllerHost} host - The controller host for context provision
   */
  constructor(host: UmbControllerHost) {
    super(host, NOTES_TREE_STORE_CONTEXT.toString());
  }
}

/**
 * Export the store class as `api` for Umbraco's extension loader.
 *
 * When the manifest specifies `api: () => import("./notes-tree.store.js")`,
 * Umbraco looks for the `api` export to instantiate the store.
 */
export { NotesTreeStore as api };

/**
 * Context token for dependency injection of the tree store.
 *
 * Use this token with `consumeContext` to get the store instance:
 *
 * ```typescript
 * this.consumeContext(NOTES_TREE_STORE_CONTEXT, (store) => {
 *   // Use store here
 * });
 * ```
 *
 * **Why a Context Token?**
 *
 * Umbraco uses a context-based dependency injection system.
 * Context tokens identify services that can be provided by parent
 * components and consumed by child components. This enables:
 *
 * - Loose coupling between components
 * - Easy testing with mock implementations
 * - Scoped instances per component tree
 *
 * @type {UmbContextToken<NotesTreeStore>}
 */
export const NOTES_TREE_STORE_CONTEXT = new UmbContextToken<NotesTreeStore>(
  "NotesTreeStore"
);
