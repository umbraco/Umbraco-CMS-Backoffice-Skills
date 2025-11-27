import { UMB_WORKSPACE_CONDITION_ALIAS as m, UmbWorkspaceActionBase as l } from "@umbraco-cms/backoffice/workspace";
import { UMB_NOTIFICATION_CONTEXT as n } from "@umbraco-cms/backoffice/notification";
import { UMB_DOCUMENT_DETAIL_REPOSITORY_ALIAS as c, UMB_DOCUMENT_ENTITY_TYPE as p } from "@umbraco-cms/backoffice/document";
import { UmbEntityActionBase as r } from "@umbraco-cms/backoffice/entity-action";
const d = [
  {
    name: "Time Dashboard Entrypoint",
    alias: "TimeDashboard.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-CadrE5P6.js")
  }
], h = [
  {
    type: "globalContext",
    alias: "time.context",
    name: "Time context",
    api: () => import("./time.context-DShPQY3b.js")
  }
], y = [
  {
    type: "section",
    alias: "time.section",
    name: "time section",
    weight: 10,
    meta: {
      label: "Time",
      pathname: "time"
    }
  }
], b = {
  type: "sectionSidebarApp",
  kind: "menuWithEntityActions",
  alias: "time.sidebar.app",
  name: "Sidebar app",
  meta: {
    label: "Time",
    menu: "time.nested.menu"
  },
  conditions: [
    {
      alias: "Umb.Condition.SectionAlias",
      match: "time.section"
    }
  ]
}, u = {
  type: "menu",
  alias: "time.menu",
  name: "time sidebar menu",
  meta: {
    label: "time"
  }
}, w = {
  type: "menuItem",
  alias: "time.menu.item",
  name: "time menu item",
  meta: {
    label: "Time zones",
    icon: "icon-alarm-clock",
    entityType: "time-workspace",
    menus: [
      "time.menu"
    ]
  },
  element: () => import("./nested-menu.element-BKrWPEgz.js")
}, o = {
  type: "menu",
  alias: "time.nested.menu",
  name: "Nested menu",
  element: () => import("./nested-menu.element-BKrWPEgz.js"),
  meta: {
    label: "Time zones",
    icon: "icon-alarm-clock",
    entityType: "time-workspace"
  }
}, k = [
  {
    type: "time-menu-item",
    alias: "time.nested.menu.child-one",
    name: "child item",
    weight: 200,
    meta: {
      menus: [o.alias],
      icon: "icon-alarm-clock",
      label: "child item 1",
      entityType: "time-workspace"
    }
  },
  {
    type: "time-menu-item",
    alias: "time.nested.menu.child-two",
    name: "child item two",
    weight: 200,
    meta: {
      menus: [o.alias],
      icon: "icon-alarm-clock",
      label: "child item 2",
      entityType: "time-workspace"
    }
  }
], g = [
  b,
  u,
  w,
  o,
  ...k
], x = [
  {
    type: "dashboard",
    name: "timedashboard",
    alias: "timedashboard.dashboard",
    elementName: "timedashboard-dashboard",
    js: () => import("./dashboard.element-BNDeE0Da.js"),
    weight: -10,
    meta: {
      label: "TimeDashboard",
      pathname: "timedashboard"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "time.section"
      }
    ]
  }
], e = "time.workspace", f = [
  {
    type: "workspaceContext",
    alias: "time.workspace.context",
    name: "time workspace context",
    api: () => import("./context-BPPHcj4a.js"),
    conditions: [
      {
        alias: m,
        match: e
      }
    ]
  },
  {
    type: "workspace",
    alias: e,
    name: "time workspace",
    element: () => import("./workspace.element-B0UG53Er.js"),
    meta: {
      entityType: "time-workspace"
    }
  },
  {
    type: "workspaceView",
    alias: "time.workspace.defaultTime",
    name: "default view",
    js: () => import("./defaultWorkspace.element-7IkXAZPv.js"),
    weight: 300,
    meta: {
      icon: "icon-alarm-clock",
      pathname: "overview",
      label: "Time"
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
    alias: "time.workspace.settings",
    name: "setting view",
    js: () => import("./settingsWorkspace.element-BUTF5a5W.js"),
    weight: 200,
    meta: {
      icon: "icon-settings",
      pathname: "settings",
      label: "Settings"
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
    alias: "time.workspace.dialogs",
    name: "dialogs",
    js: () => import("./dialogworkspace.element-D7KJoU1f.js"),
    weight: 50,
    meta: {
      icon: "icon-app",
      pathname: "dialogs",
      label: "Dialogs"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: e
      }
    ]
  }
], A = [
  {
    type: "headerApp",
    alias: "time.header.app",
    name: "time app",
    js: () => import("./time-header-element-Bkftx33C.js"),
    weight: 850,
    meta: {
      label: "time",
      icon: "icon-alarm-clock",
      pathname: "time"
    }
  },
  {
    type: "modal",
    alias: "time.header.modal",
    name: "time header modal",
    js: () => import("./time-header-modal-PDNRHjor.js")
  }
], T = [
  {
    type: "modal",
    alias: "time.custom.modal",
    name: "Time custom modal",
    js: () => import("./custom-modal-element-D9nt2jeQ.js")
  }
], U = [
  {
    type: "propertyEditorSchema",
    name: "Styled textbox",
    alias: "styled.textbox",
    meta: {
      defaultPropertyEditorUiAlias: "styled.textbox.ui",
      settings: {
        properties: [
          {
            alias: "styleValue",
            label: "Styles",
            description: "Styles to apply to the box",
            propertyEditorUiAlias: "Umb.PropertyEditorUi.TextArea"
          }
        ],
        defaultData: [
          {
            alias: "styleValue",
            value: `font-size: 20px;\r
border:none; border-bottom: 1px solid #444;`
          }
        ]
      }
    }
  },
  {
    type: "propertyEditorUi",
    alias: "styled.textbox.ui",
    name: "styled textbox",
    js: () => import("./styledtext.ui.element-JMsx80EV.js"),
    elementName: "styled-text",
    meta: {
      label: "Styled textbox",
      icon: "icon-brush",
      group: "common",
      propertyEditorSchemaAlias: "styled.textbox"
    }
  }
], E = [
  {
    type: "workspaceView",
    alias: "time.document.workspace",
    name: "time contentapp",
    js: () => import("./time-workspace-view-DsTXVRf5.js"),
    weight: 10,
    meta: {
      icon: "icon-alarm-clock",
      pathname: "time",
      label: "time"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Umb.Workspace.Document"
      }
    ]
  }
];
class C extends l {
  #e;
  constructor(t, i) {
    super(t, i), this.consumeContext(n, (a) => {
      this.#e = a;
    });
  }
  async execute() {
    console.log("action execute"), this.#e?.peek("warning", {
      data: {
        headline: "A thing has happened !",
        message: "What that thing is? only time will tell."
      }
    });
  }
}
const S = [
  {
    type: "workspaceAction",
    alias: "time.workspace.action",
    name: "time workspace action",
    api: C,
    meta: {
      label: "Time Action",
      look: "primary",
      color: "default"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Umb.Workspace.Document"
      }
    ]
  }
];
class I extends r {
  #e;
  constructor(t, i) {
    super(t, i), this.consumeContext(n, (a) => {
      this.#e = a;
    });
  }
  async execute() {
    this.#e?.peek("warning", {
      data: {
        headline: "A thing has happened !",
        message: "What that thing is? only time will tell."
      }
    });
  }
}
const $ = [
  {
    type: "entityAction",
    alias: "time.entity.action",
    name: "tell me the time action",
    weight: -100,
    forEntityTypes: [
      p
    ],
    api: I,
    meta: {
      icon: "icon-alarm-clock",
      label: "time action",
      repositoryAlias: c
    }
  }
], j = [
  {
    type: "localization",
    alias: "time.lang.enus",
    name: "English (US)",
    weight: 0,
    meta: {
      culture: "en-us"
    },
    js: () => import("./en-us-D3ueGTry.js")
  },
  {
    type: "localization",
    alias: "time.lang.engb",
    name: "English (UK)",
    weight: 0,
    meta: {
      culture: "en-gb"
    },
    js: () => import("./en-gb-D3ueGTry.js")
  }
], N = [
  ...d,
  ...h,
  ...y,
  ...g,
  ...x,
  ...f,
  ...A,
  ...T,
  ...U,
  ...E,
  ...S,
  ...$,
  ...j
];
export {
  N as manifests
};
//# sourceMappingURL=time-dashboard.js.map
