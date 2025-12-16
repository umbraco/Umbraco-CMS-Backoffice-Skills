import { LitElement, html, css } from '@umbraco-cms/backoffice/external/lit';
import { customElement } from '@umbraco-cms/backoffice/external/lit';

@customElement('external-example-dashboard')
export class ExternalExampleDashboardElement extends LitElement {
	static override styles = css`
		:host {
			display: block;
			padding: var(--uui-size-layout-1);
		}

		.success-banner {
			background: var(--uui-color-positive);
			color: var(--uui-color-positive-contrast);
			padding: var(--uui-size-space-4);
			border-radius: var(--uui-border-radius);
			margin-bottom: var(--uui-size-space-4);
		}
	`;

	override render() {
		return html`
			<uui-box headline="External Extension">
				<div class="success-banner">
					This extension is loaded from OUTSIDE the Umbraco source tree!
				</div>
				<p>
					This dashboard demonstrates that you can develop your Umbraco extensions
					in your own project and test them visually in the mocked backoffice.
				</p>
				<p>
					<strong>Benefits:</strong>
				</p>
				<ul>
					<li>Keep extensions in your own repository</li>
					<li>No need to copy files into Umbraco source</li>
					<li>Fast iteration with hot module reload</li>
					<li>Test UI without a real Umbraco backend</li>
				</ul>
			</uui-box>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'external-example-dashboard': ExternalExampleDashboardElement;
	}
}
