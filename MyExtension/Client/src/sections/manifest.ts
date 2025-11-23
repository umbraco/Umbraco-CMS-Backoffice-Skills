import { UMB_SECTION_ALIAS_CONDITION_ALIAS } from "@umbraco-cms/backoffice/section";

const sectionAlias = "My.Section.Demo";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "section",
    alias: sectionAlias,
    name: "Demo Section",
    weight: 100,
    meta: {
      label: "Demo",
      pathname: "demo",
    },
  },
  {
    type: "sectionView",
    alias: "My.SectionView.Demo",
    name: "Demo Section View",
    element: () => import("./demo-section-view.element.js"),
    meta: {
      label: "Demo Overview",
      pathname: "overview",
      icon: "icon-home",
    },
    conditions: [
      {
        alias: UMB_SECTION_ALIAS_CONDITION_ALIAS,
        match: sectionAlias,
      },
    ],
  },
];
