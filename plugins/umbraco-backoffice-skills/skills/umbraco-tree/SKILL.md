---
name: umbraco-tree
description: Implement trees in Umbraco backoffice using official docs
version: 1.0.0
location: managed
allowed-tools: Read, Write, Edit, WebFetch
---

# Umbraco Tree

## What is it?
A tree in Umbraco is a hierarchical structure of nodes registered in the Backoffice extension registry. Trees display organized content hierarchies and can be rendered anywhere in the Backoffice using the `<umb-tree />` element. They require a data source implementation to fetch root items, children, and ancestors.

## Documentation
Always fetch the latest docs before implementing:

- **Main docs**: https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-types/tree
- **Sections & Trees**: https://docs.umbraco.com/umbraco-cms/customizing/section-trees
- **Foundation**: https://docs.umbraco.com/umbraco-cms/customizing/foundation
- **Extension Registry**: https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-registry

## Related Foundation Skills

If you need to explain these foundational concepts when implementing trees, reference these skills:

- **Repository Pattern**: When implementing tree data sources, repositories, data fetching, or CRUD operations
  - Reference skill: `umbraco-repository-pattern`

- **Context API**: When implementing repository contexts or explaining how repositories connect to UI components
  - Reference skill: `umbraco-context-api`

- **State Management**: When implementing reactive tree updates, observables, or managing tree state
  - Reference skill: `umbraco-state-management`

## Workflow

1. **Fetch docs** - Use WebFetch on the URLs above
2. **Ask questions** - What data will the tree display? What repository will provide the data? Where will it appear?
3. **Generate files** - Create manifest + repository + data source based on latest docs
4. **Explain** - Show what was created and how to test

## Minimal Examples

### Manifest (umbraco-package.json)
```json
{
  "type": "tree",
  "alias": "My.Tree",
  "name": "My Tree",
  "meta": {
    "repositoryAlias": "My.Repository"
  }
}
```

### Data Source (tree-data-source.ts)
```typescript
import { UmbTreeDataSource } from '@umbraco-cms/backoffice/tree';

export class MyTreeDataSource implements UmbTreeDataSource {
  async getRootItems() {
    // Return root tree items
  }

  async getChildrenOf(parentUnique: string) {
    // Return child items
  }

  async getAncestorsOf(unique: string) {
    // Return ancestor path
  }
}
```

### Rendering the Tree
```html
<umb-tree alias="My.Tree"></umb-tree>
```

That's it! Always fetch fresh docs, keep examples minimal, generate complete working code.
