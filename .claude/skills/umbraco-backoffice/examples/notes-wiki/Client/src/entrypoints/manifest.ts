/**
 * Notes Entry Point Manifest
 *
 * Optional entry point for initialization logic.
 * Entry points run when the extension loads.
 *
 * Skills used: umbraco-entry-point
 */

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "entryPoint",
    alias: "Notes.EntryPoint",
    name: "Notes Entry Point",
    js: () => import("./entrypoint.js"),
  },
];
