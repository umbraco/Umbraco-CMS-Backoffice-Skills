import { UMB_WORKSPACE_CONDITION_ALIAS } from "@umbraco-cms/backoffice/workspace";

const workspaceAlias = "Blueprint.Workspace";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "workspace",
    alias: workspaceAlias,
    name: "Blueprint Workspace",
    element: () => import("./workspace.element.js"),
    meta: {
      // entityType links this workspace to menu items with the same entityType
      entityType: "blueprint-entity",
    },
  },
  {
    type: 'workspaceView',
    alias: 'time.workspace.another',
    name: 'default view',
    js: () => import('./views/anotherWorkspace.element.js'),
    weight: 300,
    meta: {
      icon: 'icon-alarm-clock',
      pathname: 'another',
      label: 'another'
    },
    conditions: [
      {
        alias: 'Umb.Condition.WorkspaceAlias',
        match: workspaceAlias
      },
    ],
  },
  {
    type: 'workspaceView',
    alias: 'time.workspace.default',
    name: 'default view',
    js: () => import('./views/defaultWorkspace.element.js'),
    weight: 300,
    meta: {
      icon: 'icon-alarm-clock',
      pathname: 'overview',
      label: 'time'
    },
    conditions: [
      {
        alias: 'Umb.Condition.WorkspaceAlias',
        match: workspaceAlias
      },
    ],
  },
  {
    type: 'workspaceContext',
    name: 'Example Counter Workspace Context',
    alias: 'example.workspaceContext.counter',
    api: () => import('./context.js'),
    conditions: [
      {
        alias: UMB_WORKSPACE_CONDITION_ALIAS,
        match: 'Umb.Workspace.Document',
      },
    ]
  }
];
