# E2E Tests for tree-example

This example demonstrates three testing strategies for Umbraco backoffice extensions.

## Prerequisites

```bash
npm install
npx playwright install chromium
```

---

## Testing Strategies

### 1. MSW Handlers (Mocked Network)

Intercepts HTTP requests at the network level using Mock Service Worker. Production code unchanged.

**Start the dev server:**
```bash
cd /path/to/Umbraco-CMS/src/Umbraco.Web.UI.Client

VITE_EXTERNAL_EXTENSION=/path/to/tree-example/Client \
VITE_EXTERNAL_MOCKS=/path/to/tree-example/Client/mocks \
npm run dev:external
```

**Run tests:**
```bash
npm run test:mocked:msw
```

**Best for:**
- Testing API error handling
- Simulating edge cases
- Fast iteration without backend

---

### 2. Mock Repository (Mocked Application Layer)

Replaces the repository at the extension level. No network mocking needed.

**Start the dev server:**
```bash
cd /path/to/Umbraco-CMS/src/Umbraco.Web.UI.Client

VITE_EXTERNAL_EXTENSION=/path/to/tree-example/Client/mock \
npm run dev:external
```

**Run tests:**
```bash
npm run test:mocked:repo
```

**Best for:**
- Simplest setup
- No cross-origin issues
- Testing UI in isolation

---

### 3. Real E2E (Against Running Umbraco)

Tests against an actual Umbraco instance with the real backend API using `@umbraco/playwright-testhelpers`.

**Prerequisites:**
1. Umbraco instance running
2. Extension built and deployed (`npm run build` + copy to wwwroot/App_Plugins)
3. Backend API running (C# UmbTreeClient project)

**Run tests:**
```bash
URL=https://localhost:44325 \
UMBRACO_USER_LOGIN=admin@example.com \
UMBRACO_USER_PASSWORD=yourpassword \
npm run test:e2e
```

**Best for:**
- Integration testing
- Verifying real API contracts
- Pre-deployment validation

**Note:** Uses `@umbraco/playwright-testhelpers` for authentication and navigation. Without the extension installed, only basic navigation tests will pass.

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `test:mocked` | Run all mocked tests (MSW + mock repo) |
| `test:mocked:msw` | Run MSW handler tests only |
| `test:mocked:repo` | Run mock repository tests only |
| `test:mocked:headed` | Mocked tests with visible browser |
| `test:mocked:ui` | Mocked tests in interactive UI mode |
| `test:e2e` | Run real E2E tests |
| `test:e2e:headed` | Real E2E with visible browser |
| `test:e2e:ui` | Real E2E in interactive UI mode |

---

## Test Files

| File | Strategy | Backend Required |
|------|----------|------------------|
| `tree-msw.spec.ts` | MSW handlers | No |
| `tree-mock-repo.spec.ts` | Mock repository | No |
| `tree-e2e.spec.ts` | Real E2E | Yes |

---

## CI/CD Recommendations

```yaml
# Fast feedback (no backend)
- npm run test:mocked

# Full integration (requires Umbraco)
- npm run test:e2e
```
