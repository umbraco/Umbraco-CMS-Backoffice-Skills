import { LitElement, html, css, customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';

@customElement('welcome-dashboard')
export class WelcomeDashboardElement extends UmbElementMixin(LitElement) {

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
            <h1>Welcome</h1>
            <p>Welcome to the Umbraco backoffice. Use the Content section to manage your site's pages and content.</p>
        `;
    }
}

export default WelcomeDashboardElement;

declare global {
    interface HTMLElementTagNameMap {
        'welcome-dashboard': WelcomeDashboardElement;
    }
}
