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

This skill provides complete working blueprints. The source code is in `./examples/` - copy and adapt for your needs.

For details on individual extension types, invoke the referenced sub-skills.

> **TIP**: If the Umbraco CMS source code is available in your workspace, use it as a reference and for inspiration. The backoffice client code in `src/Umbraco.Web.UI.Client/src/packages/` shows production implementations of all extension types - study how the core team structures sections, workspaces, trees, and other patterns.

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

## Available Examples

Each example has a detailed README.md with full documentation. See the `examples/` folder.

| Example | Complexity | What It Shows |
|---------|------------|---------------|
| **Blueprint** | Starter | Section + Menu + Dashboard + Workspace - the fundamental pattern |
| **tree-example** | Intermediate | Tree navigation in Settings section with Workspace |
| **TimeDashboard** | Advanced | 13+ extension types including Header Apps, Modals, Property Editors |
| **notes-wiki** | Full-stack | Complete C# backend with CRUD, hierarchical tree, multiple workspaces |

### Quick Reference

- **Need a new section?** Start with `Blueprint`
- **Need tree navigation?** See `tree-example`
- **Need specific extension type?** Check `TimeDashboard` for examples
- **Need full-stack with API?** Study `notes-wiki`

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
| **Add Extension Reference** | `umbraco-add-extension-reference` | **Register extension in Umbraco instance** |

---

## Using the Examples

1. **Browse** the `examples/` folder and read the README.md for each example
2. **Copy** the example closest to your needs into your project
3. **Rename** aliases from the example namespace to your own (e.g., `Blueprint.*` to `MyApp.*`)
4. **Update** the `entityType` values to match your domain
5. **Customise** the UI components for your use case
6. **Register** with Umbraco via `umbraco-package.json`
7. **Add project reference** to the main Umbraco instance - use skill `umbraco-add-extension-reference`
