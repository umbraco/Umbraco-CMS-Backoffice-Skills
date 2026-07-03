// Entry point for external (mocked-backoffice) extension loading.
//
// The mocked-backoffice harness imports `<VITE_EXAMPLE_PATH>/index.ts`, so this file is
// the entry it loads. All the real logic lives in `src/index.ts` — it registers the MSW
// handlers when running in MSW mode and selects the right manifests based on
// VITE_UMBRACO_USE_MSW / VITE_USE_MOCK_REPO. Delegate to it so there is a single source
// of truth (this file previously diverged: it never registered MSW and checked
// VITE_USE_MOCK_REPO === 'true' while the configs pass 'on', so no mock data ever loaded).
export { manifests } from './src/index.js';
