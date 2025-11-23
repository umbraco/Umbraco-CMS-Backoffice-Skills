const workspaceAlias = "My.Workspace.Demo";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "workspace",
    kind: "default",
    alias: workspaceAlias,
    name: "Demo Workspace",
    element: () => import("./demo-workspace.element.js"),
    meta: {
      entityType: "demo-workspace",
    },
  },
  {
    type: "workspaceView",
    alias: "My.WorkspaceView.Demo",
    name: "Demo Workspace View",
    element: () => import("./demo-workspace.element.js"),
    meta: {
      label: "Overview",
      pathname: "overview",
      icon: "icon-document",
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: workspaceAlias,
      },
    ],
  },
];
