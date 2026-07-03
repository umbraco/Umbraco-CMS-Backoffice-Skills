// Entry point for MSW testing mode
// Uses real repository that makes API calls (intercepted by MSW)
// Run with:
//   VITE_EXAMPLE_PATH=/absolute/path/to/tree-example/Client \
//   VITE_UMBRACO_USE_MSW=on \
//   npm run dev

// Re-export from src with real repository (NOT mock repository)
import { manifests as treeManifests } from './src/settingsTree/manifest.js';
import { manifests as workspaceManifests } from './src/workspace/manifest.js';

// Export all manifests - the real repository will make API calls
// that MSW intercepts
export const manifests: Array<UmbExtensionManifest> = [
  ...treeManifests,
  ...workspaceManifests,
];
