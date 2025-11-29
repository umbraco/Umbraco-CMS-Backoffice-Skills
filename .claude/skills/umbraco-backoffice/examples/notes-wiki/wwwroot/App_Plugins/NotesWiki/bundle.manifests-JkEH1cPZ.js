import { UMB_WORKSPACE_CONDITION_ALIAS as s } from "@umbraco-cms/backoffice/workspace";
const r = [
  {
    type: "entryPoint",
    alias: "Notes.EntryPoint",
    name: "Notes Entry Point",
    js: () => import("./entrypoint-7c4vOMlc.js")
  }
], e = "Notes.Section", N = "notes", p = "Notes.SidebarApp", t = "Notes.Menu", l = "Notes.MenuItem", T = "Notes.Dashboard", n = "Notes.Tree", a = "Notes.Tree.Repository", E = "Notes.Tree.Store", S = "Notes.TreeItem", i = "notes-root", m = "notes-folder", c = "notes-note", o = "Notes.Workspace.Note", _ = "Notes.Workspace.Folder", A = [
  {
    type: "section",
    alias: e,
    name: "Notes Section",
    weight: 10,
    // Appears after Content, Media, Settings
    meta: {
      label: "Notes",
      pathname: N
    }
  }
], O = [
  {
    type: "sectionSidebarApp",
    kind: "menu",
    alias: p,
    name: "Notes Sidebar App",
    weight: 100,
    meta: {
      label: "Notes",
      menu: t
      // Links to our menu
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: e
        // Only show in Notes section
      }
    ]
  }
], y = {
  type: "menu",
  alias: t,
  name: "Notes Menu",
  meta: {
    label: "Notes"
  }
}, I = {
  type: "menuItem",
  kind: "tree",
  // This makes it show a tree
  alias: l,
  name: "Notes Menu Item",
  weight: 100,
  meta: {
    label: "All Notes",
    icon: "icon-notepad",
    entityType: i,
    // For tree root clicks
    menus: [t],
    // Belongs to our menu
    treeAlias: n,
    // Shows our tree
    hideTreeRoot: !0
    // Don't show root node, show children directly
  }
}, d = [
  y,
  I
], f = [
  {
    type: "dashboard",
    alias: T,
    name: "Notes Dashboard",
    element: () => import("./notes-dashboard.element-BNqts44Q.js"),
    weight: 10,
    meta: {
      label: "Welcome",
      pathname: "welcome"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: e
        // Only show in Notes section
      }
    ]
  }
], u = {
  type: "repository",
  alias: a,
  name: "Notes Tree Repository",
  api: () => import("./notes-tree.repository-nnfyCMF_.js")
}, M = {
  type: "treeStore",
  alias: E,
  name: "Notes Tree Store",
  api: () => import("./notes-tree.store-BxgHc6cf.js")
}, h = {
  type: "tree",
  kind: "default",
  alias: n,
  name: "Notes Tree",
  meta: {
    repositoryAlias: a
    // Links to our repository
  }
}, w = {
  type: "treeItem",
  kind: "default",
  // Uses default tree item rendering
  alias: S,
  name: "Notes Tree Item",
  forEntityTypes: [
    i,
    m,
    c
  ]
}, b = [
  u,
  M,
  h,
  w
], k = {
  type: "workspace",
  kind: "routable",
  // Supports routing (edit/:unique, create/...)
  alias: o,
  name: "Notes Note Workspace",
  api: () => import("./note-workspace.context-DJIWmnIf.js"),
  meta: {
    entityType: c
    // CRITICAL: Links to tree item clicks
  }
}, R = {
  type: "workspaceView",
  alias: "Notes.WorkspaceView.Note.Content",
  name: "Notes Note Content View",
  element: () => import("./note-content.view.element-1J5InzFi.js"),
  weight: 100,
  // Higher weight = appears first
  meta: {
    label: "Content",
    pathname: "content",
    icon: "icon-document"
  },
  conditions: [
    {
      alias: s,
      match: o
      // Only in Note workspace
    }
  ]
}, L = {
  type: "workspaceView",
  alias: "Notes.WorkspaceView.Note.Settings",
  name: "Notes Note Settings View",
  element: () => import("./note-settings.view.element-CLDNH-sH.js"),
  weight: 90,
  // Lower than content = appears second
  meta: {
    label: "Settings",
    pathname: "settings",
    icon: "icon-settings"
  },
  conditions: [
    {
      alias: s,
      match: o
    }
  ]
}, g = {
  type: "workspace",
  kind: "routable",
  alias: _,
  name: "Notes Folder Workspace",
  api: () => import("./folder-workspace.context-BI_liN6A.js"),
  meta: {
    entityType: m
    // CRITICAL: Links to tree item clicks
  }
}, P = [
  // Note workspace
  k,
  R,
  L,
  // Folder workspace
  g
], C = [
  {
    type: "localization",
    alias: "Notes.Localization.EnUs",
    name: "Notes English (US) Localization",
    meta: {
      culture: "en-us"
    },
    js: () => import("./en-us-ufbwuo7s.js")
  }
], D = [
  // Core initialization
  ...r,
  // Section registration
  ...A,
  // Navigation structure
  ...O,
  ...d,
  ...b,
  // Content areas
  ...f,
  ...P,
  // Localization
  ...C
];
export {
  m as N,
  i as a,
  c as b,
  o as c,
  _ as d,
  D as m
};
//# sourceMappingURL=bundle.manifests-JkEH1cPZ.js.map
