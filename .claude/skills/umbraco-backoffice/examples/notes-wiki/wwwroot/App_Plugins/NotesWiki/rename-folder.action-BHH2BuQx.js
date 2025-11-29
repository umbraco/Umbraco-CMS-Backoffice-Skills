import { UmbEntityActionBase as m, UmbRequestReloadStructureForEntityEvent as d } from "@umbraco-cms/backoffice/entity-action";
import { UMB_MODAL_MANAGER_CONTEXT as l } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as i } from "@umbraco-cms/backoffice/notification";
import "./client.gen-m1c42xYY.js";
import { N as s } from "./sdk.gen-DVGT3O8n.js";
import { UMB_ACTION_EVENT_CONTEXT as c } from "@umbraco-cms/backoffice/action";
import { F as p } from "./rename-folder.modal-token-C9b-4SGR.js";
class _ extends m {
  async execute() {
    const r = this.args.unique;
    if (!r) return;
    let o = "";
    try {
      o = (await s.getFolder({
        path: { id: r }
      })).data.name;
    } catch {
      console.error("Failed to load folder");
      return;
    }
    const n = await this.getContext(l);
    if (!n) return;
    const a = await n.open(this, p, {
      data: {
        headline: "Rename Folder",
        currentName: o,
        confirmLabel: "Rename"
      }
    }).onSubmit().catch(() => {
    });
    if (a != null && a.name)
      try {
        await s.updateFolder({
          path: { id: r },
          body: {
            name: a.name
          }
        });
        const e = await this.getContext(i);
        e == null || e.peek("positive", {
          data: {
            headline: "Folder renamed",
            message: `Folder has been renamed to "${a.name}".`
          }
        });
        const t = await this.getContext(c);
        t && t.dispatchEvent(
          new d({
            entityType: this.args.entityType,
            unique: r
          })
        );
      } catch (e) {
        console.error("Error renaming folder:", e);
        const t = await this.getContext(i);
        t == null || t.peek("danger", {
          data: {
            headline: "Error",
            message: "Failed to rename the folder. Please try again."
          }
        });
      }
  }
}
export {
  _ as RenameFolderEntityAction,
  _ as default
};
//# sourceMappingURL=rename-folder.action-BHH2BuQx.js.map
