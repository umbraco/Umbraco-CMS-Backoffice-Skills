import { UMB_WORKSPACE_CONDITION_ALIAS as n } from "@umbraco-cms/backoffice/workspace";
const a = [
  {
    name: "Blueprint Entrypoint",
    alias: "Blueprint.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-CWUPkU2h.js")
  }
], i = [
  {
    name: "Blueprint Dashboard",
    alias: "Blueprint.Dashboard",
    type: "dashboard",
    js: () => import("./dashboard.element--L2h73vx.js"),
    weight: 100,
    meta: {
      label: "Welcome",
      pathname: "welcome"
    },
    conditions: [
      {
        // Dashboard only shows in the Blueprint section
        alias: "Umb.Condition.SectionAlias",
        match: "Blueprint.Section"
      }
    ]
  }
], t = "Blueprint.Section", o = {
  type: "menu",
  alias: "Blueprint.Menu",
  name: "Blueprint Menu",
  meta: {
    label: "Navigation"
  }
}, s = {
  type: "menuItem",
  alias: "Blueprint.MenuItem",
  name: "Blueprint Menu Item",
  meta: {
    label: "My Item",
    icon: "icon-document",
    entityType: "blueprint-entity",
    // Links to workspace via entityType
    menus: ["Blueprint.Menu"]
  }
}, m = {
  type: "sectionSidebarApp",
  kind: "menuWithEntityActions",
  alias: "Blueprint.SidebarApp",
  name: "Blueprint Sidebar",
  meta: {
    label: "Items",
    menu: "Blueprint.Menu"
  },
  conditions: [
    {
      alias: "Umb.Condition.SectionAlias",
      match: t
    }
  ]
}, p = [
  // Section - appears in top navigation
  {
    type: "section",
    alias: t,
    name: "Blueprint Section",
    weight: 100,
    meta: {
      label: "Blueprint",
      pathname: "blueprint"
    }
  },
  m,
  o,
  s
], e = "Blueprint.Workspace", l = [
  {
    type: "workspace",
    alias: e,
    name: "Blueprint Workspace",
    element: () => import("./workspace.element-BcQCVxYA.js"),
    meta: {
      // entityType links this workspace to menu items with the same entityType
      entityType: "blueprint-entity"
    }
  },
  {
    type: "workspaceView",
    alias: "time.workspace.another",
    name: "default view",
    js: () => import("./anotherWorkspace.element-BUvos9ks.js"),
    weight: 300,
    meta: {
      icon: "icon-alarm-clock",
      pathname: "another",
      label: "another"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: e
      }
    ]
  },
  {
    type: "workspaceView",
    alias: "time.workspace.default",
    name: "default view",
    js: () => import("./defaultWorkspace.element-C5tNWBBf.js"),
    weight: 300,
    meta: {
      icon: "icon-alarm-clock",
      pathname: "overview",
      label: "time"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: e
      }
    ]
  },
  {
    type: "workspaceContext",
    name: "Example Counter Workspace Context",
    alias: "example.workspaceContext.counter",
    api: () => import("./context-CsyCCYx7.js"),
    conditions: [
      {
        alias: n,
        match: "Umb.Workspace.Document"
      }
    ]
  }
], c = [
  ...a,
  ...i,
  ...p,
  ...l
];
export {
  c as manifests
};
//# sourceMappingURL=my-extension.js.map
