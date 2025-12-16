import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Workspace Feature Toggle E2E Tests
 *
 * Tests run against the mocked Umbraco backoffice (MSW mode).
 * No authentication is needed as MSW mode bypasses auth.
 *
 * Start the dev server before running tests:
 *   cd /path/to/Umbraco.Web.UI.Client
 *   VITE_EXTERNAL_EXTENSION=/path/to/workspace-feature-toggle npm run dev:external
 */

export default defineConfig({
	testDir: '.',
	timeout: 60000,
	expect: {
		timeout: 15000,
	},
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: [['html', { outputFolder: '../playwright-report' }], ['list']],
	outputDir: '../test-results',

	use: {
		// MSW mode runs on localhost:5173
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		actionTimeout: 15000,
	},

	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
			},
		},
	],
});
