import { UmbEntityActionBase as c, UmbRequestReloadStructureForEntityEvent as d } from "@umbraco-cms/backoffice/entity-action";
import { UMB_MODAL_MANAGER_CONTEXT as l, UMB_CONFIRM_MODAL as h } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as r } from "@umbraco-cms/backoffice/notification";
import "./client.gen-m1c42xYY.js";
import { N as m } from "./sdk.gen-DVGT3O8n.js";
import { UMB_ACTION_EVENT_CONTEXT as u } from "@umbraco-cms/backoffice/action";
class _ extends c {
  async execute() {
    const o = this.args.unique;
    if (!o) return;
    const n = await this.getContext(l);
    if (!n) return;
    const i = n.open(this, h, {
      data: {
        headline: "Delete Note",
        content: "Are you sure you want to delete this note? This action cannot be undone.",
        color: "danger",
        confirmLabel: "Delete"
      }
    });
    let a = !1;
    if (await i.onSubmit().then(() => {
      a = !0;
    }).catch(() => {
    }), !!a)
      try {
        await m.deleteNote({
          path: { id: o }
        });
        const t = await this.getContext(r);
        t == null || t.peek("positive", {
          data: {
            headline: "Note deleted",
            message: "The note has been deleted successfully."
          }
        });
        const e = await this.getContext(u);
        if (e) {
          const s = new d({
            entityType: this.args.entityType,
            unique: o
          });
          e.dispatchEvent(s);
        }
      } catch (t) {
        console.error("Error deleting note:", t);
        const e = await this.getContext(r);
        e == null || e.peek("danger", {
          data: {
            headline: "Error",
            message: "Failed to delete the note. Please try again."
          }
        });
      }
  }
}
export {
  _ as DeleteNoteEntityAction,
  _ as default
};
//# sourceMappingURL=delete-note.action-CNtOvi4W.js.map
