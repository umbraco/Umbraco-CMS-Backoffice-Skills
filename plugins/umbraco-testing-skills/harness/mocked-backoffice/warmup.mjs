/**
 * Warm up the freshly-patched mocked backoffice dev server.
 *
 * When the mocked-backoffice harness patches the client's vite config, the first browser
 * navigation makes vite optimize the external example's deps and do a one-time full server
 * restart (briefly refusing connections). Absorbing that in a setup project the real suite
 * depends on means the actual tests always run against a warm, stable server.
 *
 * Shared by every mocked-backoffice example's `warmup.setup.ts` so this retry logic lives in
 * one place. The example's tiny setup file resolves `@playwright/test` locally (it isn't
 * installed above the harness) and delegates here; this helper only uses the passed-in page,
 * so it needs no Playwright import of its own.
 *
 * @param {import('@playwright/test').Page} page
 */
export async function warmUpMockedBackoffice(page) {
	let lastError;
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
}
