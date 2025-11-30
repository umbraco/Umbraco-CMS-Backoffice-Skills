import { UmbContextToken as o } from "@umbraco-cms/backoffice/context-api";
import { N } from "./bundle.manifests-CPE-rfRR.js";
const p = new o(
  // CRITICAL: Must be "UmbWorkspaceContext" for workspace conditions to work
  // This matches Umbraco's UMB_WORKSPACE_CONTEXT token alias
  "UmbWorkspaceContext",
  // Default value (undefined means no default - will wait for context)
  void 0,
  // Discriminator: Type guard to identify this specific workspace type
  // Returns true only if the context is for a note entity
  (T) => {
    var E;
    return ((E = T.getEntityType) == null ? void 0 : E.call(T)) === N;
  }
);
export {
  p as N
};
//# sourceMappingURL=note-workspace.context-token-DNUQtk0q.js.map
