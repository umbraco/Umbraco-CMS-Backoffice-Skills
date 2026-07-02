/**
 * Canonical "external example" support overlay for the Umbraco backoffice client.
 *
 * Stock released Umbraco v18 only loads an example from a path RELATIVE to the client's
 * own ./examples dir. To run this repo's mocked-backoffice E2E suites we need to load an
 * extension from an ABSOLUTE path outside the client. This overlay reproduces the changes
 * from the Umbraco `external-extension-dev-support` work, so the mocked suites are
 * self-contained and don't depend on a special CMS branch.
 *
 * `patch-client.mjs` injects these snippets into a target client's `index.ts` and
 * `vite.config.ts` at test time (backing up the originals) and reverts afterwards.
 *
 * Indentation is TABS to match the client source. `find` strings must match verbatim;
 * if a future client version changes them, update the anchors here.
 */

// --- index.ts: example injector (relative unchanged; absolute served via Vite /@fs/) ---
export const INDEX_TS = {
	file: 'index.ts',
	// Marker proving support is already present (WIP branch or a previous patch).
	marker: '/@fs',
	find:
		"\tif (import.meta.env.VITE_EXAMPLE_PATH) {\n" +
		"\t\timport(/* @vite-ignore */ './' + import.meta.env.VITE_EXAMPLE_PATH + '/index.ts').then((js) => {",
	replace:
		"\tif (import.meta.env.VITE_EXAMPLE_PATH) {\n" +
		"\t\tconst examplePath = import.meta.env.VITE_EXAMPLE_PATH;\n" +
		"\t\tconst importPath = examplePath.startsWith('/') ? '/@fs' + examplePath : './' + examplePath;\n" +
		"\t\timport(/* @vite-ignore */ importPath + '/index.ts').then((js) => {",
};

// --- vite.config.ts: imports + shared-package consts ---
const VITE_CONFIG_HEADER = {
	find: "import viteTSConfigPaths from 'vite-tsconfig-paths';",
	replace:
		"import viteTSConfigPaths from 'vite-tsconfig-paths';\n" +
		"import path from 'path';\n" +
		"\n" +
		"// External example support (injected by UmbracoCMS_Skills mocked-backoffice harness).\n" +
		"// When VITE_EXAMPLE_PATH is an absolute path it points at an extension outside this repo.\n" +
		"// Relative paths (folders under ./examples) are unaffected — the config below is a no-op.\n" +
		"const EXAMPLE_PATH = process.env.VITE_EXAMPLE_PATH;\n" +
		"const externalExamplePath = EXAMPLE_PATH?.startsWith('/') ? path.resolve(EXAMPLE_PATH) : null;\n" +
		"// Shared libs that must resolve to ONE instance (the client's). Imports from files outside\n" +
		"// the project root bypass vite-tsconfig-paths, so the external-example-resolver plugin below\n" +
		"// re-resolves them through the main project — otherwise duplicate Lit/UUI break rendering.\n" +
		"const SHARED_PACKAGE_PREFIXES = ['@umbraco-cms/backoffice', 'lit', '@umbraco-ui/uui'];\n" +
		"const isSharedPackage = (source: string) => SHARED_PACKAGE_PREFIXES.some((prefix) => source.startsWith(prefix));",
};

// --- vite.config.ts: extend defineConfig (resolve/server/optimizeDeps/plugins) ---
const VITE_CONFIG_PLUGINS = {
	// Marker proving support is already present.
	marker: 'external-example-resolver',
	find: "\tplugins,\n});",
	replace:
		"\t// Dedupe shared front-end libraries so an external example never loads its own copy.\n" +
		"\tresolve: externalExamplePath ? { dedupe: [...SHARED_PACKAGE_PREFIXES] } : undefined,\n" +
		"\t// Allow Vite to serve files from the external example folder (outside the project root).\n" +
		"\tserver: externalExamplePath ? { fs: { allow: ['.', externalExamplePath] } } : undefined,\n" +
		"\t// Crawl the external example at startup so its deps optimize up-front — otherwise vite\n" +
		"\t// discovers them on first navigation and does a full restart mid-run (connection refused\n" +
		"\t// / flaky first test). Exclude dev/test-only deps that break pre-bundling.\n" +
		"\toptimizeDeps: externalExamplePath\n" +
		"\t\t? {\n" +
		"\t\t\t\tentries: [path.join(externalExamplePath, 'index.ts')],\n" +
		"\t\t\t\texclude: ['puppeteer-core', '@web/dev-server-core', '@web/dev-server-esbuild', '@web/dev-server-rollup'],\n" +
		"\t\t\t}\n" +
		"\t\t: undefined,\n" +
		"\tplugins: [\n" +
		"\t\t...plugins,\n" +
		"\t\t// Re-resolve shared-package imports from the external example through the main project.\n" +
		"\t\t...(externalExamplePath\n" +
		"\t\t\t? [\n" +
		"\t\t\t\t\t{\n" +
		"\t\t\t\t\t\tname: 'external-example-resolver',\n" +
		"\t\t\t\t\t\tenforce: 'pre' as const,\n" +
		"\t\t\t\t\t\tresolveId(source: string, importer: string | undefined) {\n" +
		"\t\t\t\t\t\t\tif (!importer?.startsWith(externalExamplePath)) return null;\n" +
		"\t\t\t\t\t\t\tif (!isSharedPackage(source)) return null;\n" +
		"\t\t\t\t\t\t\treturn this.resolve(source, path.resolve('./index.ts'), { skipSelf: true });\n" +
		"\t\t\t\t\t\t},\n" +
		"\t\t\t\t\t},\n" +
		"\t\t\t\t]\n" +
		"\t\t\t: []),\n" +
		"\t],\n" +
		"});",
};

export const VITE_CONFIG = {
	file: 'vite.config.ts',
	marker: VITE_CONFIG_PLUGINS.marker,
	edits: [VITE_CONFIG_HEADER, VITE_CONFIG_PLUGINS],
};

export const OVERLAY_FILES = [INDEX_TS, VITE_CONFIG];
