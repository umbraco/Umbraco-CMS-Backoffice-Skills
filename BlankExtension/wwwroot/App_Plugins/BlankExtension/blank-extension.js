const i = [
  {
    name: "Blank Extension Entrypoint",
    alias: "BlankExtension.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-BSlTz4-p.js")
  }
], s = "BlankExtension.Section", e = "BlankExtension.Menu", o = {
  type: "menu",
  alias: e,
  name: "Blank Extension Menu",
  meta: {
    label: "Navigation"
  }
}, r = {
  type: "menuItem",
  alias: "BlankExtension.MenuItem.Dashboard",
  name: "Dashboard Menu Item",
  weight: 300,
  // Higher weight = appears first
  meta: {
    label: "Dashboard",
    icon: "icon-dashboard",
    entityType: "blank-extension-dashboard",
    // Links to Dashboard workspace
    menus: [e]
  }
}, p = {
  type: "menuItem",
  alias: "BlankExtension.MenuItem.Settings",
  name: "Settings Menu Item",
  weight: 200,
  meta: {
    label: "Settings",
    icon: "icon-settings",
    entityType: "blank-extension-settings",
    // Links to Settings workspace
    menus: [e]
  }
}, m = {
  type: "menuItem",
  alias: "BlankExtension.MenuItem.Reports",
  name: "Reports Menu Item",
  weight: 100,
  meta: {
    label: "Reports",
    icon: "icon-chart-curve",
    entityType: "blank-extension-reports",
    // Links to Reports workspace
    menus: [e]
  }
}, c = {
  type: "sectionSidebarApp",
  kind: "menuWithEntityActions",
  alias: "BlankExtension.SidebarApp",
  name: "Blank Extension Sidebar",
  meta: {
    label: "Items",
    menu: e
  },
  conditions: [
    {
      alias: "Umb.Condition.SectionAlias",
      match: s
    }
  ]
}, l = [
  // Section - appears in top navigation
  {
    type: "section",
    alias: s,
    name: "Blank Extension Section",
    weight: 100,
    meta: {
      label: "Blank Extension",
      pathname: "blank-extension"
    }
  },
  c,
  o,
  r,
  p,
  m
], n = "BlankExtension.Workspace.Dashboard", t = "BlankExtension.Workspace.Settings", a = "BlankExtension.Workspace.Reports", k = [
  // Dashboard Workspace
  {
    type: "workspace",
    alias: n,
    name: "Dashboard Workspace",
    element: () => import("./dashboard-workspace.element-Dzn8_6IR.js"),
    meta: {
      entityType: "blank-extension-dashboard"
    }
  },
  {
    type: "workspaceView",
    alias: "BlankExtension.WorkspaceView.Dashboard",
    name: "Dashboard Workspace View",
    js: () => import("./dashboard-workspace.element-Dzn8_6IR.js"),
    weight: 100,
    meta: {
      label: "Overview",
      pathname: "overview",
      icon: "icon-dashboard"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: n
      }
    ]
  },
  // Settings Workspace
  {
    type: "workspace",
    alias: t,
    name: "Settings Workspace",
    element: () => import("./settings-workspace.element-Do3we-SC.js"),
    meta: {
      entityType: "blank-extension-settings"
    }
  },
  {
    type: "workspaceView",
    alias: "BlankExtension.WorkspaceView.Settings",
    name: "Settings Workspace View",
    js: () => import("./settings-workspace.element-Do3we-SC.js"),
    weight: 100,
    meta: {
      label: "Configuration",
      pathname: "configuration",
      icon: "icon-settings"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: t
      }
    ]
  },
  // Reports Workspace
  {
    type: "workspace",
    alias: a,
    name: "Reports Workspace",
    element: () => import("./reports-workspace.element-5StGWH9q.js"),
    meta: {
      entityType: "blank-extension-reports"
    }
  },
  {
    type: "workspaceView",
    alias: "BlankExtension.WorkspaceView.Reports",
    name: "Reports Workspace View",
    js: () => import("./reports-workspace.element-5StGWH9q.js"),
    weight: 100,
    meta: {
      label: "View Reports",
      pathname: "view-reports",
      icon: "icon-chart-curve"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: a
      }
    ]
  }
], b = [
  ...i,
  ...l,
  ...k
];
export {
  b as manifests
};
//# sourceMappingURL=blank-extension.js.map
