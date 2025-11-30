---
name: umbraco-collection
description: Implement collections in Umbraco backoffice using official docs
version: 1.0.0
location: managed
allowed-tools: Read, Write, Edit, WebFetch
---

# Umbraco Collection

## What is it?
A Collection displays a list of entities (documents, media, members, or custom entities) in the Umbraco backoffice. Collections provide a standardized way to show, filter, and interact with lists of items. They connect to a repository for data and support multiple views (table, grid, etc.), actions, and bulk operations.

## Documentation
Always fetch the latest docs before implementing:

- **Main docs**: https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-types/collections
- **Collection View**: https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-types/collections/collection-view
- **Foundation**: https://docs.umbraco.com/umbraco-cms/customizing/foundation
- **Extension Registry**: https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-registry

## Related Foundation Skills

- **Repository Pattern**: Collections require a repository for data access
  - Reference skill: `umbraco-repository-pattern`

- **Context API**: For accessing collection context in views and actions
  - Reference skill: `umbraco-context-api`

- **Conditions**: For controlling when collections appear
  - Reference skill: `umbraco-conditions`

## Workflow

1. **Fetch docs** - Use WebFetch on the URLs above
2. **Ask questions** - What entities? What repository? What views needed?
3. **Generate files** - Create manifest + repository + views based on latest docs
4. **Explain** - Show what was created and how to test

## Minimal Examples

### Collection Manifest (manifests.ts)
```typescript
import type { ManifestCollection } from '@umbraco-cms/backoffice/extension-registry';

const collectionManifest: ManifestCollection = {
  type: 'collection',
  alias: 'My.Collection',
  name: 'My Collection',
  api: () => import('./my-collection.context.js'),
  element: () => import('./my-collection.element.js'),
  meta: {
    repositoryAlias: 'My.Collection.Repository',
  },
};

export const manifests = [collectionManifest];
```

### Collection Element (my-collection.element.ts)
```typescript
import { html, customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';

@customElement('my-collection')
export class MyCollectionElement extends UmbLitElement {
  render() {
    return html`
      <umb-collection alias="My.Collection"></umb-collection>
    `;
  }
}

export default MyCollectionElement;

declare global {
  interface HTMLElementTagNameMap {
    'my-collection': MyCollectionElement;
  }
}
```

### Collection Repository (my-collection.repository.ts)
```typescript
import { UmbRepositoryBase } from '@umbraco-cms/backoffice/repository';
import type { UmbCollectionRepository } from '@umbraco-cms/backoffice/collection';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

export class MyCollectionRepository extends UmbRepositoryBase implements UmbCollectionRepository {
  constructor(host: UmbControllerHost) {
    super(host);
  }

  async requestCollection(query: any) {
    // Fetch data from API or data source
    const items = await this.#fetchItems(query);

    return {
      data: {
        items,
        total: items.length,
      },
    };
  }

  async #fetchItems(query: any) {
    // Your data fetching logic
    return [];
  }
}

export default MyCollectionRepository;
```

### Repository Manifest
```typescript
const repositoryManifest = {
  type: 'repository',
  alias: 'My.Collection.Repository',
  name: 'My Collection Repository',
  api: () => import('./my-collection.repository.js'),
};
```

### Using Default Collection Element
```typescript
// If you don't need a custom element, use the built-in one
const collectionManifest: ManifestCollection = {
  type: 'collection',
  alias: 'My.Collection',
  name: 'My Collection',
  meta: {
    repositoryAlias: 'My.Collection.Repository',
    noItemsLabel: 'No items found',
  },
};
```

## Built-in Collection Aliases

- `Umb.Collection.Document` - Content items
- `Umb.Collection.Media` - Media items
- `Umb.Collection.Member` - Members
- `Umb.Collection.User` - Users
- `Umb.Collection.DataType` - Data types

## Meta Properties

| Property | Description |
|----------|-------------|
| `repositoryAlias` | Required. The repository that provides data |
| `noItemsLabel` | Label shown when collection is empty |

That's it! Always fetch fresh docs, keep examples minimal, generate complete working code.
