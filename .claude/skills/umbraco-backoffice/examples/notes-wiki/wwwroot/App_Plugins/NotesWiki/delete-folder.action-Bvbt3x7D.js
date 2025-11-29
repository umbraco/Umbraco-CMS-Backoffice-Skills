import { UmbEntityActionBase as d, UmbRequestReloadStructureForEntityEvent as l } from "@umbraco-cms/backoffice/entity-action";
import { UMB_MODAL_MANAGER_CONTEXT as c, UMB_CONFIRM_MODAL as m } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as i } from "@umbraco-cms/backoffice/notification";
import "./client.gen-m1c42xYY.js";
import { N as h } from "./sdk.gen-DVGT3O8n.js";
import { UMB_ACTION_EVENT_CONTEXT as u } from "@umbraco-cms/backoffice/action";
class M extends d {
  async execute() {
    const r = this.args.unique;
    if (!r) return;
    const o = await this.getContext(c);
    if (!o) return;
    const n = o.open(this, m, {
      data: {
        headline: "Delete Folder",
        content: "Are you sure you want to delete this folder? The folder must be empty before it can be deleted.",
        color: "danger",
        confirmLabel: "Delete"
      }
    });
    let a = !1;
    if (await n.onSubmit().then(() => {
      a = !0;
    }).catch(() => {
    }), !!a)
      try {
        await h.deleteFolder({
          path: { id: r }
        });
        const t = await this.getContext(i);
        t == null || t.peek("positive", {
          data: {
            headline: "Folder deleted",
            message: "The folder has been deleted successfully."
          }
        });
        const e = await this.getContext(u);
        if (e) {
          const s = new l({
            entityType: this.args.entityType,
            unique: r
          });
          e.dispatchEvent(s);
        }
      } catch (t) {
        console.error("Error deleting folder:", t);
        const e = await this.getContext(i);
        e == null || e.peek("danger", {
          data: {
            headline: "Error",
            message: "Failed to delete the folder. Make sure the folder is empty before deleting."
          }
        });
      }
  }
}
export {
  M as DeleteFolderEntityAction,
  M as default
};
//# sourceMappingURL=delete-folder.action-Bvbt3x7D.js.map
