import { UMB_WORKSPACE_CONDITION_ALIAS as s } from "@umbraco-cms/backoffice/workspace";
const o = [
  {
    name: "Umb Tree Client Entrypoint",
    alias: "UmbTreeClient.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-BIGpY6pM.js")
  }
], t = "our-tree-root", a = "our-tree-item", r = {
  type: "repository",
  alias: "OurTree.Repository",
  name: "OurTree Repository",
  api: () => import("./ourtree.repository-CK-xG7UB.js")
}, m = {
  type: "treeStore",
  alias: "OurTree.Store",
  name: "OurTree Store",
  api: () => import("./ourtree.store-CiK112rZ.js")
}, i = {
  type: "tree",
  kind: "default",
  alias: "OurTree.Tree",
  name: "OurTree Tree",
  meta: {
    repositoryAlias: r.alias
  }
}, p = {
  type: "treeItem",
  kind: "default",
  alias: "OurTree.TreeItem",
  name: "OurTree Tree Item",
  forEntityTypes: [t, a]
}, e = {
  type: "menu",
  alias: "OurTree.Menu",
  name: "OurTree Menu",
  meta: {
    label: "Our Tree"
  }
}, T = {
  type: "menuItem",
  kind: "tree",
  alias: "OurTree.MenuItem",
  name: "OurTree Menu Item",
  weight: 100,
  meta: {
    label: "Our Tree",
    icon: "icon-bug",
    entityType: t,
    menus: [e.alias],
    treeAlias: i.alias,
    hideTreeRoot: !0
  }
}, u = {
  type: "sectionSidebarApp",
  kind: "menu",
  alias: "OurTree.SidebarApp",
  name: "OurTree Sidebar App",
  weight: 100,
  meta: {
    label: "Our Tree",
    menu: e.alias
  },
  conditions: [
    {
      alias: "Umb.Condition.SectionAlias",
      match: "Umb.Section.Settings"
    }
  ]
}, c = [
  r,
  i,
  m,
  p,
  e,
  T,
  u
], n = "OurTree.Workspace", l = {
  type: "workspace",
  kind: "routable",
  alias: n,
  name: "OurTree Item Workspace",
  api: () => import("./ourtree-workspace.context-B-6U_rcP.js"),
  meta: {
    entityType: a
  }
}, O = {
  type: "workspaceView",
  alias: "OurTree.WorkspaceView.Details",
  name: "OurTree Workspace Details View",
  element: () => import("./ourtree-workspace-view.element-BwO8GKSV.js"),
  weight: 100,
  meta: {
    label: "Details",
    pathname: "details",
    icon: "icon-info"
  },
  conditions: [
    {
      alias: s,
      match: n
    }
  ]
}, y = [
  l,
  O
], E = [
  ...o,
  ...c,
  ...y
];
export {
  a as O,
  t as a,
  n as b,
  E as m
};
//# sourceMappingURL=bundle.manifests-BdbixqNY.js.map
