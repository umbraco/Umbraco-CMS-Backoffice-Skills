import { UmbEntityActionBase as m, UmbRequestReloadChildrenOfEntityEvent as d } from "@umbraco-cms/backoffice/entity-action";
import { UMB_MODAL_MANAGER_CONTEXT as c } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as i } from "@umbraco-cms/backoffice/notification";
import { UMB_ACTION_EVENT_CONTEXT as l } from "@umbraco-cms/backoffice/action";
import "./client.gen-m1c42xYY.js";
import { N as h } from "./sdk.gen-DVGT3O8n.js";
import { F as p } from "./rename-folder.modal-token-C9b-4SGR.js";
import { a as u } from "./paths-D8xbqxl6.js";
class F extends m {
  async execute() {
    const o = await this.getContext(c);
    if (!o) return;
    const t = await o.open(this, p, {
      data: {
        headline: "Create Folder",
        currentName: "",
        confirmLabel: "Create"
      }
    }).onSubmit().catch(() => {
    });
    if (t != null && t.name)
      try {
        const a = this.args.unique ?? null, e = crypto.randomUUID();
        await h.createFolder({
          body: { unique: e, name: t.name, parentUnique: a }
        });
        const r = await this.getContext(i);
        r == null || r.peek("positive", {
          data: {
            headline: "Folder created",
            message: `Folder "${t.name}" has been created.`
          }
        });
        const n = await this.getContext(l);
        n && n.dispatchEvent(
          new d({
            entityType: this.args.entityType,
            unique: this.args.unique ?? null
          })
        );
        const s = u.generateAbsolute({
          unique: e
        });
        history.pushState({}, "", s);
      } catch (a) {
        console.error("Error creating folder:", a);
        const e = await this.getContext(i);
        e == null || e.peek("danger", {
          data: {
            headline: "Error",
            message: "Failed to create the folder. Please try again."
          }
        });
      }
  }
}
export {
  F as CreateFolderEntityAction,
  F as default
};
//# sourceMappingURL=create-folder.action-CUevAOEu.js.map
