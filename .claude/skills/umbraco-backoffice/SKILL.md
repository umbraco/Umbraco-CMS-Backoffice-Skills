---
name: umbraco-backoffice
description: Blueprints for Umbraco backoffice customisation - complete working examples showing how extension types combine
version: 1.0.0
location: managed
allowed-tools: Read, Write, Edit, WebFetch
---

# Umbraco Backoffice Blueprints

## What This Skill Does

Backoffice customisations are **combinations of extension types** working together:
- A "custom admin area" = Section + Menu + Dashboard
- A "data management tool" = Section + Menu + Workspace
- A "hierarchical browser" = Section + Menu + Tree + Workspace

This skill provides complete working blueprints. The source code is in `./src/` - copy and adapt for your needs.

For details on individual extension types, invoke the referenced sub-skills.

---

## Blueprint 1: Section with Menu, Dashboard & Workspace

A complete custom section with:
- **Section** - Top-level navigation item
- **Menu + MenuItem** - Sidebar navigation
- **Dashboard** - Welcome panel (shows when nothing selected)
- **Workspace** - Editing view (shows when item selected)

### Visual Structure

```
+--------------------------------------------------+
| Content | Media | Settings | [BLUEPRINT]         |  <- Section in top nav
+--------------------------------------------------+
| SIDEBAR          |  MAIN AREA                    |
| +-------------+  |  +-------------------------+  |
| | Navigation  |  |  | Dashboard               |  |  <- Shows when no item selected
| | - My Item   |  |  | "Welcome to Blueprint"  |  |
| +-------------+  |  +-------------------------+  |
|      ^           |                               |
|      |           |  +-------------------------+  |
|   Menu +         |  | Workspace               |  |  <- Shows when item clicked
|   MenuItem       |  | "Edit Item"             |  |
|                  |  +-------------------------+  |
+--------------------------------------------------+
```

### How Components Connect

```
Section (alias: "Blueprint.Section")
    |
    +-- conditions: SectionAlias --> Dashboard (shows in this section)
    |
    +-- conditions: SectionAlias --> SectionSidebarApp
                                        |
                                        +-- meta.menu --> Menu (alias: "Blueprint.Menu")
                                                            |
                                                            +-- MenuItem
                                                                  |
                                                                  +-- entityType: "blueprint-entity"
                                                                            |
                                                                            v
                                                                      Workspace
                                                                      (entityType: "blueprint-entity")
```

### Sub-Skills for Deeper Understanding

Invoke these skills for detailed documentation on each extension type:

| Component | Sub-Skill | What It Explains |
|-----------|-----------|------------------|
| Section | `umbraco-sections` | Section registration, permissions |
| Menu | `umbraco-menu` | Menu containers |
| MenuItem | `umbraco-menu-items` | Menu items, icons, linking |
| Dashboard | `umbraco-dashboard` | Dashboard panels, conditions |
| Workspace | `umbraco-workspace` | Entity editing, views, actions |

### Foundation Concepts

You may also need these foundational skills:

| Concept | Sub-Skill | When Needed |
|---------|-----------|-------------|
| Context API | `umbraco-context-api` | Accessing services, sharing data |
| Umbraco Element | `umbraco-umbraco-element` | Base class for components |
| Conditions | `umbraco-conditions` | Controlling where things appear |
| State Management | `umbraco-state-management` | Reactive UI with @state |

---

## Source Code

The complete working source code is in this skill's `./src/` folder:

```
src/
├── entrypoints/
│   ├── entrypoint.ts     # Extension lifecycle hooks
│   └── manifest.ts       # Entry point registration
├── sections/
│   └── manifest.ts       # Section + SidebarApp + Menu + MenuItem
├── dashboards/
│   ├── dashboard.element.ts   # Dashboard UI component
│   └── manifest.ts            # Dashboard registration
├── workspaces/
│   ├── workspace.element.ts   # Workspace UI component
│   └── manifest.ts            # Workspace + WorkspaceView registration
└── bundle.manifests.ts   # Aggregates all manifests
```

### Key Files Explained

**bundle.manifests.ts** - The entry point that collates all manifests:
```typescript
export const manifests: Array<UmbExtensionManifest> = [
  ...entrypoints,
  ...dashboards,
  ...sections,
  ...workspaces,
];
```
Reference this from your `umbraco-package.json`.

**sections/manifest.ts** - Shows how Section, Menu, MenuItem, and SidebarApp connect:
- Section has an alias
- SidebarApp uses condition to appear only in that section
- SidebarApp references a Menu via `meta.menu`
- MenuItem belongs to that Menu via `meta.menus`
- MenuItem links to Workspace via `entityType`

**workspaces/manifest.ts** - Shows Workspace and WorkspaceView pattern:
- Workspace has `entityType` that matches MenuItem
- WorkspaceView uses condition to appear in that Workspace

---

## Using This Blueprint

1. **Copy** the `src/` folder to your extension's Client folder
2. **Rename** aliases from `Blueprint.*` to your own namespace
3. **Update** the entityType to match your domain
4. **Customise** the dashboard and workspace UI
5. **Register** with Umbraco via umbraco-package.json:
   ```json
   {
     "name": "My Extension",
     "extensions": ["./Client/dist/bundle.manifests.js"]
   }
   ```

---

## Future Blueprints

More blueprints will be added:
- **Blueprint 2**: Dashboard-only (add to existing section)
- **Blueprint 3**: Section with Tree (hierarchical data)
- **Blueprint 4**: Header App with Modal
