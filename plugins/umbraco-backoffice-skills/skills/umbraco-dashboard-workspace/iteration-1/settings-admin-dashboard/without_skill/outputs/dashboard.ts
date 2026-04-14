import { LitElement, html, css, customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';

@customElement('system-info-dashboard')
export class SystemInfoDashboardElement extends UmbElementMixin(LitElement) {

    static override styles = css`
        :host {
            display: block;
            padding: 20px;
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        p {
            font-size: 1rem;
            color: var(--uui-color-text-alt);
        }
    `;

    override render() {
        return html`
            <h1>System Info</h1>
            <p>System information will be displayed here.</p>
        `;
    }
}

export default SystemInfoDashboardElement;

declare global {
    interface HTMLElementTagNameMap {
        'system-info-dashboard': SystemInfoDashboardElement;
    }
}
