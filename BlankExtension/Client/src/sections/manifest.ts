import { ManifestMenu, ManifestMenuItem } from "@umbraco-cms/backoffice/menu";
import { ManifestSectionSidebarApp } from "@umbraco-cms/backoffice/section";

// Section alias - used to link components together
const sectionAlias = "BlankExtension.Section";
const menuAlias = "BlankExtension.Menu";

// Menu that appears in the sidebar
const menuManifest: ManifestMenu = {
  type: "menu",
  alias: menuAlias,
  name: "Blank Extension Menu",
  meta: {
    label: "Navigation",
  },
};

// Menu items - each links to a different workspace via entityType
const dashboardMenuItem: ManifestMenuItem = {
  type: "menuItem",
  alias: "BlankExtension.MenuItem.Dashboard",
  name: "Dashboard Menu Item",
  weight: 300, // Higher weight = appears first
  meta: {
    label: "Dashboard",
    icon: "icon-dashboard",
    entityType: "blank-extension-dashboard", // Links to Dashboard workspace
    menus: [menuAlias],
  },
};

const settingsMenuItem: ManifestMenuItem = {
  type: "menuItem",
  alias: "BlankExtension.MenuItem.Settings",
  name: "Settings Menu Item",
  weight: 200,
  meta: {
    label: "Settings",
    icon: "icon-settings",
    entityType: "blank-extension-settings", // Links to Settings workspace
    menus: [menuAlias],
  },
};

const reportsMenuItem: ManifestMenuItem = {
  type: "menuItem",
  alias: "BlankExtension.MenuItem.Reports",
  name: "Reports Menu Item",
  weight: 100,
  meta: {
    label: "Reports",
    icon: "icon-chart-curve",
    entityType: "blank-extension-reports", // Links to Reports workspace
    menus: [menuAlias],
  },
};

// Sidebar app that contains the menu
const sectionSidebarAppManifest: ManifestSectionSidebarApp = {
  type: "sectionSidebarApp",
  kind: "menuWithEntityActions",
  alias: "BlankExtension.SidebarApp",
  name: "Blank Extension Sidebar",
  meta: {
    label: "Items",
    menu: menuAlias,
  },
  conditions: [
    {
      alias: "Umb.Condition.SectionAlias",
      match: sectionAlias,
    },
  ],
};

export const manifests: Array<UmbExtensionManifest> = [
  // Section - appears in top navigation
  {
    type: "section",
    alias: sectionAlias,
    name: "Blank Extension Section",
    weight: 100,
    meta: {
      label: "Blank Extension",
      pathname: "blank-extension",
    },
  },
  sectionSidebarAppManifest,
  menuManifest,
  dashboardMenuItem,
  settingsMenuItem,
  reportsMenuItem,
];
