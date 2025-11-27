import { UmbElementMixin as a } from "@umbraco-cms/backoffice/element-api";
import { LitElement as r, html as m, css as p, customElement as d } from "@umbraco-cms/backoffice/external/lit";
var c = Object.getOwnPropertyDescriptor, b = (i, u, s, n) => {
  for (var e = n > 1 ? void 0 : n ? c(u, s) : u, o = i.length - 1, l; o >= 0; o--)
    (l = i[o]) && (e = l(e) || e);
  return e;
};
let t = class extends a(r) {
  render() {
    return m`
      <umb-body-layout header-transparent header-fit-height>
        <div slot="header">
          <umb-workspace-editor-header back-path="section/blank-extension">
            <span slot="name">Settings</span>
          </umb-workspace-editor-header>
        </div>

        <div class="workspace-content">
          <uui-box headline="Extension Settings">
            <p>Configure your extension settings here.</p>
            <uui-form>
              <uui-form-layout-item>
                <uui-label slot="label">Option 1</uui-label>
                <uui-toggle slot="editor"></uui-toggle>
              </uui-form-layout-item>
              <uui-form-layout-item>
                <uui-label slot="label">Option 2</uui-label>
                <uui-input slot="editor" placeholder="Enter value..."></uui-input>
              </uui-form-layout-item>
            </uui-form>
          </uui-box>
        </div>
      </umb-body-layout>
    `;
  }
};
t.styles = p`
    :host {
      display: block;
      height: 100%;
    }

    .workspace-content {
      padding: var(--uui-size-space-4);
    }
  `;
t = b([
  d("blank-extension-settings-workspace")
], t);
const f = t;
export {
  t as BlankExtensionSettingsWorkspaceElement,
  f as default
};
//# sourceMappingURL=settings-workspace.element-Do3we-SC.js.map
