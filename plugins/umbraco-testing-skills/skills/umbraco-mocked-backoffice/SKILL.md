---
name: umbraco-mocked-backoffice
description: Run Umbraco backoffice with mocked APIs for visual extension testing
version: 1.0.0
location: managed
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Umbraco Mocked Backoffice

Run the full Umbraco backoffice UI with all API calls mocked - **no .NET backend required**.

## When to Use

- Visually test extensions during development
- Rapid iteration without backend deployment
- E2E testing extensions in realistic UI
- Demonstrate extensions without infrastructure
- CI/CD testing without backend setup

## Related Skills

- **umbraco-example-generator** - Set up extensions for mocked backoffice (start here)
- **umbraco-testing** - Master skill for testing overview
- **umbraco-unit-testing** - Test extension logic in isolation
- **umbraco-e2e-testing** - Test against a real Umbraco instance

---

## Setup

### Create Your Extension

Use the **umbraco-example-generator** skill to set up your extension:

**Invoke**: `skill: umbraco-example-generator`

This covers:
- Cloning Umbraco-CMS repository
- Extension structure and `index.ts` requirements
- Running with `npm run dev:external`

### Add E2E Testing Dependencies

Once your extension is set up, add Playwright for E2E tests:

```json
{
  "devDependencies": {
    "@playwright/test": "^1.56"
  },
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

```bash
npm install
npx playwright install chromium
```

### Directory Structure (with tests)

```
my-extension/
├── index.ts                    # Exports manifests array
├── my-element.ts               # Your element(s)
├── tests/
│   ├── playwright.config.ts    # Playwright config
│   └── my-extension.spec.ts    # E2E tests
├── package.json
└── tsconfig.json
```

---

## Patterns

### Playwright Config

Create `tests/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: '.',
    timeout: 60000,
    expect: { timeout: 15000 },
    use: {
        baseURL: 'http://localhost:5173',  // MSW mode URL (not HTTPS)
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        actionTimeout: 15000,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
```

### Navigation Helper

```typescript
import { type Page } from '@playwright/test';

async function openDocument(page: Page) {
    // Go directly to a document workspace URL
    await page.goto('/section/content/workspace/document/edit/the-simplest-document-id');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('umb-workspace-editor', { timeout: 30000 });
}
```

### MSW Mock Document URLs

| Document Name | URL Path |
|---------------|----------|
| The Simplest Document | `/section/content/workspace/document/edit/the-simplest-document-id` |
| All properties | `/section/content/workspace/document/edit/all-property-editors-document-id` |
| Article in english | `/section/content/workspace/document/edit/article-in-english-document-id` |

### Testing Workspace Views

```typescript
test('can navigate to custom view', async ({ page }) => {
    await openDocument(page);

    const viewTab = page.locator('uui-tab').filter({ hasText: 'My View' });
    await viewTab.click();

    await page.waitForSelector('my-custom-view-element', { timeout: 15000 });

    const view = page.locator('my-custom-view-element');
    await expect(view.getByText('Expected content')).toBeVisible();
});
```

### Testing Workspace Actions

```typescript
test('can execute workspace action', async ({ page }) => {
    await openDocument(page);

    const actionButton = page.getByRole('button', { name: 'My Action' });
    await actionButton.click();

    await expect(page.locator('.my-result')).toBeVisible();
});
```

### Testing Footer Apps

```typescript
test('footer app shows status', async ({ page }) => {
    await openDocument(page);

    const footer = page.locator('my-footer-element');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Status: Ready');
});
```

---

## Examples

### Complete Test File

```typescript
import { test, expect, type Page } from '@playwright/test';

async function openDocument(page: Page) {
    await page.goto('/section/content/workspace/document/edit/the-simplest-document-id');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('umb-workspace-editor', { timeout: 30000 });
    await page.waitForSelector('uui-tab:has-text("Feature Toggles")', { timeout: 15000 });
}

test.describe('Feature Toggle Extension', () => {
    test.beforeEach(async ({ page }) => {
        await openDocument(page);
    });

    test('should display Feature Toggles tab', async ({ page }) => {
        const tab = page.locator('uui-tab').filter({ hasText: 'Feature Toggles' });
        await expect(tab).toBeVisible({ timeout: 15000 });
    });

    test('should display action button', async ({ page }) => {
        const button = page.getByRole('button', { name: 'Toggle All Features' });
        await expect(button).toBeVisible({ timeout: 15000 });
    });

    test('should display footer with count', async ({ page }) => {
        const footer = page.locator('example-feature-toggle-footer');
        await expect(footer).toBeVisible({ timeout: 15000 });
        await expect(footer).toContainText('1 feature active');
    });

    test('can toggle features via view', async ({ page }) => {
        // Navigate to view
        const tab = page.locator('uui-tab').filter({ hasText: 'Feature Toggles' });
        await tab.click();

        await page.waitForSelector('example-feature-toggle-view', { timeout: 15000 });

        // Enable all
        const view = page.locator('example-feature-toggle-view');
        await view.getByRole('button', { name: 'Enable All' }).click();

        // Verify
        await expect(view.getByText('3 of 3 features enabled')).toBeVisible();

        // Footer should update
        const footer = page.locator('example-feature-toggle-footer');
        await expect(footer).toContainText('3 features active');
    });
});
```

### Working Example

See `workspace-feature-toggle` in the examples folder for a complete working example with:
- Workspace context, view, action, and footer app
- 13 passing Playwright E2E tests
- Unit tests with @open-wc/testing

---

## Running Tests

```bash
# Start the mocked backoffice (in one terminal)
cd /path/to/Umbraco-CMS/src/Umbraco.Web.UI.Client
VITE_EXTERNAL_EXTENSION=/path/to/your/extension npm run dev:external

# Run tests (in another terminal)
cd /path/to/your/extension
npm run test:e2e                # Headless
npm run test:e2e:headed         # With browser visible
npm run test:e2e:ui             # Interactive UI mode
```

---

## Troubleshooting

### Extension not appearing

- Check that your extension exports a `manifests` array from `index.ts`
- Verify the condition matches the section you're viewing
- Check browser console for errors
- Look for `📦 External extension registered` in console

### Import errors

- Make sure imports use `@umbraco-cms/backoffice/*`
- Run `npm install` in your extension folder

### "CustomElementRegistry" already defined error

Your extension's `node_modules` is being used instead of the main project's. The Vite plugin should handle this automatically, but ensure you're using `npm run dev:external`.

### Tests timeout waiting for elements

- Ensure the dev server is running with your extension loaded
- Check the browser console for extension loading errors
- Verify the mock document URL exists in MSW data
- Use longer timeouts (15000ms+) for initial element appearance

### Tests pass locally but fail in CI

- Ensure Chromium is installed: `npx playwright install chromium`
- Start the dev server before running tests
- Add appropriate waits for elements to appear

## What's Mocked?

MSW provides mock data for all backoffice APIs:
- Documents, media, members
- Document types, media types, member types
- Data types, templates, stylesheets
- Users, user groups, permissions
- Languages, cultures, dictionary items
