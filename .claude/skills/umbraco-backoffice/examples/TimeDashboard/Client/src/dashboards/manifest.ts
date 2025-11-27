export const manifests: Array<UmbExtensionManifest> = [
    {
        type: 'dashboard',
        name: 'timedashboard',
        alias: 'timedashboard.dashboard',
        elementName: 'timedashboard-dashboard',
        js: () => import("./dashboard.element.js"),
        weight: -10,
        meta: {
            label: 'TimeDashboard',
            pathname: 'timedashboard'
        },
        conditions: [
            {
                alias: 'Umb.Condition.SectionAlias',
                match: 'time.section'
            }
        ]
    }
];
