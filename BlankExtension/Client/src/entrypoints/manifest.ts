export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Blank Extension Entrypoint",
    alias: "BlankExtension.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint.js"),
  },
];
