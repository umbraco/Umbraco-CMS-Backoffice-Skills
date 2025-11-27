import { EXAMPLE_COUNTER_CONTEXT } from '../context.js';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { css, html, customElement, state, LitElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';

@customElement('another-counter-workspace-view')
export class AnotherCounterWorkspaceView extends UmbElementMixin(LitElement) {
	#counterContext?: typeof EXAMPLE_COUNTER_CONTEXT.TYPE;

	@state()
	private count = 0;

	constructor() {
		super();
		this.consumeContext(EXAMPLE_COUNTER_CONTEXT, (instance) => {
			this.#counterContext = instance;
			this.#observeCounter();
		});
	}

	#observeCounter(): void {
		if (!this.#counterContext) return;
		this.observe(this.#counterContext.counter, (count) => {
			this.count = count;
		});
	}

	override render() {
		return html`
			<uui-box class="uui-text">
				<h1 class="uui-h2">Another Counter Example</h1>
				<p class="uui-lead">Current count value: ${this.count}</p>
				<p>This workspace view consumes the Counter Context and displays the current count.</p>
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

export default AnotherCounterWorkspaceView;

declare global {
	interface HTMLElementTagNameMap {
		'another-counter-workspace-view': AnotherCounterWorkspaceView;
	}
}