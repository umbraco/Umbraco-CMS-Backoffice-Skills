const repositoryAlias = "My.Repository.Demo.Tree";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "repository",
    alias: repositoryAlias,
    name: "Demo Tree Repository",
    api: () => import("./demo-tree-repository.js"),
  },
  {
    type: "tree",
    kind: "default",
    alias: "My.Tree.Demo",
    name: "Demo Tree",
    meta: {
      repositoryAlias: repositoryAlias,
    },
  },
  {
    type: "treeItem",
    kind: "default",
    alias: "My.TreeItem.Demo",
    name: "Demo Tree Item",
    forEntityTypes: ["demo-tree-item", "demo-tree-root"],
  },
];
