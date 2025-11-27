import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';
import { UmbContextBase } from '@umbraco-cms/backoffice/class-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbNumberState } from '@umbraco-cms/backoffice/observable-api';

export class WorkspaceContextCounterElement extends UmbContextBase {
	#counter = new UmbNumberState(0);
	readonly counter = this.#counter.asObservable();

	constructor(host: UmbControllerHost) {
		super(host, EXAMPLE_COUNTER_CONTEXT);
	}

	increment() {
		this.#counter.setValue(this.#counter.value + 1);
	}

	reset() {
		this.#counter.setValue(0);
	}
}

export const api = WorkspaceContextCounterElement;

export const EXAMPLE_COUNTER_CONTEXT = new UmbContextToken<WorkspaceContextCounterElement>(
	'UmbWorkspaceContext',
	'example.workspaceContext.counter',
);