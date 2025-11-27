---
name: umbraco-workspace
description: Implement workspaces in Umbraco backoffice using official docs
version: 1.0.0
location: managed
allowed-tools: Read, Write, Edit, WebFetch
---

# Umbraco Workspace

## What is it?
Workspaces are dedicated editing environments designed for specific entity types in Umbraco. They create isolated areas where users can edit content, media, members, and other entities with specialized interfaces tailored to each type. Workspaces maintain draft copies of entity data separate from published versions and support multiple extension types including contexts, views, actions, and footer apps.

## Documentation
Always fetch the latest docs before implementing:

- **Main docs**: https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-types/workspaces
- **Workspace Context**: https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-types/workspaces/workspace-context
- **Workspace Views**: https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-types/workspaces/workspace-views
- **Workspace Actions**: https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-types/workspaces/workspace-editor-actions
- **Foundation**: https://docs.umbraco.com/umbraco-cms/customizing/foundation
- **Extension Registry**: https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-registry

## Related Foundation Skills

If you need to explain these foundational concepts when implementing workspaces, reference these skills:

- **Context API**: When implementing workspace contexts, context consumption, or explaining workspace extension communication
  - Reference skill: `umbraco-context-api`

- **State Management**: When implementing draft state, observables, reactive updates, or workspace data management
  - Reference skill: `umbraco-state-management`

- **Umbraco Element**: When implementing workspace view elements, explaining UmbElementMixin, or creating workspace components
  - Reference skill: `umbraco-umbraco-element`

- **Controllers**: When implementing workspace actions, controllers, side effects, or action logic
  - Reference skill: `umbraco-controllers`

## Workflow

1. **Fetch docs** - Use WebFetch on the documentation URLs above to get current code examples and patterns
2. **Ask questions** - What entity type? What views needed? What actions? What data management?
3. **Generate files** - Create manifest + workspace context + views + actions based on the fetched docs
4. **Add project reference** - The extension must be referenced by the main Umbraco project to work:
   - Search for `.csproj` files in the current working directory
   - If exactly one Umbraco instance is found, add the reference to it
   - If multiple Umbraco instances are found, ask the user which one to use
   - If no Umbraco instance is found, ask the user for the path
5. **Explain** - Show what was created and how to test

Always fetch fresh docs before generating code - the API and patterns may have changed.
