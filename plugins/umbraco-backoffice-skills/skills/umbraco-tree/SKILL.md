---
name: umbraco-tree
description: Implement trees in Umbraco backoffice using official docs
version: 1.1.0
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

## CRITICAL: Tree + Workspace Integration

**Trees and workspaces are tightly coupled.** When using `kind: 'default'` tree items:

1. **Tree items REQUIRE workspaces** - Clicking a tree item navigates to a workspace for that entity type. Without a workspace registered for the `entityType`, clicking causes "forever loading"

2. **Workspaces must be `kind: 'routable'`** - For proper tree item selection state and navigation between items of the same type, use `kind: 'routable'` workspaces (not `kind: 'default'`)

3. **Entity types link trees to workspaces** - The `entityType` in your tree item data must match the `entityType` in your workspace manifest

### Required Components for Clickable Trees
```
Tree Item (entityType: 'my-entity')
    └── navigates to →
Workspace (meta.entityType: 'my-entity', kind: 'routable')
    └── renders →
Workspace Views (conditioned to workspace alias)
```

### Reference the workspace skill
When implementing trees with clickable items, you MUST also implement workspaces:
- Reference skill: `umbraco-workspace`

## Reference Example

The Umbraco source includes a working example:

**Location**: `/Umbraco-CMS/src/Umbraco.Web.UI.Client/examples/tree/`

This example demonstrates a complete custom tree with data source, repository, and menu integration. Study this for production patterns.

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
2. **Ask questions** - What data will the tree display? What repository will provide the data? Where will it appear? **Will tree items be clickable?**
3. **Generate files** - Create manifest + repository + data source based on latest docs
4. **If clickable** - Also create routable workspaces for each entity type (reference `umbraco-workspace` skill)
5. **Explain** - Show what was created and how to test

## Key Configuration Options

### hideTreeRoot on MenuItem (NOT on Tree)
To show tree items at root level (without a parent folder), use `hideTreeRoot: true` on the **menuItem** manifest:

```typescript
// CORRECT - hideTreeRoot on menuItem
{
  type: 'menuItem',
  kind: 'tree',
  alias: 'My.MenuItem.Tree',
  meta: {
    treeAlias: 'My.Tree',
    menus: ['My.Menu'],
    hideTreeRoot: true,  // Shows items at root level
  },
}

// WRONG - hideTreeRoot on tree (has no effect)
{
  type: 'tree',
  meta: {
    hideTreeRoot: true,  // This does nothing!
  },
}
```

## Minimal Examples

### Tree Manifest
```typescript
export const manifests: UmbExtensionManifest[] = [
  // Repository
  {
    type: 'repository',
    alias: 'My.Tree.Repository',
    name: 'My Tree Repository',
    api: () => import('./tree.repository.js'),
  },
  // Tree
  {
    type: 'tree',
    kind: 'default',
    alias: 'My.Tree',
    name: 'My Tree',
    meta: {
      repositoryAlias: 'My.Tree.Repository',
    },
  },
  // Tree Items - use kind: 'default' when workspaces exist
  {
    type: 'treeItem',
    kind: 'default',
    alias: 'My.TreeItem',
    name: 'My Tree Item',
    forEntityTypes: ['my-entity'],
  },
  // MenuItem - hideTreeRoot here
  {
    type: 'menuItem',
    kind: 'tree',
    alias: 'My.MenuItem.Tree',
    meta: {
      treeAlias: 'My.Tree',
      menus: ['My.Menu'],
      hideTreeRoot: true,
    },
  },
];
```

### Data Source (tree-data-source.ts)
```typescript
import type { UmbTreeDataSource } from '@umbraco-cms/backoffice/tree';

export class MyTreeDataSource implements UmbTreeDataSource {
  async getRootItems() {
    // Return items with: unique, entityType, name, hasChildren, icon
    return {
      data: {
        items: [
          {
            unique: 'item-1',
            entityType: 'my-entity',  // Must match workspace entityType!
            name: 'Item 1',
            hasChildren: false,
            icon: 'icon-folder',
          },
        ],
        total: 1,
      },
    };
  }

  async getChildrenOf(args) {
    // Return child items
  }

  async getAncestorsOf(args) {
    // Return ancestor path
  }
}
```

That's it! Always fetch fresh docs, keep examples minimal, generate complete working code.
