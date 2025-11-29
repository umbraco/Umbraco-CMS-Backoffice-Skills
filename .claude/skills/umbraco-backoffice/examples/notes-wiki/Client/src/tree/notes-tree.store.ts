/**
 * Notes Tree Store
 *
 * The tree store caches tree items to avoid repeated API calls.
 * It extends Umbraco's UmbUniqueTreeStore which handles the caching logic.
 *
 * Skills used: umbraco-state-management, umbraco-repository-pattern
 *
 * The store:
 * - Caches tree items by their unique ID
 * - Provides observable state for reactive updates
 * - Is registered via manifest and injected via context
 */

import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbUniqueTreeStore } from "@umbraco-cms/backoffice/tree";

/**
 * Store for caching Notes tree items
 */
export class NotesTreeStore extends UmbUniqueTreeStore {
  constructor(host: UmbControllerHost) {
    super(host, NOTES_TREE_STORE_CONTEXT.toString());
  }
}

export { NotesTreeStore as api };

/**
 * Context token for dependency injection
 */
export const NOTES_TREE_STORE_CONTEXT = new UmbContextToken<NotesTreeStore>(
  "NotesTreeStore"
);
