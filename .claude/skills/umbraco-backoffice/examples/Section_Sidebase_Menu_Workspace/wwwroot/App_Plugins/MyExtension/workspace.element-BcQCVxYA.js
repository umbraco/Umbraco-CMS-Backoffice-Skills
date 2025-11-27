import { UmbElementMixin as a } from "@umbraco-cms/backoffice/element-api";
import { LitElement as i, html as c, css as u, customElement as m } from "@umbraco-cms/backoffice/external/lit";
var d = Object.getOwnPropertyDescriptor, b = (o, n, p, s) => {
  for (var e = s > 1 ? void 0 : s ? d(n, p) : n, r = o.length - 1, l; r >= 0; r--)
    (l = o[r]) && (e = l(e) || e);
  return e;
};
let t = class extends a(i) {
  render() {
    return c`
        <umb-workspace-editor headline="Blueprint" alias="Blueprint.Workspace" .enforceNoFooter=${!0}>
          <uui-box headline='my workspace content'>
              <p>Some content goes here</p>
          </uui-box>
        </umb-workspace-editor>
    `;
  }
};
t.styles = u`
    :host {
      display: block;
      height: 100%;
    }

    .workspace-content {
      padding: var(--uui-size-space-4);
    }
  `;
t = b([
  m("blueprint-workspace")
], t);
const f = t;
export {
  t as BlueprintWorkspaceElement,
  f as default
};
//# sourceMappingURL=workspace.element-BcQCVxYA.js.map
