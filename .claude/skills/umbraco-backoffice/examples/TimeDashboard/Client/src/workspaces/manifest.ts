import { UMB_WORKSPACE_CONDITION_ALIAS } from "@umbraco-cms/backoffice/workspace";

const workspaceAlias = 'time.workspace';

export const manifests: Array<UmbExtensionManifest> = [
    {
        type: 'workspaceContext',
        alias: 'time.workspace.context',
        name: 'time workspace context',
        api: () => import('./context.js'),
        conditions: [
            {
                alias: UMB_WORKSPACE_CONDITION_ALIAS,
                match: workspaceAlias,
            },
        ],
    },
    {
        type: 'workspace',
        alias: workspaceAlias,
        name: 'time workspace',
        element: () => import('./workspace.element.js'),
        meta: {
            entityType: 'time-workspace'
        }
    },
    {
        type: 'workspaceView',
        alias: 'time.workspace.defaultTime',
        name: 'default view',
        js: () => import('./views/defaultWorkspace.element.js'),
        weight: 300,
        meta: {
            icon: 'icon-alarm-clock',
            pathname: 'overview',
            label: 'Time'
        },
        conditions: [
            {
                alias: 'Umb.Condition.WorkspaceAlias',
                match: workspaceAlias
            },
        ],
    },
    {
        type: 'workspaceView',
        alias: 'time.workspace.settings',
        name: 'setting view',
        js: () => import('./views/settingsWorkspace.element.js'),
        weight: 200,
        meta: {
            icon: 'icon-settings',
            pathname: 'settings',
            label: 'Settings'
        },
        conditions: [
            {
                alias: 'Umb.Condition.WorkspaceAlias',
                match: workspaceAlias
            },
        ],
    },
    {
        type: "workspaceView",
        alias: 'time.workspace.dialogs',
        name: 'dialogs',
        js: () => import('./views/dialogworkspace.element.js'),
        weight: 50,
        meta: {
            icon: 'icon-app',
            pathname: 'dialogs',
            label: 'Dialogs'
        },
        conditions: [
            {
                alias: 'Umb.Condition.WorkspaceAlias',
                match: workspaceAlias
            }
        ]
    }
];
