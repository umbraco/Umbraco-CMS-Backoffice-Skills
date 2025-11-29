import { UMB_WORKSPACE_CONDITION_ALIAS as a, UmbSubmitWorkspaceAction as r } from "@umbraco-cms/backoffice/workspace";
const t = "notes-root", e = "notes-folder", i = "notes-note", n = "Notes.Section", m = "notes", p = "Notes.SidebarApp", s = "Notes.Menu", N = "Notes.MenuItem", d = "Notes.Dashboard", c = "Notes.Tree", l = "Notes.Tree.Repository", A = "Notes.Tree.Store", y = "Notes.TreeItem", o = "Notes.Workspace.Note", E = "Notes.Workspace.Folder", T = [
  {
    type: "section",
    alias: n,
    name: "Notes Section",
    weight: 10,
    // Appears after Content, Media, Settings
    meta: {
      label: "Notes",
      pathname: m
    }
  }
], S = [
  {
    type: "sectionSidebarApp",
    kind: "menu",
    alias: p,
    name: "Notes Sidebar App",
    weight: 100,
    meta: {
      label: "Notes",
      menu: s
      // Links to our menu
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: n
        // Only show in Notes section
      }
    ]
  }
], f = {
  type: "menu",
  alias: s,
  name: "Notes Menu",
  meta: {
    label: "Notes"
  }
}, _ = {
  type: "menuItem",
  kind: "tree",
  // This makes it show a tree
  alias: N,
  name: "Notes Menu Item",
  weight: 100,
  meta: {
    label: "All Notes",
    icon: "icon-notepad",
    entityType: t,
    // For tree root clicks
    menus: [s],
    // Belongs to our menu
    treeAlias: c,
    // Shows our tree
    hideTreeRoot: !0
    // Don't show root node, show children directly
  }
}, h = [
  f,
  _
], k = [
  // =========================================================================
  // WELCOME DASHBOARD
  // First tab - shows overview and recent notes
  // =========================================================================
  {
    type: "dashboard",
    alias: d,
    name: "Notes Dashboard",
    element: () => import("./notes-dashboard.element-DjFA-5K9.js"),
    weight: 200,
    // Higher weight = appears first (leftmost tab)
    meta: {
      label: "Welcome",
      pathname: "welcome"
      // URL: /section/notes/dashboard/welcome
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: n
        // Only show in Notes section
      }
    ]
  },
  // =========================================================================
  // BROWSE DASHBOARD
  // Second tab - grid/list view of all notes
  // =========================================================================
  {
    type: "dashboard",
    alias: "Notes.Dashboard.Browse",
    name: "Notes Browse Dashboard",
    element: () => import("./notes-browse-dashboard.element-c8DbmeMj.js"),
    weight: 100,
    // Lower weight = appears after Welcome tab
    meta: {
      label: "Browse",
      pathname: "browse"
      // URL: /section/notes/dashboard/browse
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: n
      }
    ]
  }
], b = {
  type: "repository",
  alias: l,
  name: "Notes Tree Repository",
  api: () => import("./notes-tree.repository-DzmZwdGf.js")
}, I = {
  type: "treeStore",
  alias: A,
  name: "Notes Tree Store",
  api: () => import("./notes-tree.store-BoALzgMr.js")
}, w = {
  type: "tree",
  kind: "default",
  alias: c,
  name: "Notes Tree",
  meta: {
    repositoryAlias: l
    // Links to our repository
  }
}, O = {
  type: "treeItem",
  kind: "default",
  // Uses default tree item rendering
  alias: y,
  name: "Notes Tree Item",
  forEntityTypes: [
    t,
    e,
    i
  ]
}, M = {
  type: "entityAction",
  kind: "reloadTreeItemChildren",
  alias: "Notes.EntityAction.Tree.ReloadChildrenOf",
  name: "Reload Notes Tree Item Children Entity Action",
  forEntityTypes: [
    t,
    e,
    i
  ]
}, u = [
  b,
  I,
  w,
  O,
  M
], C = {
  type: "workspace",
  kind: "routable",
  // Supports routing (edit/:unique, create/...)
  alias: o,
  name: "Notes Note Workspace",
  api: () => import("./note-workspace.context-CDjQ-Nuk.js"),
  meta: {
    entityType: i
    // CRITICAL: Links to tree item clicks
  }
}, R = {
  type: "workspaceView",
  alias: "Notes.WorkspaceView.Note.Content",
  name: "Notes Note Content View",
  element: () => import("./note-content.view.element-GZ7jSOCg.js"),
  weight: 100,
  // Higher weight = appears first
  meta: {
    label: "Content",
    pathname: "content",
    icon: "icon-document"
  },
  conditions: [
    {
      alias: a,
      match: o
      // Only in Note workspace
    }
  ]
}, g = {
  type: "workspaceView",
  alias: "Notes.WorkspaceView.Note.Settings",
  name: "Notes Note Settings View",
  element: () => import("./note-settings.view.element-Bn3rxrq8.js"),
  weight: 90,
  // Lower than content = appears second
  meta: {
    label: "Settings",
    pathname: "settings",
    icon: "icon-settings"
  },
  conditions: [
    {
      alias: a,
      match: o
    }
  ]
}, W = {
  type: "workspaceAction",
  kind: "default",
  alias: "Notes.WorkspaceAction.Note.Save",
  name: "Save Note Workspace Action",
  weight: 80,
  api: r,
  meta: {
    label: "Save",
    look: "primary",
    color: "positive"
  },
  conditions: [
    {
      alias: a,
      match: o
    }
  ]
}, D = {
  type: "workspaceAction",
  kind: "default",
  alias: "Notes.WorkspaceAction.Note.Cancel",
  name: "Cancel Note Workspace Action",
  weight: 90,
  // Higher than Save so it appears first (Cancel | Save)
  api: () => import("./note-cancel.action-DFyP2fxd.js"),
  meta: {
    label: "Cancel",
    look: "secondary"
  },
  conditions: [
    {
      alias: a,
      match: o
    }
  ]
}, F = {
  type: "workspace",
  kind: "routable",
  alias: E,
  name: "Notes Folder Workspace",
  api: () => import("./folder-workspace.context-C9fZTAR5.js"),
  meta: {
    entityType: e
  }
}, L = [
  // Note workspace
  C,
  R,
  g,
  W,
  D,
  // Folder workspace
  F
], P = {
  type: "entityAction",
  kind: "default",
  alias: "Notes.EntityAction.CreateNote",
  name: "Create Note Entity Action",
  weight: 1100,
  // High weight = appears near top
  api: () => import("./create-note.action-CrYpFAF5.js"),
  forEntityTypes: [
    t,
    e
  ],
  meta: {
    icon: "icon-notepad",
    label: "Create Note"
  }
}, U = {
  type: "entityAction",
  kind: "default",
  alias: "Notes.EntityAction.CreateFolder",
  name: "Create Folder Entity Action",
  weight: 1e3,
  // Slightly lower than create note
  api: () => import("./create-folder.action-CUevAOEu.js"),
  forEntityTypes: [
    t,
    e
  ],
  meta: {
    icon: "icon-folder",
    label: "Create Folder"
  }
}, V = {
  type: "entityAction",
  kind: "default",
  alias: "Notes.EntityAction.DeleteNote",
  name: "Delete Note Entity Action",
  weight: 100,
  // Low weight = appears near bottom
  api: () => import("./delete-note.action-CNtOvi4W.js"),
  forEntityTypes: [i],
  meta: {
    icon: "icon-trash",
    label: "Delete"
  }
}, $ = {
  type: "entityAction",
  kind: "default",
  alias: "Notes.EntityAction.DeleteFolder",
  name: "Delete Folder Entity Action",
  weight: 100,
  api: () => import("./delete-folder.action-Bvbt3x7D.js"),
  forEntityTypes: [e],
  meta: {
    icon: "icon-trash",
    label: "Delete"
  }
}, Y = {
  type: "entityAction",
  kind: "default",
  alias: "Notes.EntityAction.RenameFolder",
  name: "Rename Folder Entity Action",
  weight: 900,
  // Below create actions, above delete
  api: () => import("./rename-folder.action-BHH2BuQx.js"),
  forEntityTypes: [e],
  meta: {
    icon: "icon-edit",
    label: "Rename"
  }
}, B = {
  type: "modal",
  alias: "Notes.Modal.FolderName",
  name: "Folder Name Modal",
  element: () => import("./rename-folder.modal.element-bk7tT5D8.js")
}, v = [
  P,
  U,
  V,
  $,
  Y,
  B
], z = [
  {
    type: "localization",
    alias: "Notes.Localization.EnUs",
    name: "Notes English (US) Localization",
    meta: {
      culture: "en-us"
    },
    js: () => import("./en-us-ufbwuo7s.js")
  }
], j = [
  // =========================================================================
  // ENTRY POINT
  // Runs first to initialize the API client with authentication
  // =========================================================================
  {
    type: "backofficeEntryPoint",
    alias: "Notes.EntryPoint",
    name: "Notes Wiki Entry Point",
    js: () => import("./entry-point-D_OUv4hE.js")
  },
  // =========================================================================
  // SECTION
  // Top-level navigation item in the backoffice header
  // =========================================================================
  ...T,
  // =========================================================================
  // SIDEBAR & NAVIGATION
  // Left panel structure with menu and tree
  // =========================================================================
  ...S,
  ...h,
  ...u,
  // =========================================================================
  // CONTENT AREAS
  // Dashboard for welcome/overview, Workspaces for editing
  // =========================================================================
  ...k,
  ...L,
  // =========================================================================
  // ENTITY ACTIONS
  // Context menu items for tree nodes (create, delete, rename)
  // =========================================================================
  ...v,
  // =========================================================================
  // LOCALIZATION
  // Translation strings for UI labels
  // =========================================================================
  ...z
];
export {
  i as N,
  e as a,
  t as b,
  o as c,
  E as d,
  m as e,
  j as m
};
//# sourceMappingURL=bundle.manifests-CPE-rfRR.js.map
