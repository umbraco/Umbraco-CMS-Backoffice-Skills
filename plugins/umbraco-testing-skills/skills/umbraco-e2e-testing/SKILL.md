---
name: umbraco-e2e-testing
description: E2E testing for Umbraco backoffice extensions using Playwright and @umbraco/playwright-testhelpers
version: 1.0.0
location: managed
allowed-tools: Read, Write, Edit, WebFetch
---

# Umbraco E2E Testing

End-to-end testing for Umbraco backoffice extensions using Playwright and `@umbraco/playwright-testhelpers`. This approach tests against a real running Umbraco instance, validating complete user workflows.

## When to Use

- Testing complete user workflows
- Testing data persistence
- Testing authentication/authorization
- Acceptance testing before release
- Integration testing with real API responses

## Related Skills

- **umbraco-testing** - Master skill for testing overview
- **umbraco-playwright-testhelpers** - Full reference for the testhelpers package
- **umbraco-test-builders** - JsonModels.Builders for test data
- **umbraco-mocked-backoffice** - Test without real backend (faster)

## Documentation

- **Playwright**: https://playwright.dev/docs/intro
- **Reference tests**: `Umbraco-CMS/tests/Umbraco.Tests.AcceptanceTest`

---

## Setup

### Dependencies

Add to `package.json`:

```json
{
  "devDependencies": {
    "@playwright/test": "^1.56",
    "@umbraco/playwright-testhelpers": "^17.0.15",
    "@umbraco/json-models-builders": "^2.0.42",
    "dotenv": "^16.3.1"
  },
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

Then run:
```bash
npm install
npx playwright install chromium
```

**Version Compatibility**: Match testhelpers to your Umbraco version:
| Umbraco | Testhelpers |
|---------|-------------|
| 17.1.x (pre-release) | `17.1.0-beta.x` |
| 17.0.x | `^17.0.15` |
| 14.x | `^14.x` |

### Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const STORAGE_STATE = join(__dirname, 'tests/e2e/.auth/user.json');

// CRITICAL: Testhelpers read auth tokens from this file
process.env.STORAGE_STAGE_PATH = STORAGE_STATE;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'line' : 'html',
  use: {
    baseURL: process.env.UMBRACO_URL || 'https://localhost:44325',
    trace: 'retain-on-failure',
    ignoreHTTPSErrors: true,
    // CRITICAL: Umbraco uses 'data-mark' not 'data-testid'
    testIdAttribute: 'data-mark',
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },
    {
      name: 'e2e',
      testMatch: '**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        ignoreHTTPSErrors: true,
        storageState: STORAGE_STATE,
      },
    },
  ],
});
```

### Critical Settings

| Setting | Value | Why Required |
|---------|-------|--------------|
| `testIdAttribute` | `'data-mark'` | Umbraco uses `data-mark`, not `data-testid` |
| `STORAGE_STAGE_PATH` | Path to user.json | Testhelpers read auth tokens from this file |
| `ignoreHTTPSErrors` | `true` | For local dev with self-signed certs |

**Without `testIdAttribute: 'data-mark'`, all `getByTestId()` calls will fail.**

### Authentication Setup

Create `tests/e2e/auth.setup.ts`:

```typescript
import { test as setup } from '@playwright/test';
import { STORAGE_STATE } from '../../playwright.config';
import { ConstantHelper, UiHelpers } from '@umbraco/playwright-testhelpers';

setup('authenticate', async ({ page }) => {
  const umbracoUi = new UiHelpers(page);

  await umbracoUi.goToBackOffice();
  await umbracoUi.login.enterEmail(process.env.UMBRACO_USER_LOGIN!);
  await umbracoUi.login.enterPassword(process.env.UMBRACO_USER_PASSWORD!);
  await umbracoUi.login.clickLoginButton();
  await umbracoUi.login.goToSection(ConstantHelper.sections.settings);
  await page.context().storageState({ path: STORAGE_STATE });
});
```

### Environment Variables

Create `.env` (add to `.gitignore`):

```bash
UMBRACO_URL=https://localhost:44325
UMBRACO_USER_LOGIN=admin@example.com
UMBRACO_USER_PASSWORD=yourpassword
```

### Directory Structure

```
my-extension/
├── src/
│   └── ...
├── tests/
│   └── e2e/
│       ├── .auth/
│       │   └── user.json       # Auth state (gitignored)
│       ├── auth.setup.ts       # Authentication
│       └── my-extension.spec.ts
├── playwright.config.ts
├── .env                        # Gitignored
├── .env.example
└── package.json
```

---

## Patterns

### Test Fixtures

```typescript
import { test } from '@umbraco/playwright-testhelpers';

test('my test', async ({ umbracoApi, umbracoUi }) => {
  // umbracoApi - API helpers for setup/teardown
  // umbracoUi - UI helpers for backoffice interaction
});
```

### AAA Pattern (Arrange-Act-Assert)

```typescript
test('can create content', async ({ umbracoApi, umbracoUi }) => {
  // Arrange - Setup via API
  await umbracoApi.documentType.createDefaultDocumentType('TestDocType');

  // Act - Perform user actions via UI
  await umbracoUi.goToBackOffice();
  await umbracoUi.content.goToSection(ConstantHelper.sections.content);
  await umbracoUi.content.clickActionsMenuAtRoot();

  // Assert - Verify results
  expect(await umbracoApi.document.doesNameExist('TestContent')).toBeTruthy();
});
```

### Idempotent Cleanup

```typescript
test.afterEach(async ({ umbracoApi }) => {
  await umbracoApi.document.ensureNameNotExists(contentName);
  await umbracoApi.documentType.ensureNameNotExists(documentTypeName);
});
```

### API Helpers (umbracoApi)

