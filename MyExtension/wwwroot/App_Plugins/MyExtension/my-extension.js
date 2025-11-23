import { UMB_SECTION_ALIAS_CONDITION_ALIAS as t } from "@umbraco-cms/backoffice/section";
const i = [
  {
    name: "My Extension Entrypoint",
    alias: "MyExtension.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-CkOuTyHN.js")
  }
], n = [
  {
    name: "My Extension Dashboard",
    alias: "MyExtension.Dashboard",
    type: "dashboard",
    js: () => import("./dashboard.element-Cs93TisS.js"),
    meta: {
      label: "Example Dashboard",
      pathname: "example-dashboard"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  },
  {
    name: "Welcome Dashboard",
    alias: "MyExtension.WelcomeDashboard",
    type: "dashboard",
    js: () => import("./welcome-dashboard.element-C5pNydR8.js"),
    weight: 100,
    meta: {
      label: "Welcome",
      pathname: "welcome-dashboard"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  }
], e = "My.Section.Demo", m = [
  {
    type: "section",
    alias: e,
    name: "Demo Section",
    weight: 100,
    meta: {
      label: "Demo",
      pathname: "demo"
    }
  },
  {
    type: "sectionView",
    alias: "My.SectionView.Demo",
    name: "Demo Section View",
    element: () => import("./demo-section-view.element-BsaYm038.js"),
    meta: {
      label: "Demo Overview",
      pathname: "overview",
      icon: "icon-home"
    },
    conditions: [
      {
        alias: t,
        match: e
      }
    ]
  }
], o = "My.Repository.Demo.Tree", s = [
  {
    type: "repository",
    alias: o,
    name: "Demo Tree Repository",
    api: () => import("./demo-tree-repository-CKb_0bPO.js")
  },
  {
    type: "tree",
    kind: "default",
    alias: "My.Tree.Demo",
    name: "Demo Tree",
    meta: {
      repositoryAlias: o
    }
  },
  {
    type: "treeItem",
    kind: "default",
    alias: "My.TreeItem.Demo",
    name: "Demo Tree Item",
    forEntityTypes: ["demo-tree-item", "demo-tree-root"]
  }
], a = "My.Workspace.Demo", r = [
  {
    type: "workspace",
    kind: "default",
    alias: a,
    name: "Demo Workspace",
    element: () => import("./demo-workspace.element-DwrlKVxN.js"),
    meta: {
      entityType: "demo-workspace"
    }
  },
  {
    type: "workspaceView",
    alias: "My.WorkspaceView.Demo",
    name: "Demo Workspace View",
    element: () => import("./demo-workspace.element-DwrlKVxN.js"),
    meta: {
      label: "Overview",
      pathname: "overview",
      icon: "icon-document"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: a
      }
    ]
  }
], p = [
  ...i,
  ...n,
  ...m,
  ...s,
  ...r
];
export {
  p as manifests
};
//# sourceMappingURL=my-extension.js.map
