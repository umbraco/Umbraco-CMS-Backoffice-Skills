export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Blank Extension 2Entrypoint",
    alias: "BlankExtension2.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint.js"),
  },
];
