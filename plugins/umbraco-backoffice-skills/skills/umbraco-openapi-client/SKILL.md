---
name: umbraco-openapi-client
description: Set up OpenAPI client for authenticated API calls in Umbraco backoffice (REQUIRED for custom APIs)
version: 1.0.0
location: managed
allowed-tools: Read, Write, Edit, Bash
---

# Umbraco OpenAPI Client Setup

## CRITICAL: Why This Matters

**NEVER use raw `fetch()` calls for Umbraco backoffice API communication.** Raw fetch calls will result in 401 Unauthorized errors because they don't include the bearer token authentication that Umbraco requires.

**ALWAYS use a generated OpenAPI client** configured with Umbraco's auth context. This ensures:
- Proper bearer token authentication
- Type-safe API calls
- Automatic token refresh handling

## When to Use This

Use this pattern whenever you:
- Create custom C# API controllers with `[BackOfficeRoute]`
- Need to call your custom APIs from the backoffice frontend
- Build trees, workspaces, or any UI that loads data from custom endpoints

## Setup Overview

The setup has 4 parts:
1. **C# Backend**: Controller with Swagger/OpenAPI documentation
2. **Client Dependencies**: `@hey-api/openapi-ts` (the `@hey-api/client-fetch` plugin is bundled with it)
3. **Generation Script**: Fetches swagger.json and generates TypeScript client
4. **Entry Point Configuration**: Configures client with Umbraco auth

## Step-by-Step Implementation

### 1. C# Backend Setup (Swagger/OpenAPI)

Your API must be exposed as a backoffice OpenAPI document. Create a composer:

> **Umbraco 18+**: The OpenAPI stack moved off Swashbuckle's `SwaggerGenOptions`
> (and the `BackOfficeSecurityRequirementsOperationFilterBase` / `OperationIdHandler`
> types) to a fluent `AddBackOfficeOpenApiDocument(...)` builder. Use the pattern
> below; the old `SwaggerGenOptions` approach no longer compiles on v18.

```csharp
// Composers/MyApiComposer.cs
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace MyExtension.Composers;

public class MyApiComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder) =>

        // Registers a dedicated backoffice OpenAPI document, served at
        // /umbraco/swagger/{ApiName}/swagger.json and browsable via Swagger UI.
        // See https://docs.umbraco.com/umbraco-cms/extend-your-project/tutorials/creating-a-backoffice-api
        builder.AddBackOfficeOpenApiDocument(
            Constants.ApiName,
            document => document
                .WithTitle("My Extension API")
                .WithBackOfficeAuthentication()
                .WithJsonOptions(Umbraco.Cms.Core.Constants.JsonOptionsNames.BackOffice)
                .ConfigureOpenApiOptions(options =>
                    options.AddDocumentTransformer((doc, _, _) =>
                    {
                        doc.Info.Version = "1.0";
                        return Task.CompletedTask;
                    })));
}

// Constants
public static class Constants
{
    public const string ApiName = "myextension";
}
```

### 2. Client package.json Dependencies

Add to your `Client/package.json`:

```json
{
  "scripts": {
    "generate-client": "node scripts/generate-openapi.js https://localhost:44325/umbraco/swagger/myextension/swagger.json"
  },
  "devDependencies": {
    "@hey-api/openapi-ts": "^0.97.0",
    "chalk": "^5.4.1",
    "node-fetch": "^3.3.2"
  }
}
```

### 3. Generation Script

Create `Client/scripts/generate-openapi.js`:

