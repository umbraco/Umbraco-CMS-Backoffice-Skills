import { b as e } from "./paths-D8xbqxl6.js";
import { UmbEntityActionBase as a } from "@umbraco-cms/backoffice/entity-action";
class r extends a {
  /**
   * Executes the create note action.
   *
   * Generates the workspace URL for creating a new note under the clicked
   * parent and navigates to it using `history.pushState`.
   *
   * **URL Pattern:**
   * `/section/notes/workspace/notes-note/create/parent/{parentEntityType}/{parentUnique}`
   *
   * The workspace route parses these parameters to set up the scaffold
   * with the correct parent reference.
   *
   * @override
   */
  async execute() {
    const t = e.generateAbsolute({
      parentEntityType: this.args.entityType,
      parentUnique: this.args.unique ?? "null"
    });
    history.pushState({}, "", t);
  }
}
export {
  r as CreateNoteEntityAction,
  r as default
};
//# sourceMappingURL=create-note.action-CrYpFAF5.js.map
