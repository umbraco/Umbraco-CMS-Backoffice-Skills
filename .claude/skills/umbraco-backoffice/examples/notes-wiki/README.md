# Notes Wiki - Umbraco Backoffice Extension Example

A comprehensive example demonstrating how multiple Umbraco backoffice extension types work together to create a real-world feature.

## What This Example Shows

This example creates an internal wiki/notes system that demonstrates:

### Extension Types Used

| Extension Type | Purpose |
|----------------|---------|
| Section | Top-level navigation in backoffice header |
| SectionSidebarApp | Sidebar container for the section |
| Menu + MenuItem | Sidebar navigation structure |
| Dashboard | Welcome panel when nothing selected |
| Tree + TreeItem | Hierarchical navigation of notes/folders |
| Workspace | Editing views for notes and folders |
| WorkspaceView | Multiple tabs within workspaces |
| Localization | Multi-language support |

### Key Patterns Demonstrated

1. **Section → Dashboard Connection**
   - Dashboard uses `conditions` with `Umb.Condition.SectionAlias` to appear only in the Notes section

2. **Section → SidebarApp → Menu → MenuItem → Tree Chain**
   - SidebarApp uses condition to appear in section
   - SidebarApp references Menu via `meta.menu`
   - MenuItem belongs to Menu via `meta.menus`
   - MenuItem shows Tree via `meta.treeAlias`

3. **Tree Item → Workspace via entityType** (The Critical Link)
   - Tree items have an `entityType` property
   - Workspaces declare which `entityType` they handle
   - Clicking a tree item opens the matching workspace

4. **Workspace → WorkspaceView via Condition**
   - WorkspaceViews use condition to appear in specific workspaces

## Project Structure

```
notes-wiki/
├── Client/
│   ├── src/
│   │   ├── constants.ts         # Central aliases & entity types
│   │   ├── bundle.manifests.ts  # Aggregator with learning comments
│   │   │
│   │   ├── section/             # Section registration
│   │   ├── sidebar/             # SectionSidebarApp
│   │   ├── menu/                # Menu + MenuItem (tree kind)
│   │   ├── dashboard/           # Welcome dashboard
│   │   ├── tree/                # Tree + Repository + DataSource
│   │   │
│   │   ├── workspace/
│   │   │   ├── note/            # Note workspace + views
│   │   │   └── folder/          # Folder workspace
│   │   │
│   │   ├── types/               # TypeScript interfaces
│   │   ├── localization/        # Multi-language support
│   │   └── entrypoints/         # Entry point initialization
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── public/umbraco-package.json
│
├── Composers/                   # DI and Swagger setup
├── Controllers/                 # API endpoints
├── Models/                      # Data models
├── Services/                    # Business logic + JSON persistence
├── Constants.cs                 # C# constants
│
├── wwwroot/App_Plugins/NotesWiki/  # Built client output
└── NotesWiki.csproj
```

## How to Use

### Building the Client

```bash
cd Client
npm install
npm run build
```

This builds the client to `wwwroot/App_Plugins/NotesWiki/`.

### Running with Umbraco

1. Add a reference to `NotesWiki.csproj` in your Umbraco project
2. Build and run
3. Navigate to the backoffice and look for the "Notes" section

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/umbraco/notes/api/v1/tree/root` | Root tree items |
| GET | `/umbraco/notes/api/v1/tree/children/{parentId}` | Children of folder |
| GET | `/umbraco/notes/api/v1/tree/ancestors/{id}` | Ancestor path |
| GET | `/umbraco/notes/api/v1/notes/{id}` | Get note |
| POST | `/umbraco/notes/api/v1/notes` | Create note |
| PUT | `/umbraco/notes/api/v1/notes/{id}` | Update note |
| DELETE | `/umbraco/notes/api/v1/notes/{id}` | Delete note |
| GET | `/umbraco/notes/api/v1/notes/recent` | Recent notes |
| GET | `/umbraco/notes/api/v1/notes/search?q={query}` | Search notes |
| GET | `/umbraco/notes/api/v1/folders/{id}` | Get folder |
| POST | `/umbraco/notes/api/v1/folders` | Create folder |
| PUT | `/umbraco/notes/api/v1/folders/{id}` | Rename folder |
| DELETE | `/umbraco/notes/api/v1/folders/{id}` | Delete folder |

## Skills Referenced

This example uses the following skills from the umbraco-backoffice skill collection:

- `umbraco-sections` - Section and SidebarApp
- `umbraco-dashboard` - Dashboard registration
- `umbraco-menu` - Menu container
- `umbraco-menu-items` - MenuItem with tree kind
- `umbraco-tree` - Tree structure
- `umbraco-tree-item` - Tree item rendering
- `umbraco-workspace` - Workspace registration
- `umbraco-context-api` - Workspace context pattern
- `umbraco-state-management` - Observable state
- `umbraco-repository-pattern` - Data access layer
- `umbraco-conditions` - Extension visibility
- `umbraco-routing` - URL structure
- `umbraco-localization` - Multi-language support
- `umbraco-controllers` - C# API controllers
- `umbraco-umbraco-element` - Base element class
- `umbraco-bundle` - Manifest aggregation
- `umbraco-entry-point` - Initialization

## Learning Path

1. **Beginner**: Start with `section/manifest.ts` and `dashboard/manifest.ts`
2. **Intermediate**: Add `tree/manifest.ts` and understand entityType linking
3. **Advanced**: Study `workspace/` and the context pattern

## Data Storage

This example uses JSON file persistence in `App_Data/NotesWiki/data.json`.
Sample data is created automatically on first run.

For production use, replace `NotesService` with a proper database implementation.
