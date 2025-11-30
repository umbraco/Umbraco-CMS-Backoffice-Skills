import { UMB_AUTH_CONTEXT as t } from "@umbraco-cms/backoffice/auth";
import { c as i } from "./client.gen-m1c42xYY.js";
const a = (e, s) => {
  e.consumeContext(t, (n) => {
    if (!n) {
      console.warn("Notes Wiki: Auth context not available");
      return;
    }
    const o = n.getOpenApiConfiguration();
    i.setConfig({
      baseUrl: o.base,
      credentials: o.credentials,
      auth: o.token
    }), console.log("Notes Wiki: API client configured");
  });
}, l = () => {
};
export {
  a as onInit,
  l as onUnload
};
//# sourceMappingURL=entry-point-D_OUv4hE.js.map
