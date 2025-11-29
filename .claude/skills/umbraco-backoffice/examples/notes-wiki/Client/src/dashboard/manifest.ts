/**
 * Notes Dashboard Manifest
 *
 * This file registers the Dashboard for the Notes section.
 *
 * A Dashboard is a view that shows when no item is selected in the tree.
 * It's commonly used for welcome screens, search, recent items, etc.
 *
 * Skills used: umbraco-dashboard, umbraco-conditions
 *
 * CONNECTION PATTERN:
 * Dashboard.conditions[].match --> Section.alias (shows in this section)
 *
 * Key properties:
 * - element: Lazy-loaded component
 * - meta.label: Tab label (can have multiple dashboards)
 * - meta.pathname: URL path segment
 * - conditions: SectionAlias condition to show only in Notes section
 */

import { NOTES_DASHBOARD_ALIAS, NOTES_SECTION_ALIAS } from "../constants.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "dashboard",
    alias: NOTES_DASHBOARD_ALIAS,
    name: "Notes Dashboard",
    element: () => import("./notes-dashboard.element.js"),
    weight: 10,
    meta: {
      label: "Welcome",
      pathname: "welcome",
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: NOTES_SECTION_ALIAS, // Only show in Notes section
      },
    ],
  },
];
