import type { ManifestElement } from "@umbraco-cms/backoffice/extension-api";
import type { ManifestMenu, ManifestMenuItem, ManifestSectionSidebarAppBaseMenu, MetaMenuItem, UmbMenuItemElement } from "@umbraco-cms/backoffice/menu";

const sidebarAppManifest: ManifestSectionSidebarAppBaseMenu = {
    type: 'sectionSidebarApp',
    kind: 'menuWithEntityActions',
    alias: 'time.sidebar.app',
    name: 'Sidebar app',
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
};

const menuManifest: ManifestMenu = {
    type: 'menu',
    alias: 'time.menu',
    name: 'time sidebar menu',
    meta: {
        label: 'time'
    }
}

const menuItemManifest: ManifestMenuItem = {
    type: 'menuItem',
    alias: 'time.menu.item',
    name: 'time menu item',
    meta: {
        label: 'Time zones',
        icon: 'icon-alarm-clock',
        entityType: 'time-workspace',
        menus: [
            'time.menu'
        ]
    },
    element: () => import('./nested-menu.element.js')
}

export interface ManifestTimeMenuItem extends ManifestElement<UmbMenuItemElement> {
    type: 'time-menu-item';
    meta: MetaMenuItem;
}

const nestedMenuManifest: ManifestMenu = {
    type: 'menu',
    alias: 'time.nested.menu',
    name: 'Nested menu',
    element: () => import('./nested-menu.element.js'),
    meta: {
        label: 'Time zones',
        icon: 'icon-alarm-clock',
        entityType: 'time-workspace',
    }
}

const nestedMenuItems: ManifestTimeMenuItem[] = [
    {
        type: 'time-menu-item',
        alias: 'time.nested.menu.child-one',
        name: 'child item',
        weight: 200,
        meta: {
            menus: [nestedMenuManifest.alias],
            icon: 'icon-alarm-clock',
            label: 'child item 1',
            entityType: 'time-workspace',
        }
    },
    {
        type: 'time-menu-item',
        alias: 'time.nested.menu.child-two',
        name: 'child item two',
        weight: 200,
        meta: {
            menus: [nestedMenuManifest.alias],
            icon: 'icon-alarm-clock',
            label: 'child item 2',
            entityType: 'time-workspace',
        }
    }
];

export const manifests: Array<UmbExtensionManifest> = [
    sidebarAppManifest,
    menuManifest,
    menuItemManifest,
    nestedMenuManifest,
    ...nestedMenuItems,
];
