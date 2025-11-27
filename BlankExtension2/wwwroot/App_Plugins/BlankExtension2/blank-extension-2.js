const n = [
  {
    name: "Blank Extension 2Entrypoint",
    alias: "BlankExtension2.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-BSlTz4-p.js")
  }
], a = [
  {
    type: "dashboard",
    alias: "BlankExtension2.Dashboard.Time",
    name: "Time Dashboard",
    element: () => import("./time-dashboard.element-DNI6u3sv.js"),
    meta: {
      label: "Current Time",
      pathname: "time"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  },
  {
    type: "dashboard",
    alias: "BlankExtension2.Dashboard.GoogleLink",
    name: "Google Link Dashboard",
    element: () => import("./google-link-dashboard.element-BOCLXqdj.js"),
    meta: {
      label: "Google Link",
      pathname: "google-link"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  }
], t = [
  ...n,
  ...a
];
export {
  t as manifests
};
//# sourceMappingURL=blank-extension-2.js.map
