import { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";
import { customElement, property, LitElement, css, html, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyEditorConfigCollection } from "@umbraco-cms/backoffice/property-editor";

@customElement('styled-textbox')
export class StyledTextboxUiElement extends LitElement
    implements UmbPropertyEditorUiElement {

    @property()
    value: undefined | String = '';

    @state()
    _styleValue?: string;

    @property({ attribute: false })
    public set config(config: UmbPropertyEditorConfigCollection | undefined) {
        this._styleValue = config?.getValueByAlias('styleValue') ?? '';
    }

    onChange(e: Event) {
        const newValue = (e.target as HTMLInputElement).value;
        if (newValue === this.value) return;
        this.value = newValue;
        console.log(this.value);
        this.dispatchEvent(new CustomEvent('property-value-change'));
    }

    render() {
        return html`
            <uui-input
              .value=${this.value ?? ''}
              .style=${this._styleValue}
              type="text"
              @input=${this.onChange}></uui-input>
        `;
    }

    static styles = css`
        uui-input {
          width: 100%;
        }`

        ;
}

export default StyledTextboxUiElement;


declare global {
    interface HTMLElementTagNameMap {
        'styled-textbox': StyledTextboxUiElement;
    }
}
