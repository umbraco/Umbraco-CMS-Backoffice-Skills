import { UMB_AUTH_CONTEXT as c } from "@umbraco-cms/backoffice/auth";
import { c as s } from "./client.gen-CinYYOVQ.js";
const l = (o, i) => {
  o.consumeContext(c, (e) => {
    if (!e) return;
    const n = e.getOpenApiConfiguration();
    s.setConfig({
      baseUrl: n.base,
      credentials: n.credentials
    }), s.interceptors.request.use(async (t, a) => {
      const r = await e.getLatestToken();
      return t.headers.set("Authorization", `Bearer ${r}`), t;
    });
  });
}, m = (o, i) => {
  console.log("Goodbye from my extension 👋");
};
export {
  l as onInit,
  m as onUnload
};
//# sourceMappingURL=entrypoint-BIGpY6pM.js.map
