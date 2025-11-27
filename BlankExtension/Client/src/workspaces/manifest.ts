// Workspace aliases
const dashboardWorkspaceAlias = "BlankExtension.Workspace.Dashboard";
const settingsWorkspaceAlias = "BlankExtension.Workspace.Settings";
const reportsWorkspaceAlias = "BlankExtension.Workspace.Reports";

export const manifests: Array<UmbExtensionManifest> = [
  // Dashboard Workspace
  {
    type: "workspace",
    alias: dashboardWorkspaceAlias,
    name: "Dashboard Workspace",
    element: () => import("./dashboard-workspace.element.js"),
    meta: {
      entityType: "blank-extension-dashboard",
    },
  },
  {
    type: "workspaceView",
    alias: "BlankExtension.WorkspaceView.Dashboard",
    name: "Dashboard Workspace View",
    js: () => import("./dashboard-workspace.element.js"),
    weight: 100,
    meta: {
      label: "Overview",
      pathname: "overview",
      icon: "icon-dashboard",
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: dashboardWorkspaceAlias,
      },
    ],
  },

  // Settings Workspace
  {
    type: "workspace",
    alias: settingsWorkspaceAlias,
    name: "Settings Workspace",
    element: () => import("./settings-workspace.element.js"),
    meta: {
      entityType: "blank-extension-settings",
    },
  },
  {
    type: "workspaceView",
    alias: "BlankExtension.WorkspaceView.Settings",
    name: "Settings Workspace View",
    js: () => import("./settings-workspace.element.js"),
    weight: 100,
    meta: {
      label: "Configuration",
      pathname: "configuration",
      icon: "icon-settings",
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: settingsWorkspaceAlias,
      },
    ],
  },

  // Reports Workspace
  {
    type: "workspace",
    alias: reportsWorkspaceAlias,
    name: "Reports Workspace",
    element: () => import("./reports-workspace.element.js"),
    meta: {
      entityType: "blank-extension-reports",
    },
  },
  {
    type: "workspaceView",
    alias: "BlankExtension.WorkspaceView.Reports",
    name: "Reports Workspace View",
    js: () => import("./reports-workspace.element.js"),
    weight: 100,
    meta: {
      label: "View Reports",
      pathname: "view-reports",
      icon: "icon-chart-curve",
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: reportsWorkspaceAlias,
      },
    ],
  },
];
