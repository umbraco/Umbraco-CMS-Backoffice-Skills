// The entrypoint configures the generated OpenAPI client with the backoffice
// auth token. It is required when running against a real Umbraco host (this
// bundle is loaded via umbraco-package.json); without it every API call is
// unauthenticated and returns 401. External/mocked loading uses index.ts
// instead of this bundle, so including it here does not affect those modes.
import { manifests as entrypoints } from "./entrypoints/manifest.js";
import { manifests as tree } from "./settingsTree/manifest.js";
import { manifests as workspace } from "./workspace/manifest.js";

console.log('📦 bundle.manifests.ts loaded! Tree:', tree.length, 'Workspace:', workspace.length);

// Job of the bundle is to collate all the manifests from different parts of the extension and load other manifests
// We load this bundle from umbraco-package.json
export const manifests: Array<UmbExtensionManifest> = [
  ...entrypoints,
  ...tree,
  ...workspace,
];
