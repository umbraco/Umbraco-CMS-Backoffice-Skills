import { LitElement, html, css } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';

export default class MediaOverviewDashboardElement extends UmbElementMixin(LitElement) {
  render() {
    return html`
      <uui-box>
        <h1 class="uui-h2">Media Overview</h1>
      </uui-box>
    `;
  }

  static styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }
  `;
}

customElements.define('media-overview-dashboard', MediaOverviewDashboardElement);
