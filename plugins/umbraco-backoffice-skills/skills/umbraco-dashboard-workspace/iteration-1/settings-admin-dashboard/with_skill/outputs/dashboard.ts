import { LitElement, html, css, customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

@customElement('system-info-dashboard')
export class SystemInfoDashboardElement extends UmbElementMixin(LitElement) {
	override render() {
		return html`
			<uui-box headline="System Info">
				<h1 class="uui-h3">System Info</h1>
				<p>Placeholder for system information.</p>
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

export default SystemInfoDashboardElement;

declare global {
	interface HTMLElementTagNameMap {
		'system-info-dashboard': SystemInfoDashboardElement;
	}
}
