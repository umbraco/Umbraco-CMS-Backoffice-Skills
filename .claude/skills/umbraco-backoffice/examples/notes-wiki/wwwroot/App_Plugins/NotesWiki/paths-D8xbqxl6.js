import { N as t, e, a as n } from "./bundle.manifests-CPE-rfRR.js";
import { UmbPathPattern as T } from "@umbraco-cms/backoffice/router";
import { UMB_WORKSPACE_PATH_PATTERN as _ } from "@umbraco-cms/backoffice/workspace";
const E = _.generateAbsolute({
  sectionName: e,
  entityType: t
}), O = new T("create/parent/:parentEntityType/:parentUnique", E), o = new T("edit/:unique", E), A = _.generateAbsolute({
  sectionName: e,
  entityType: n
}), s = new T("edit/:unique", A);
export {
  o as U,
  s as a,
  O as b
};
//# sourceMappingURL=paths-D8xbqxl6.js.map
