# External MSW Handlers

Add MSW handlers in a separate `mocks/` folder and load them via `VITE_EXTERNAL_MOCKS`. Your production code stays unchanged.

> **Note**: For extensions using hey-api/OpenAPI clients, consider the [Mock Repository Pattern](./mock-repository-pattern.md) instead - it's simpler and avoids cross-origin issues.

## Limitations

1. **Cross-Origin Requests**: MSW can only intercept same-origin requests. If your API client uses an absolute `baseUrl` (e.g., `https://localhost:44348`), you must configure it to use relative URLs in mock mode.

2. **TypeScript Source Loading**: When loading TypeScript source directly via `VITE_EXTERNAL_EXTENSION`, dynamic imports with `.js` extensions may not resolve. This affects extensions with lazy-loaded repositories.

3. **hey-api Client**: The generated client uses CommonJS files that need an ESM wrapper for Vite.

## Directory Structure

```
my-extension/
├── src/                  # Production code
│   ├── index.ts          # Exports manifests
│   ├── api/
│   │   ├── client.gen.ts # hey-api generated client
│   │   └── client/
│   │       ├── index.cjs # CommonJS (generated)
│   │       └── index.js  # ESM wrapper (you create this)
│   └── ...
└── mocks/                # MSW handlers for custom APIs
    └── handlers.ts       # Must export `handlers` array
```

## Step 1: Create ESM Wrapper for hey-api Client

If using hey-api, create `src/api/client/index.js`:

```typescript
// ESM wrapper for hey-api client (CommonJS)
import cjs from './index.cjs';

export const {
  createClient,
  createConfig,
  formDataBodySerializer,
  jsonBodySerializer,
  urlSearchParamsBodySerializer,
} = cjs;

export default cjs;
```

## Step 2: Configure Client for Mock Mode

In your entrypoint, detect mock mode and use relative URLs:

```typescript
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import type { UmbEntryPointOnInit } from "@umbraco-cms/backoffice/extension-api";
import { client } from "../api";

// Detect mock mode - not on the real backend port
const isMockMode = () => {
  const isBackendPort = window.location.port === '44348' ||
                        window.location.port === '443' ||
                        window.location.port === '';
  return !isBackendPort;
};

export const onInit: UmbEntryPointOnInit = (_host) => {
  if (isMockMode()) {
    // Use relative URLs so MSW can intercept same-origin requests
    client.setConfig({ baseUrl: '' });
    console.log('🎭 Mock mode - using relative URLs');
    return;
  }

  // Production mode - use auth context
  _host.consumeContext(UMB_AUTH_CONTEXT, (_auth) => {
    if (!_auth) return;
    const config = _auth.getOpenApiConfiguration();
    client.setConfig({
      baseUrl: config.base,
      credentials: config.credentials,
    });
    // ... add auth interceptor
  });
};
```

## Step 3: Create MSW Handlers

Create `mocks/handlers.ts`:

```typescript
// Get http and HttpResponse from window.MockServiceWorker (MSW v2, set by mocked backoffice)
const { http, HttpResponse } = (window as any).MockServiceWorker || {};

if (!http) {
  console.error('MSW not available');
}

// Mock data
const items = [
  { id: 'item-1', name: 'Item 1', icon: 'icon-document' },
  { id: 'item-2', name: 'Item 2', icon: 'icon-folder' },
];

// Use relative paths (same-origin)
const API_PATH = '/umbraco/myextension/api/v1';

export const handlers = http ? [
  http.get(`${API_PATH}/items`, () => {
    return HttpResponse.json({ total: items.length, items });
  }),

  http.post(`${API_PATH}/items`, async ({ request }: { request: Request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 'new-id', ...body }, { status: 201 });
  }),
] : [];
```

## Running

```bash
cd /path/to/Umbraco-CMS/src/Umbraco.Web.UI.Client

# IMPORTANT: Point to DIRECTORIES, not files
# - VITE_EXTERNAL_EXTENSION: Directory containing index.ts
# - VITE_EXTERNAL_MOCKS: Directory containing handlers.ts
VITE_EXTERNAL_EXTENSION=/path/to/my-extension \
VITE_EXTERNAL_MOCKS=/path/to/my-extension/mocks \
npm run dev:external
```

### Common Mistakes

| Wrong | Correct |
|-------|---------|
| `VITE_EXTERNAL_MOCKS=.../mocks/handlers.ts` | `VITE_EXTERNAL_MOCKS=.../mocks` |
| `VITE_EXTERNAL_EXTENSION=.../vite.config.ts` | `VITE_EXTERNAL_EXTENSION=...` (directory) |

You'll see in the console:
```
📦 Loading external extension from: /path/to/my-extension/src
🎭 Loading external MSW handlers from: /path/to/my-extension/mocks
🎭 Registered 2 external MSW handler(s)
```

## Working Example

See **tree-example** in `umbraco-backoffice/examples/tree-example/Client/`:
- `index.ts` - Entry point that exports manifests from mock/
- `src/` - Production code with OpenAPI-generated client
- `mock/` - Mock repository implementation
- `mocks/handlers.ts` - MSW handlers for tree API endpoints
- `tests/` - Playwright tests (MSW, mock repo, and real E2E)

```bash
# For MSW handlers approach:
VITE_EXTERNAL_EXTENSION=/path/to/tree-example/Client \
VITE_EXTERNAL_MOCKS=/path/to/tree-example/Client/mocks \
npm run dev:external

# For mock repository approach (no VITE_EXTERNAL_MOCKS needed):
VITE_EXTERNAL_EXTENSION=/path/to/tree-example/Client \
npm run dev:external
```

### Running the Tree Example Tests

```bash
cd /path/to/tree-example/Client

# MSW tests (mocked backoffice must be running)
npm run test:mocked:msw

# Mock repository tests (mocked backoffice must be running)
npm run test:mocked:repo

# Real E2E tests (real Umbraco must be running)
URL=https://localhost:44325 \
UMBRACO_USER_LOGIN=admin@example.com \
UMBRACO_USER_PASSWORD=yourpassword \
npm run test:e2e
```
