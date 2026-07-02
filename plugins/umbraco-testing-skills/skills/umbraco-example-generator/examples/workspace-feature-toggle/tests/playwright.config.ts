import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to this extension (parent of tests directory)
const EXTENSION_PATH = resolve(__dirname, '..');

// Path to Umbraco.Web.UI.Client - use environment variable or default location
// Set UMBRACO_CLIENT_PATH if your Umbraco-CMS is in a different location
const UMBRACO_CLIENT_PATH = process.env.UMBRACO_CLIENT_PATH ||
	'/Users/philw/Projects/Umbraco-CMS/src/Umbraco.Web.UI.Client';

// Use port 5174 to avoid conflict with other dev servers.
// Overridable (DEV_SERVER_PORT env) so concurrent worktrees don't clash on this port.
const DEV_SERVER_PORT = Number(process.env.DEV_SERVER_PORT) || 5174;

/**
 * Playwright Configuration for Workspace Feature Toggle Mocked Tests
 *
 * Tests run against the mocked Umbraco backoffice (MSW mode).
 * No authentication is needed as MSW mode bypasses auth.
 *
 * The webServer config automatically starts the dev server with this extension loaded.
 */
export default defineConfig({
	testDir: '.',
	// Inject external-example support into the client dev server before starting it; revert after.
	globalSetup: fileURLToPath(new URL('../../../../../harness/mocked-backoffice/global-setup.mjs', import.meta.url)),
	globalTeardown: fileURLToPath(new URL('../../../../../harness/mocked-backoffice/global-teardown.mjs', import.meta.url)),
	timeout: 60000,
	expect: {
		timeout: 15000,
	},
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	// Retry the transient dev-server cold-start window (vite re-optimizes deps after the
	// harness patches the client config, briefly refusing connections on the first run).
	retries: 2,
	workers: 1,
	reporter: [['html', { outputFolder: '../playwright-report' }], ['list']],
	outputDir: '../test-results',

	// Automatically start the mocked backoffice dev server with this extension
	webServer: {
		command: `VITE_EXAMPLE_PATH=${EXTENSION_PATH} VITE_UMBRACO_USE_MSW=on npm run dev -- --port ${DEV_SERVER_PORT}`,
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
	},

	projects: [
		// Warm the dev server first so the real tests never hit vite's cold-start restart.
		{
			name: 'warmup',
			testMatch: /warmup\.setup\.ts/,
		},
		{
			name: 'chromium',
			dependencies: ['warmup'],
			use: {
				...devices['Desktop Chrome'],
			},
		},
	],
});
