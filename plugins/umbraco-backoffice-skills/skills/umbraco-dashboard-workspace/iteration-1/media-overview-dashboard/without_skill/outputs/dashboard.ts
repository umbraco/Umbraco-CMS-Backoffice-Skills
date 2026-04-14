import { LitElement, html, css, customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

@customElement('media-overview-dashboard')
export class MediaOverviewDashboardElement extends UmbElementMixin(LitElement) {
	override render() {
		return html`
			<uui-box headline="Media Overview">
				<h1 class="uui-h3">Media Overview</h1>
			</uui-box>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				display: block;
				padding: var(--uui-size-layout-1);
			}
		`,
	];
}

export default MediaOverviewDashboardElement;

declare global {
	interface HTMLElementTagNameMap {
		'media-overview-dashboard': MediaOverviewDashboardElement;
	}
}
