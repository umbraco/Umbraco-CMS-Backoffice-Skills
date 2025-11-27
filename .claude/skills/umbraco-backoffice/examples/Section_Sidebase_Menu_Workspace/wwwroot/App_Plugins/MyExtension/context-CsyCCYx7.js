import { UmbContextToken as t } from "@umbraco-cms/backoffice/context-api";
import { UmbContextBase as o } from "@umbraco-cms/backoffice/class-api";
import { UmbNumberState as s } from "@umbraco-cms/backoffice/observable-api";
class r extends o {
  constructor(e) {
    super(e, n), this.#e = new s(0), this.counter = this.#e.asObservable();
  }
  #e;
  increment() {
    this.#e.setValue(this.#e.value + 1);
  }
  reset() {
    this.#e.setValue(0);
  }
}
const p = r, n = new t(
  "UmbWorkspaceContext",
  "example.workspaceContext.counter"
);
export {
  n as EXAMPLE_COUNTER_CONTEXT,
  r as WorkspaceContextCounterElement,
  p as api
};
//# sourceMappingURL=context-CsyCCYx7.js.map
