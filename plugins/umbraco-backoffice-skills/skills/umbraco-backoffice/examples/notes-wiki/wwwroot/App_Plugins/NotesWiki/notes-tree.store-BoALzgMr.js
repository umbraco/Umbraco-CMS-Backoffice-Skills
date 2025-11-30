import { UmbContextToken as o } from "@umbraco-cms/backoffice/context-api";
import { UmbUniqueTreeStore as t } from "@umbraco-cms/backoffice/tree";
class m extends t {
  /**
   * Creates a new tree store instance.
   *
   * @param {UmbControllerHost} host - The controller host for context provision
   */
  constructor(e) {
    super(e, r.toString());
  }
}
const r = new o(
  "NotesTreeStore"
);
export {
  r as NOTES_TREE_STORE_CONTEXT,
  m as NotesTreeStore,
  m as api
};
//# sourceMappingURL=notes-tree.store-BoALzgMr.js.map