**Document Types:**
```typescript
await umbracoApi.documentType.createDefaultDocumentType('TestDocType');
await umbracoApi.documentType.createDocumentTypeWithPropertyEditor(
  'TestDocType', 'Textstring', dataTypeData.id
);
await umbracoApi.documentType.ensureNameNotExists('TestDocType');
```

**Documents:**
```typescript
await umbracoApi.document.createDefaultDocument('TestContent', docTypeId);
await umbracoApi.document.createDocumentWithTextContent(
  'TestContent', docTypeId, 'value', 'Textstring'
);
await umbracoApi.document.publish(contentId);
await umbracoApi.document.ensureNameNotExists('TestContent');
```

**Data Types:**
```typescript
const dataType = await umbracoApi.dataType.getByName('Textstring');
await umbracoApi.dataType.create('MyType', 'Umbraco.TextBox', 'Umb.PropertyEditorUi.TextBox', []);
```

### UI Helpers (umbracoUi)

**Navigation:**
```typescript
await umbracoUi.goToBackOffice();
await umbracoUi.content.goToSection(ConstantHelper.sections.content);
await umbracoUi.content.goToContentWithName('My Page');
```

**Content Actions:**
```typescript
await umbracoUi.content.clickActionsMenuAtRoot();
await umbracoUi.content.clickCreateActionMenuOption();
await umbracoUi.content.chooseDocumentType('TestDocType');
await umbracoUi.content.enterContentName('My Page');
await umbracoUi.content.enterTextstring('My text value');
await umbracoUi.content.clickSaveButton();
```

**Constants:**
```typescript
import { ConstantHelper } from '@umbraco/playwright-testhelpers';

ConstantHelper.sections.content
ConstantHelper.sections.settings
ConstantHelper.buttons.save
ConstantHelper.buttons.saveAndPublish
```

---

## Examples

### Complete Test

```typescript
import { expect } from '@playwright/test';
import { ConstantHelper, NotificationConstantHelper, test } from '@umbraco/playwright-testhelpers';

const contentName = 'TestContent';
const documentTypeName = 'TestDocType';
const dataTypeName = 'Textstring';
const contentText = 'Test content text';

test.afterEach(async ({ umbracoApi }) => {
  await umbracoApi.document.ensureNameNotExists(contentName);
  await umbracoApi.documentType.ensureNameNotExists(documentTypeName);
});

test('can create content', { tag: '@smoke' }, async ({ umbracoApi, umbracoUi }) => {
  // Arrange
  const dataTypeData = await umbracoApi.dataType.getByName(dataTypeName);
  await umbracoApi.documentType.createDocumentTypeWithPropertyEditor(
    documentTypeName, dataTypeName, dataTypeData.id
  );

  // Act
  await umbracoUi.goToBackOffice();
  await umbracoUi.content.goToSection(ConstantHelper.sections.content);
  await umbracoUi.content.clickActionsMenuAtRoot();
  await umbracoUi.content.clickCreateActionMenuOption();
  await umbracoUi.content.chooseDocumentType(documentTypeName);
  await umbracoUi.content.enterContentName(contentName);
  await umbracoUi.content.enterTextstring(contentText);
  await umbracoUi.content.clickSaveButton();

  // Assert
  await umbracoUi.content.waitForContentToBeCreated();
  expect(await umbracoApi.document.doesNameExist(contentName)).toBeTruthy();
  const contentData = await umbracoApi.document.getByName(contentName);
  expect(contentData.values[0].value).toBe(contentText);
});

test('can publish content', async ({ umbracoApi, umbracoUi }) => {
  // Arrange
  const dataTypeData = await umbracoApi.dataType.getByName(dataTypeName);
  const docTypeId = await umbracoApi.documentType.createDocumentTypeWithPropertyEditor(
    documentTypeName, dataTypeName, dataTypeData.id
  );
  await umbracoApi.document.createDocumentWithTextContent(
    contentName, docTypeId, contentText, dataTypeName
  );

  // Act
  await umbracoUi.goToBackOffice();
  await umbracoUi.content.goToSection(ConstantHelper.sections.content);
  await umbracoUi.content.clickActionsMenuForContent(contentName);
  await umbracoUi.content.clickPublishActionMenuOption();
  await umbracoUi.content.clickConfirmToPublishButton();

  // Assert
  await umbracoUi.content.doesSuccessNotificationHaveText(
    NotificationConstantHelper.success.published
  );
  const contentData = await umbracoApi.document.getByName(contentName);
  expect(contentData.variants[0].state).toBe('Published');
});
```

---

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (visual debugging)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/my-extension.spec.ts

# Run with specific tag
npx playwright test --grep "@smoke"

# Run in debug mode
npx playwright test --debug
```

---

## Troubleshooting

### getByTestId() not finding elements

Ensure `testIdAttribute: 'data-mark'` is set in playwright.config.ts.

### Authentication fails

- Check `.env` credentials are correct
- Ensure Umbraco instance is running
- Verify `STORAGE_STAGE_PATH` is set

### Tests timeout

- Increase timeouts in config
- Ensure Umbraco is responsive
- Check for JS errors in browser console

### Tests fail in CI

- Ensure Umbraco instance is accessible
- Set environment variables in CI
- Use `npx playwright install chromium`

---

## Alternative: MSW Mode (No Backend Required)

For faster testing without a real Umbraco backend, use the **mocked backoffice** approach.

**Invoke**: `skill: umbraco-mocked-backoffice`

| Aspect | Real Backend (this skill) | MSW Mode |
|--------|---------------------------|----------|
| Setup | Running Umbraco instance | Clone Umbraco-CMS, npm install |
| Auth | Required | Not required |
| Speed | Slower | Faster |
| Use case | Integration/acceptance | UI/component testing |
