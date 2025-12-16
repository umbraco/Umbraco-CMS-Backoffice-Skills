/**
 * Example extension entry point.
 *
 * This file exports manifests that will be registered in the Umbraco backoffice.
 */
import type { ManifestDashboard } from '@umbraco-cms/backoffice/dashboard';

// Import your elements
import './example-dashboard.element.js';

const exampleDashboard: ManifestDashboard = {
	type: 'dashboard',
	alias: 'External.Dashboard.Example',
	name: 'External Example Dashboard',
	element: 'external-example-dashboard',
	weight: 100,
	meta: {
		label: 'External Extension',
		pathname: 'external-extension',
	},
	conditions: [
		{
			alias: 'Umb.Condition.SectionAlias',
			match: 'Umb.Section.Content',
		},
	],
};

export const manifests = [exampleDashboard];
