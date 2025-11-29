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

## Backoffice Extension Map

This diagram shows where ALL extension types appear in the Umbraco backoffice UI:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ HEADER BAR                                                                       │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           ┌───────────────────┐ │
│ │ Content │ │  Media  │ │Settings │ │ Section │  ...      │    Header Apps    │ │
│ │         │ │         │ │         │ │  ****   │           │ (umbraco-header-  │ │
│ │         │ │         │ │         │ │         │           │     apps)         │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘           └───────────────────┘ │
│      ^                        ^                                    ^            │
│      │                        │                                    │            │
│  (umbraco-sections)      Your Section                    User menu, search,     │
│                                                          notifications          │
├─────────────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR                    │  MAIN CONTENT AREA                                 │
│ ┌────────────────────────┐ │ ┌─────────────────────────────────────────────────┐│
│ │ SectionSidebarApp      │ │ │ Dashboard (umbraco-dashboard)                   ││
│ │ (part of sections)     │ │ │ Shows when nothing selected in tree             ││
│ │                        │ │ │ ┌─────────────────────────────────────────────┐ ││
│ │ ┌────────────────────┐ │ │ │ │ Your welcome content, stats, quick actions │ ││
│ │ │ Menu               │ │ │ │ └─────────────────────────────────────────────┘ ││
│ │ │ (umbraco-menu)     │ │ │ └─────────────────────────────────────────────────┘│
│ │ │                    │ │ │                                                    │
│ │ │ ┌────────────────┐ │ │ │ ┌─────────────────────────────────────────────────┐│
│ │ │ │ MenuItem       │ │ │ │ │ Workspace (umbraco-workspace)                   ││
│ │ │ │ (umbraco-menu- │ │ │ │ │ Shows when entity selected                      ││
│ │ │ │     items)     │ │ │ │ │ ┌─────────────────────────────────────────────┐ ││
│ │ │ │                │ │ │ │ │ │ WorkspaceView tabs (Content, Settings...)  │ ││
│ │ │ │ kind: "tree"───┼─┼─┼─┼─┤ │ ┌─────────┐ ┌─────────┐ ┌─────────┐       │ ││
│ │ │ └────────────────┘ │ │ │ │ │ │ View 1  │ │ View 2  │ │ View 3  │       │ ││
│ │ │                    │ │ │ │ │ └─────────┘ └─────────┘ └─────────┘       │ ││
│ │ │ ┌────────────────┐ │ │ │ │ └─────────────────────────────────────────────┘ ││
│ │ │ │ Tree           │ │ │ │ │                                                 ││
│ │ │ │ (umbraco-tree) │ │ │ │ │ WorkspaceActions (Save, Delete...)             ││
│ │ │ │                │ │ │ │ │ (umbraco-entity-actions)                        ││
│ │ │ │ ├─ Folder      │ │ │ │ └─────────────────────────────────────────────────┘│
│ │ │ │ │  └─ Item ────┼─┼─┼─┼──> entityType links to Workspace                  │
│ │ │ │ └─ Item        │ │ │ │                                                    │
│ │ │ │   (umbraco-    │ │ │ │ ┌─────────────────────────────────────────────────┐│
│ │ │ │    tree-item)  │ │ │ │ │ Collection (umbraco-collection)                 ││
│ │ │ └────────────────┘ │ │ │ │ List/grid view of items                         ││
│ │ └────────────────────┘ │ │ │ ┌─────────────────────────────────────────────┐ ││
│ └────────────────────────┘ │ │ │ CollectionView (umbraco-collection-view)    │ ││
│                            │ │ │ CollectionAction (umbraco-collection-action)│ ││
│                            │ │ └─────────────────────────────────────────────┘ ││
│                            │ └─────────────────────────────────────────────────┘│
├────────────────────────────┴────────────────────────────────────────────────────┤
│ MODALS & OVERLAYS (umbraco-modals)                                              │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Pickers, confirmations, custom dialogs - appear above main content          │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ PROPERTY EDITORS (in Document/Media workspaces)                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ PropertyEditorUI (umbraco-property-editor-ui)  - The visual editor          │ │
│ │ PropertyEditorSchema (umbraco-property-editor-schema) - Data validation     │ │
│ │ PropertyAction (umbraco-property-action) - Buttons on property              │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ RICH TEXT EDITOR (Tiptap)                                                       │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ TiptapExtension (umbraco-tiptap-extension) - Core editor behavior           │ │
│ │ TiptapToolbarExtension (umbraco-tiptap-toolbar-extension) - Toolbar buttons │ │
│ │ TiptapStatusbarExtension (umbraco-tiptap-statusbar-extension) - Status bar  │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ GLOBAL FEATURES                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ SearchProvider (umbraco-search-provider) - Global search results            │ │
│ │ SearchResultItem (umbraco-search-result-item) - Custom result rendering     │ │
│ │ HealthCheck (umbraco-health-check) - Settings > Health Check                │ │
│ │ Theme (umbraco-theme) - Custom backoffice themes                            │ │
│ │ Icons (umbraco-icons) - Custom icon sets                                    │ │
│ │ AuthProvider (umbraco-auth-provider) - External login buttons               │ │
│ │ MfaLoginProvider (umbraco-mfa-login-provider) - 2FA methods                 │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

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

