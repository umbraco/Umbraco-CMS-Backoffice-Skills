import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

@customElement("blankextension2-google-link-dashboard")
export class GoogleLinkDashboardElement extends UmbElementMixin(LitElement) {
  override render() {
    return html`
      <uui-box headline="Quick Links">
        <uui-button
          look="primary"
          color="positive"
          href="https://www.google.com"
          target="_blank"
        >
          <uui-icon name="icon-link"></uui-icon>
          Go to Google
        </uui-button>
      </uui-box>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    uui-button {
      font-size: 1.2rem;
    }
  `;
}

export default GoogleLinkDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "blankextension2-google-link-dashboard": GoogleLinkDashboardElement;
  }
}
