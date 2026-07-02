import { test } from '@playwright/test';
import { warmUpMockedBackoffice } from '../../../../../harness/mocked-backoffice/warmup.mjs';

// Warm the freshly-patched mocked backoffice dev server before the real suite runs.
// The retry logic lives in the shared harness helper; see its doc comment for why.
test('warm up mocked backoffice', async ({ page }) => {
	test.setTimeout(120_000);
	await warmUpMockedBackoffice(page);
});
