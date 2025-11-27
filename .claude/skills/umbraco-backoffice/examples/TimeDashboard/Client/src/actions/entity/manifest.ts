import { UMB_DOCUMENT_ENTITY_TYPE, UMB_DOCUMENT_DETAIL_REPOSITORY_ALIAS } from "@umbraco-cms/backoffice/document";
import { TimeEntityAction } from "./time.entity.action.js";

export const manifests: Array<UmbExtensionManifest> = [
    {
        type: 'entityAction',
        alias: 'time.entity.action',
        name: 'tell me the time action',
        weight: -100,
        forEntityTypes: [
            UMB_DOCUMENT_ENTITY_TYPE
        ],
        api: TimeEntityAction,
        meta: {
            icon: 'icon-alarm-clock',
            label: 'time action',
            repositoryAlias: UMB_DOCUMENT_DETAIL_REPOSITORY_ALIAS,
        }
    }
];