---

## All Available Sub-Skills

### UI Extension Skills
Invoke these skills for detailed documentation on each extension type:

| Extension Type | Sub-Skill | Where It Appears |
|----------------|-----------|------------------|
| Section | `umbraco-sections` | Top navigation bar |
| Dashboard | `umbraco-dashboard` | Main content area |
| Menu | `umbraco-menu` | Sidebar container |
| MenuItem | `umbraco-menu-items` | Sidebar navigation items |
| Tree | `umbraco-tree` | Hierarchical sidebar navigation |
| TreeItem | `umbraco-tree-item` | Individual tree nodes |
| Workspace | `umbraco-workspace` | Entity editing views |
| Header App | `umbraco-header-apps` | Top-right header area |
| Modal | `umbraco-modals` | Overlay dialogs |
| Collection | `umbraco-collection` | List/grid views |
| CollectionView | `umbraco-collection-view` | Custom collection layouts |
| CollectionAction | `umbraco-collection-action` | Collection toolbar buttons |

### Action Skills
| Action Type | Sub-Skill | What It Does |
|-------------|-----------|--------------|
| Entity Action | `umbraco-entity-actions` | Context menu & workspace actions |
| Entity Bulk Action | `umbraco-entity-bulk-actions` | Multi-select operations |
| Entity Create Option | `umbraco-entity-create-option-action` | Create menu options |
| Property Action | `umbraco-property-action` | Buttons on property editors |
| Current User Action | `umbraco-current-user-action` | User profile menu items |

### Property Editor Skills
| Component | Sub-Skill | Purpose |
|-----------|-----------|---------|
| Property Editor UI | `umbraco-property-editor-ui` | Visual editor component |
| Property Editor Schema | `umbraco-property-editor-schema` | Data validation |
| Property Value Preset | `umbraco-property-value-preset` | Default value templates |
| Block Editor Custom View | `umbraco-block-editor-custom-view` | Custom block rendering |

### Rich Text Editor Skills
| Component | Sub-Skill | Purpose |
|-----------|-----------|---------|
| Tiptap Extension | `umbraco-tiptap-extension` | Core editor behavior |
| Tiptap Toolbar | `umbraco-tiptap-toolbar-extension` | Toolbar buttons |
| Tiptap Statusbar | `umbraco-tiptap-statusbar-extension` | Status bar items |
| Monaco Markdown Action | `umbraco-monaco-markdown-editor-action` | Markdown editor buttons |

### Search & Global Features
| Feature | Sub-Skill | Purpose |
|---------|-----------|---------|
| Search Provider | `umbraco-search-provider` | Global search integration |
| Search Result Item | `umbraco-search-result-item` | Custom result rendering |
| Health Check | `umbraco-health-check` | System health checks |
| Theme | `umbraco-theme` | Custom backoffice themes |
| Icons | `umbraco-icons` | Custom icon sets |

### Authentication Skills
| Component | Sub-Skill | Purpose |
|-----------|-----------|---------|
| Auth Provider | `umbraco-auth-provider` | External login (OAuth) |
| MFA Login Provider | `umbraco-mfa-login-provider` | Two-factor authentication |

### User & Package Skills
| Component | Sub-Skill | Purpose |
|-----------|-----------|---------|
| User Profile App | `umbraco-user-profile-app` | User profile tabs |
| Granular Permissions | `umbraco-granular-user-permissions` | Fine-grained access control |
| Package View | `umbraco-package-view` | Package configuration UI |
| File Upload Preview | `umbraco-file-upload-preview` | Custom upload previews |
| Preview App Provider | `umbraco-preview-app-provider` | Content preview apps |

### Advanced Configuration
| Component | Sub-Skill | Purpose |
|-----------|-----------|---------|
| Dynamic Root | `umbraco-dynamic-root` | Content picker root configuration |
| Kinds | `umbraco-kinds` | Reusable manifest templates |
| UFM Component | `umbraco-ufm-component` | Umbraco Flavored Markdown |
| Global Context | `umbraco-global-context` | App-wide shared state |

### Foundation Concepts
Essential patterns used across all extensions:

| Concept | Sub-Skill | When Needed |
|---------|-----------|-------------|
| **OpenAPI Client** | `umbraco-openapi-client` | **REQUIRED for all custom API calls** |
| Context API | `umbraco-context-api` | Accessing services, sharing data |
| Umbraco Element | `umbraco-umbraco-element` | Base class for components |
| Conditions | `umbraco-conditions` | Controlling where things appear |
| State Management | `umbraco-state-management` | Reactive UI with @state |
| Repository Pattern | `umbraco-repository-pattern` | Data access layer |
| Extension Registry | `umbraco-extension-registry` | Dynamic registration |
| Routing | `umbraco-routing` | URL structure, navigation |
| Localization | `umbraco-localization` | Multi-language support |
| Notifications | `umbraco-notifications` | Toast messages, events |
| Controllers | `umbraco-controllers` | C# API endpoints |

