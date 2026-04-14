import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { css, html, customElement, LitElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';

@customElement('welcome-dashboard')
export class WelcomeDashboardElement extends UmbElementMixin(LitElement) {
	override render() {
		return html`
			<uui-box headline="Welcome">
				<p>
					Welcome to the Umbraco backoffice. Use the Content tree on the left to
					manage your site content, or explore the sections above to configure
					your site.
				</p>
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

export default WelcomeDashboardElement;

declare global {
	interface HTMLElementTagNameMap {
		'welcome-dashboard': WelcomeDashboardElement;
	}
}
