import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

@customElement("blankextension2-time-dashboard")
export class TimeDashboardElement extends UmbElementMixin(LitElement) {
  @state()
  private _currentTime: string = "";

  private _intervalId?: number;

  override connectedCallback(): void {
    super.connectedCallback();
    this._updateTime();
    this._intervalId = window.setInterval(() => this._updateTime(), 1000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._intervalId) {
      window.clearInterval(this._intervalId);
    }
  }

  private _updateTime(): void {
    const now = new Date();
    this._currentTime = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  override render() {
    return html`
      <uui-box headline="Current Time">
        <div class="time-display">${this._currentTime}</div>
      </uui-box>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    .time-display {
      font-size: 3rem;
      font-weight: bold;
      text-align: center;
      padding: var(--uui-size-space-5);
      font-family: monospace;
    }
  `;
}

export default TimeDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "blankextension2-time-dashboard": TimeDashboardElement;
  }
}
