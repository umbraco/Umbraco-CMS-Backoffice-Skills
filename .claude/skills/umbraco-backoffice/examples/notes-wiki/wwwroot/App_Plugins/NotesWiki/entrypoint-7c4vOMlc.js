import { UMB_AUTH_CONTEXT as t } from "@umbraco-cms/backoffice/auth";
import { c as s } from "./client.gen-m1c42xYY.js";
const r = (e, i) => {
  console.log("Notes Wiki extension initialized"), e.consumeContext(t, (n) => {
    if (!n) return;
    const o = n.getOpenApiConfiguration();
    s.setConfig({
      baseUrl: o.base,
      credentials: o.credentials,
      auth: o.token
    }), console.log("Notes Wiki API client configured with auth");
  });
}, a = (e, i) => {
  console.log("Notes Wiki extension unloaded");
};
export {
  r as onInit,
  a as onUnload
};
//# sourceMappingURL=entrypoint-7c4vOMlc.js.map
