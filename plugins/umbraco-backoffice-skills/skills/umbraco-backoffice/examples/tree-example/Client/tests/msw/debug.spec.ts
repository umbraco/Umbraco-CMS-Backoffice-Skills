import { test, expect } from '@playwright/test';

test('Debug MSW handlers', async ({ page }) => {
  const consoleLogs: string[] = [];
  const networkRequests: { url: string; status?: number }[] = [];

  // Capture console logs
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('umbtreeclient')) {
      networkRequests.push({ url: request.url() });
    }
  });

  page.on('response', response => {
    if (response.url().includes('umbtreeclient')) {
      const req = networkRequests.find(r => r.url === response.url());
      if (req) req.status = response.status();
    }
  });

  // Navigate to settings
  await page.goto('/section/settings');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('umb-section-sidebar', { timeout: 30000 });

  // Wait for tree to attempt loading
  await page.waitForTimeout(5000);

  // Check registered extensions
  const extensions = await page.evaluate(() => {
    const registry = (window as any).umbExtensionsRegistry;
    if (!registry) return 'umbExtensionsRegistry not found';
    const all = registry.getAllExtensions?.() || [];
    return all
      .filter((e: any) => e.alias?.includes('OurTree') || e.alias?.includes('ourtree'))
      .map((e: any) => ({ type: e.type, alias: e.alias, name: e.name }));
  });
  console.log('\n=== OURTREE EXTENSIONS ===');
  console.log(JSON.stringify(extensions, null, 2));

  // Print results - show ALL logs to find issues
  console.log('\n=== ALL CONSOLE LOGS ===');
  consoleLogs.slice(0, 100).forEach(log => console.log(log));
  if (consoleLogs.length > 100) {
    console.log(`... and ${consoleLogs.length - 100} more logs`);
  }

  console.log('\n=== NETWORK REQUESTS (umbtreeclient) ===');
  networkRequests.forEach(req => console.log(`${req.status || 'pending'}: ${req.url}`));

  // Check for MSW logs
  const mswLogs = consoleLogs.filter(log =>
    log.includes('MSW') || log.includes('handlers') || log.includes('MockServiceWorker')
  );
  console.log('\n=== MSW RELATED LOGS ===');
  mswLogs.forEach(log => console.log(log));

  // Check for extension/external loading logs
  const extLogs = consoleLogs.filter(log =>
    log.includes('external') || log.includes('Extension') || log.includes('extension') ||
    log.includes('OurTree') || log.includes('manifest') || log.includes('Failed') ||
    log.includes('Error') || log.includes('error')
  );
  console.log('\n=== EXTENSION/ERROR LOGS ===');
  extLogs.forEach(log => console.log(log));

  // Check for ALL warnings
  const warnings = consoleLogs.filter(log => log.startsWith('[warning]'));
  console.log('\n=== ALL WARNINGS ===');
  warnings.forEach(log => console.log(log));
});
