import { test } from '@playwright/test';

/**
 * Warm up the freshly-patched mocked backoffice dev server.
 *
 * When the mocked-backoffice harness patches the client's vite config, the first browser
 * navigation makes vite optimize the external example's deps and do a one-time full server
 * restart (briefly refusing connections). Absorbing that here — as a setup project the real
 * suite depends on — means the actual tests always run against a warm, stable server.
 */
test('warm up mocked backoffice', async ({ page }) => {
	test.setTimeout(120_000);
	let lastError: unknown;
	for (let attempt = 0; attempt < 40; attempt++) {
		try {
			await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 8000 });
			await page.waitForSelector('umb-backoffice', { timeout: 8000 });
			return; // server is up and the backoffice shell rendered
		} catch (error) {
			lastError = error;
			await page.waitForTimeout(2000); // dev server mid-restart; retry
		}
	}
	throw new Error(`Mocked backoffice did not become ready in time: ${lastError}`);
});
