import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to this extension (parent of tests directory)
const EXTENSION_PATH = resolve(__dirname, '..');

// Path to Umbraco.Web.UI.Client - use environment variable or default location
const UMBRACO_CLIENT_PATH = process.env.UMBRACO_CLIENT_PATH ||
  '/Users/philw/Projects/Umbraco-CMS/src/Umbraco.Web.UI.Client';

// Use port 5175 to avoid conflict with other dev servers
const DEV_SERVER_PORT = 5175;

/**
 * Playwright Configuration for Tree Example Mocked Tests
 *
 * Tests run against the mocked Umbraco backoffice using mock repository.
 * No authentication needed as mock mode bypasses auth.
 *
 * The webServer config automatically starts the dev server with the mock extension loaded.
 */
export default defineConfig({
  testDir: '.',
  // Only run mocked tests - exclude real E2E tests which need a running Umbraco
  testMatch: ['tree-mock-repo.spec.ts', 'tree-msw.spec.ts'],
  timeout: 60000,
  expect: { timeout: 15000 },
  // Run tests serially to avoid state conflicts
  fullyParallel: false,
  workers: 1,
  reporter: [['html', { outputFolder: '../playwright-report' }], ['list']],
  outputDir: '../test-results',

  // Automatically start the mocked backoffice dev server with this extension
  webServer: {
    command: `VITE_EXTERNAL_EXTENSION=${EXTENSION_PATH} npm run dev:external -- --port ${DEV_SERVER_PORT}`,
    cwd: UMBRACO_CLIENT_PATH,
    port: DEV_SERVER_PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  use: {
    baseURL: `http://localhost:${DEV_SERVER_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
    // Ensure fresh browser state for each test
    storageState: undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Launch fresh browser context per test file
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
        },
      },
    },
  ],
});