```javascript
import fetch from "node-fetch";
import chalk from "chalk";
import { createClient, defaultPlugins } from "@hey-api/openapi-ts";

console.log(chalk.green("Generating OpenAPI client..."));

const swaggerUrl = process.argv[2];
if (swaggerUrl === undefined) {
  console.error(chalk.red(`ERROR: Missing URL to OpenAPI spec`));
  process.exit(1);
}

// Ignore self-signed certificates on localhost
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

console.log(`Fetching OpenAPI definition from ${chalk.yellow(swaggerUrl)}`);

fetch(swaggerUrl)
  .then(async (response) => {
    if (!response.ok) {
      console.error(chalk.red(`ERROR: ${response.status} ${response.statusText}`));
      return;
    }

    await createClient({
      input: swaggerUrl,
      output: "src/api",
      plugins: [
        ...defaultPlugins,
        {
          name: "@hey-api/client-fetch",
          bundle: true,
          exportFromIndex: true,
          throwOnError: true,
        },
        {
          name: "@hey-api/typescript",
          enums: "typescript",
        },
        {
          name: "@hey-api/sdk",
          asClass: true,
        },
      ],
    });

    console.log(chalk.green("Client generated successfully!"));
  })
  .catch((error) => {
    console.error(`ERROR: ${chalk.red(error.message)}`);
  });
```

### 4. Entry Point Configuration (CRITICAL)

Configure the generated client with Umbraco's auth context in your entry point:

```typescript
// src/entrypoints/entrypoint.ts
import type { UmbEntryPointOnInit, UmbEntryPointOnUnload } from "@umbraco-cms/backoffice/extension-api";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { client } from "../api/client.gen.js";

export const onInit: UmbEntryPointOnInit = (host, _extensionRegistry) => {
  // CRITICAL: Configure the OpenAPI client with authentication
  host.consumeContext(UMB_AUTH_CONTEXT, (authContext) => {
    if (!authContext) return;

    const config = authContext.getOpenApiConfiguration();

    client.setConfig({
      baseUrl: config.base,
      credentials: config.credentials,
      auth: config.token,  // This provides the bearer token!
    });

    console.log("API client configured with auth");
  });
};

export const onUnload: UmbEntryPointOnUnload = (_host, _extensionRegistry) => {
  // Cleanup if needed
};
```

### 5. Using the Generated Client

After running `npm run generate-client`, use the generated service:

```typescript
// In your workspace context, repository, or data source
import { MyExtensionService } from "../api/index.js";

// The client handles auth automatically!
const response = await MyExtensionService.getItems({
  query: { skip: 0, take: 50 },
});

const item = await MyExtensionService.getItem({
  path: { id: "some-guid" },
});

await MyExtensionService.createItem({
  body: { name: "New Item", value: 123 },
});
```

## Generation Workflow

1. **Start Umbraco** - The swagger.json endpoint must be accessible
2. **Run generation**: `npm run generate-client`
3. **Generated files** appear in `src/api/`:
   - `types.gen.ts` - TypeScript types from your C# models
   - `sdk.gen.ts` - Service class with typed methods
   - `client.gen.ts` - HTTP client configuration
   - `index.ts` - Re-exports everything

## Common Mistakes

### ❌ WRONG: Raw fetch
```typescript
// This will get 401 Unauthorized!
const response = await fetch('/umbraco/myextension/api/v1/items');
```

### ❌ WRONG: fetch with credentials only
```typescript
// Still fails - cookies don't work for Management API
const response = await fetch('/umbraco/myextension/api/v1/items', {
  credentials: 'include'
});
```

### ✅ CORRECT: Generated OpenAPI client
```typescript
// Client is configured with bearer token in entry point
const response = await MyExtensionService.getItems();
```

## Reference Example

See the complete working implementation in:
- `examples/notes-wiki/Client/` - Full OpenAPI client setup
- `examples/tree-example/Client/` - Tree with OpenAPI integration

## Key Files to Create

1. `Composers/MyApiComposer.cs` - Swagger registration
2. `Client/scripts/generate-openapi.js` - Generation script
3. `Client/src/entrypoints/entrypoint.ts` - Auth configuration
4. `Client/src/api/` - Generated (don't edit manually)

That's it! Always generate your API client and configure it with auth. Never use raw fetch for authenticated endpoints.
