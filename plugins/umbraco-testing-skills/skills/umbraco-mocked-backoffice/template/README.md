# Example Extension for Umbraco Mocked Backoffice

This is an example extension that can be loaded into the Umbraco mocked backoffice.

## Usage

```bash
cd /path/to/Umbraco-CMS/src/Umbraco.Web.UI.Client
VITE_EXTERNAL_EXTENSION=/path/to/this/folder/src npm run dev:external
```

Open http://localhost:5173 and navigate to Content section to see the dashboard.

## Structure

```
src/
├── index.ts                    # Exports manifests array
└── example-dashboard.element.ts # Dashboard element
```

## Creating Your Own Extension

Copy this template and modify:

1. Update `index.ts` with your manifests
2. Create your elements in separate `.element.ts` files
3. Run `npm install` for IDE support

Your extension must export a `manifests` array from `index.ts`.