> **CRITICAL**: When calling custom C# API endpoints from the backoffice, **NEVER use raw `fetch()`**. This will result in 401 Unauthorized errors. Always use a generated OpenAPI client configured with Umbraco's auth context. See the `umbraco-openapi-client` skill.

### Build & Structure
| Component | Sub-Skill | Purpose |
|-----------|-----------|---------|
| Bundle | `umbraco-bundle` | Manifest aggregation |
| Entry Point | `umbraco-entry-point` | Runtime initialization |
| Extension Template | `umbraco-extension-template` | Project scaffolding |

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

## Additional Blueprints

### Blueprint 2: Time Dashboard (Comprehensive Multi-Extension Example)

A comprehensive example demonstrating 13 different extension types working together:

**Location**: `./examples/TimeDashboard/`

**Structure**:
```
TimeDashboard/Client/src/
├── bundle.manifests.ts       # Aggregates all 13 extension types
├── sections/manifest.ts      # Section registration
├── menus/                    # Menu + MenuItem
├── dashboards/               # Dashboard with time display
├── workspaces/               # Multiple workspaces + views
├── headerApps/               # Header app + modal trigger
├── modals/                   # Custom modal with token
├── propertyEditors/          # Custom property editor UI
├── documentApps/             # Document workspace app
├── actions/
│   ├── workspace/            # Workspace actions
│   └── entity/               # Entity actions
├── contexts/                 # Custom context provider
├── repository/               # Data repository + datasource
├── localization/             # en-us, en-gb translations
└── entrypoints/              # Entry point initialization
```

**Extension types demonstrated**:
1. Section + SectionSidebarApp
2. Menu + MenuItem
3. Dashboard
4. Workspace + WorkspaceViews (multiple)
5. Header App
6. Modal (with custom token)
7. Property Editor UI
8. Document App (workspace view)
9. Workspace Actions
10. Entity Actions
11. Context (custom provider)
12. Repository + DataSource
13. Localization

**Skills used**: `umbraco-sections`, `umbraco-menu`, `umbraco-menu-items`, `umbraco-dashboard`, `umbraco-workspace`, `umbraco-header-apps`, `umbraco-modals`, `umbraco-property-editor-ui`, `umbraco-entity-actions`, `umbraco-context-api`, `umbraco-repository-pattern`, `umbraco-localization`, `umbraco-entry-point`

---

### Blueprint 3: Tree Example (Settings Tree with Workspace)

A focused example showing tree navigation in Settings section with workspace:

**Location**: `./examples/tree-example/`

**Structure**:
```
tree-example/Client/src/
├── bundle.manifests.ts       # Aggregates tree + workspace
├── settingsTree/
│   ├── manifest.ts           # Tree + TreeItem + Repository registration
│   ├── ourtree.repository.ts # Repository extending UmbTreeRepositoryBase
│   ├── ourtree.data-source.ts # Data source with API calls
│   ├── ourtree.store.ts      # Tree store for caching
│   └── types.ts              # Type definitions
├── workspace/
│   ├── manifest.ts           # Workspace + WorkspaceView
│   ├── ourtree-workspace.context.ts       # Workspace context
│   ├── ourtree-workspace.context-token.ts # Context token
│   ├── ourtree-workspace-editor.element.ts # Workspace editor
│   └── views/
│       └── ourtree-workspace-view.element.ts
└── entrypoints/
```

**Features demonstrated**:
- Tree appearing in Settings section (via conditions)
- Tree repository with data source pattern
- Tree store for state management
- Workspace context with token pattern
- Workspace editor element
- entityType linking tree items to workspace

**Key connections**:
```
Tree (appears in Settings via conditions)
    └── TreeItem (entityType: "ourtree-entity")
            └── Click → Workspace
                    └── WorkspaceContext (via token)
                            └── WorkspaceView
```

**Skills used**: `umbraco-tree`, `umbraco-tree-item`, `umbraco-workspace`, `umbraco-context-api`, `umbraco-repository-pattern`, `umbraco-state-management`, `umbraco-conditions`

---

### Blueprint 4: Notes/Wiki (Full-Stack with C# Backend)

A comprehensive example showing Section + Tree + Workspace with C# backend:

**Location**: `./examples/notes-wiki/`

**Features demonstrated**:
- Full hierarchical tree with folders and notes
- Multiple workspace types (Note, Folder)
- C# API controllers with JSON persistence
- Dashboard with search and recent items
- Entity actions (Save, Delete)

**Skills used**: 27 different skills - see `./examples/notes-wiki/PLAN.md` for the full mapping.

This is the most complete example, demonstrating how all extension types work together in a real-world feature.

---

### Future Blueprints

More blueprints planned:
- **Blueprint 5**: Dashboard-only (add to existing section)
- **Blueprint 6**: Header App with Modal
- **Blueprint 7**: Property Editor (custom data type)
- **Blueprint 8**: Search Provider integration
