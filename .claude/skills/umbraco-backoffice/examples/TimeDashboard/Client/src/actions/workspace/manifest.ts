import { TimeAction } from "./time.action.js";

export const manifests: Array<UmbExtensionManifest> = [
    {
        type: 'workspaceAction',
        alias: 'time.workspace.action',
        name: 'time workspace action',
        api: TimeAction,
        meta: {
            label: 'Time Action',
            look: 'primary',
            color: 'default',
        },
        conditions: [
            {
                alias: 'Umb.Condition.WorkspaceAlias',
                match: 'Umb.Workspace.Document'
            }
        ]
    }
];
