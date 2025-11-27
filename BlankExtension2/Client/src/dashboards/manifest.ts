export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "dashboard",
    alias: "BlankExtension2.Dashboard.Time",
    name: "Time Dashboard",
    element: () => import("./time-dashboard.element.js"),
    meta: {
      label: "Current Time",
      pathname: "time",
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content",
      },
    ],
  },
  {
    type: "dashboard",
    alias: "BlankExtension2.Dashboard.GoogleLink",
    name: "Google Link Dashboard",
    element: () => import("./google-link-dashboard.element.js"),
    meta: {
      label: "Google Link",
      pathname: "google-link",
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content",
      },
    ],
  },
];
