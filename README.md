# Umbraco Backoffice Skills Marketplace

> **Experimental Beta:** This project is an exploration of what's possible with Skills for Umbraco. It's evolving as we learn what works best.

A Claude Code plugin marketplace with 66 skills for Umbraco backoffice customization and testing.

## Quick Start

Add the marketplace:
```bash
/plugin marketplace add umbraco/Umbraco-CMS-Backoffice-Skills
```

Install the plugins:
```bash
# Backoffice extension skills (58 skills)
/plugin install umbraco-cms-backoffice-skills@umbraco-backoffice-marketplace

# Testing skills (8 skills) - optional but recommended
/plugin install umbraco-cms-backoffice-testing-skills@umbraco-backoffice-marketplace
```

---

## Getting Started Skills

These skills are your entry points for Umbraco backoffice extension development. Start here.

### `umbraco-quickstart` - Smart Environment Check

**Start here if you're new.** This skill checks your environment and sets up what's needed automatically.

It detects:
- Whether you have an Umbraco instance
- Any existing extensions
- If testing skills are installed
- If Umbraco CMS source is available (for better code generation)

```bash
/umbraco-quickstart
```

---

### Manual Setup

If you prefer to set things up step by step:

#### 1. Create an Umbraco Instance

Use the `package-script-writer` skill to create an Umbraco instance using the [PSW CLI](https://github.com/prjseal/Package-Script-Writer-CLI).

```bash
/package-script-writer MyProject
```

Thanks to Paul Seal ([@prjseal](https://github.com/prjseal)) for his hard work on the PSW CLI.

#### 2. Create an Extension

Use `umbraco-extension-template` to create a new extension project:

```bash
/umbraco-extension-template MyFeature
```

Or manually:
```bash
dotnet new install Umbraco.Templates
dotnet new umbraco-extension -n MyExtension -ex
cd MyExtension/Client && npm install && npm run watch
```

#### 3. Register the Extension

Use `umbraco-add-extension-reference` to register your extension with the Umbraco project:

```bash
/umbraco-add-extension-reference MyExtension
```

This adds a `<ProjectReference>` to your Umbraco `.csproj` file so the extension loads.

---

### `umbraco-backoffice` - The Backbone Skill

**This is the most important skill.** It provides:

- **Complete Extension Map** - Visual diagram showing where ALL 57 extension types appear in the backoffice UI
- **Working Blueprints** - Copy-and-adapt examples for common patterns
- **Sub-Skill Reference** - Links to all other skills organised by category

**Use this skill when:**
- Starting a new backoffice customisation project
- Understanding how extension types connect together
- Finding the right skill for a specific UI location

**Blueprints included:**
| Blueprint | Description | Skills Used |
|-----------|-------------|-------------|
| Blueprint 1 | Section + Menu + Dashboard + Workspace | 6 skills |
| TimeDashboard | 13 extension types working together | 13 skills |
| tree-example | Settings tree with workspace | 7 skills |
| notes-wiki | Full-stack with C# backend | 27 skills |

```bash
/umbraco-backoffice
```

---

## Best Practice: Add Umbraco CMS Source Code

These skills work best when Claude has access to the Umbraco CMS source code. This allows Claude to:
- Reference actual Umbraco implementations and patterns
- Understand types, interfaces, and base classes
- Follow existing code conventions accurately

**Recommended setup:**

1. Clone the Umbraco CMS repository alongside your project:
   ```bash
   git clone https://github.com/umbraco/Umbraco-CMS.git
   ```

2. Add the backoffice client source as a working directory in Claude Code:
   ```bash
   /add-dir /path/to/Umbraco-CMS/src/Umbraco.Web.UI.Client
   ```

This gives Claude direct access to the backoffice TypeScript source code, making it much more effective at generating accurate, idiomatic Umbraco extensions.

---

## All Skills Reference

### Foundation (10 skills)
Core architectural concepts used across all extensions:

| Skill | Description |
|-------|-------------|
| `umbraco-context-api` | Provider-consumer pattern for data sharing |
| `umbraco-repository-pattern` | Data access layer abstraction |
| `umbraco-extension-registry` | Dynamic extension registration |
| `umbraco-conditions` | Control where extensions appear |
| `umbraco-state-management` | Reactive UI with @state |
| `umbraco-localization` | Multi-language support |
| `umbraco-routing` | URL structure and navigation |
| `umbraco-notifications` | Toast messages and events |
| `umbraco-umbraco-element` | Base class for components |
| `umbraco-controllers` | C# API endpoints |

### Extension Types (30 skills)
UI extensions for the backoffice:

**Navigation & Sections**
- `umbraco-sections` - Top-level navigation
- `umbraco-menu` / `umbraco-menu-items` - Sidebar menus
- `umbraco-header-apps` - Header bar apps

**Content Areas**
- `umbraco-dashboard` - Welcome panels
- `umbraco-workspace` - Entity editing views
- `umbraco-tree` / `umbraco-tree-item` - Hierarchical navigation
- `umbraco-collection` / `umbraco-collection-view` / `umbraco-collection-action` - List/grid views

**Actions**
- `umbraco-entity-actions` - Context menu actions
- `umbraco-entity-bulk-actions` - Multi-select operations
- `umbraco-entity-create-option-action` - Create menu options
- `umbraco-current-user-action` - User profile actions

**UI Components**
- `umbraco-modals` - Dialogs and sidebars
- `umbraco-icons` - Custom icon sets
- `umbraco-theme` - Backoffice themes
- `umbraco-ufm-component` - Umbraco Flavored Markdown

**Search & Preview**
- `umbraco-search-provider` - Global search
- `umbraco-search-result-item` - Custom result rendering
- `umbraco-preview-app-provider` - Content preview apps

**Advanced**
- `umbraco-global-context` - App-wide shared state
- `umbraco-kinds` - Reusable manifest templates
- `umbraco-dynamic-root` - Content picker configuration
- `umbraco-user-profile-app` - User profile tabs
- `umbraco-health-check` - System health checks
- `umbraco-package-view` - Package configuration UI
- `umbraco-entry-point` / `umbraco-bundle` - Extension lifecycle

### Property Editors (6 skills)
Custom data type editors:

| Skill | Description |
|-------|-------------|
| `umbraco-property-editor-ui` | Visual editor component |
| `umbraco-property-editor-schema` | Data validation |
| `umbraco-property-action` | Property buttons |
| `umbraco-property-value-preset` | Default value templates |
| `umbraco-file-upload-preview` | Upload previews |
| `umbraco-block-editor-custom-view` | Block rendering |

### Rich Text (4 skills)
Tiptap editor customization:

| Skill | Description |
|-------|-------------|
| `umbraco-tiptap-extension` | Core editor behavior |
| `umbraco-tiptap-toolbar-extension` | Toolbar buttons |
| `umbraco-tiptap-statusbar-extension` | Status bar items |
| `umbraco-monaco-markdown-editor-action` | Markdown buttons |

### Backend (4 skills)
Authentication and API integration:

| Skill | Description |
|-------|-------------|
| `umbraco-openapi-client` | **Required for custom API calls** |
| `umbraco-auth-provider` | External login (OAuth) |
| `umbraco-mfa-login-provider` | Two-factor authentication |
| `umbraco-granular-user-permissions` | Fine-grained access |

### Testing (8 skills)
Complete testing pyramid for Umbraco extensions:

| Skill | Description |
|-------|-------------|
| `umbraco-testing` | **Router skill** - Choose the right testing approach |
| `umbraco-unit-testing` | Unit tests with @open-wc/testing |
| `umbraco-mocked-backoffice` | Test in mocked backoffice (no .NET required) |
| `umbraco-e2e-testing` | E2E tests against real Umbraco |
| `umbraco-playwright-testhelpers` | Full testhelpers API reference |
| `umbraco-test-builders` | JsonModels.Builders for test data |
| `umbraco-msw-testing` | MSW handlers for API mocking |
| `umbraco-example-generator` | Generate testable extensions |

**Testing Pyramid:**
```
                ┌─────────────┐
                │   E2E Tests │  ← Real Umbraco, complete workflows
                └─────────────┘
          ┌─────────────────────────┐
          │   Mocked Backoffice     │  ← No backend, realistic UI
          └─────────────────────────┘
    ┌─────────────────────────────────────┐
    │           Unit Tests                │  ← Fast, isolated
    └─────────────────────────────────────┘
```

**Critical:** E2E tests must use `@umbraco/playwright-testhelpers` and `@umbraco/json-models-builders`. Never write raw Playwright tests for Umbraco.

```bash
/umbraco-testing
```

---

## Examples

Complete working examples in the `examples/` folder:

- **Blueprint** - Section + Menu + Dashboard + Workspace
- **TimeDashboard** - 13 extension types working together
- **tree-example** - Settings tree with workspace + **complete testing pyramid** (32 tests across unit, mocked, and E2E)
- **notes-wiki** - Full-stack with C# backend (27 skills)
- **document-type-crud** - E2E testing example with testhelpers

## Usage

Invoke any skill by name:
```
Use the umbraco-dashboard skill to create a new dashboard
```

Or reference in conversation:
```
I need to create a custom tree in the Settings section
```
Claude will automatically use the relevant skills (`umbraco-tree`, `umbraco-conditions`, etc.)

## Project Structure

```
Umbraco-CMS-Backoffice-Skills/
├── .claude-plugin/marketplace.json     # Marketplace manifest
├── plugins/
│   ├── umbraco-backoffice-skills/      # Plugin with 58 extension skills
│   │   ├── .claude-plugin/plugin.json
│   │   └── skills/
│   │       ├── umbraco-dashboard/SKILL.md
│   │       ├── umbraco-tree/SKILL.md
│   │       └── ... (57 skills)
│   └── umbraco-testing-skills/         # Plugin with 8 testing skills
│       ├── .claude-plugin/plugin.json
│       └── skills/
│           ├── umbraco-testing/SKILL.md
│           ├── umbraco-e2e-testing/SKILL.md
│           └── ... (8 skills + examples)
├── examples/                           # Working code examples
├── Umbraco-CMS.Skills/                 # .NET test project
└── .claude/
    ├── commands/                       # Local commands
    └── settings.local.json             # Local permissions
```

## License

MIT

## Credits

Built by Phil W ([@hifi-phil](https://github.com/hifi-phil))

Skills based on [Umbraco CMS](https://umbraco.com/) backoffice documentation.
