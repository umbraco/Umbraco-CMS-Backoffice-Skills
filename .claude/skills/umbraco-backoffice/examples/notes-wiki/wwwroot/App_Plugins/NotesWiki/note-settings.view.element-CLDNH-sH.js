import { N as T } from "./note-workspace.context-token-Kr8682SQ.js";
import { html as d, css as z, state as m, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as C } from "@umbraco-cms/backoffice/lit-element";
var N = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, _ = (t) => {
  throw TypeError(t);
}, g = (t, a, e, r) => {
  for (var s = r > 1 ? void 0 : r ? $(a, e) : a, p = t.length - 1, c; p >= 0; p--)
    (c = t[p]) && (s = (r ? c(a, e, s) : c(s)) || s);
  return r && s && N(a, e, s), s;
}, f = (t, a, e) => a.has(t) || _("Cannot " + e), u = (t, a, e) => (f(t, a, "read from private field"), a.get(t)), h = (t, a, e) => a.has(t) ? _("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(t) : a.set(t, e), k = (t, a, e, r) => (f(t, a, "write to private field"), a.set(t, e), e), o = (t, a, e) => (f(t, a, "access private method"), e), n, i, x, y, v, w, b;
let l = class extends C {
  constructor() {
    super(), h(this, i), h(this, n), this._tags = [], this._newTag = "", this.consumeContext(T, (t) => {
      k(this, n, t), o(this, i, x).call(this);
    });
  }
  render() {
    return d`
      <uui-box headline="Tags">
        <div class="tags-section">
          <div class="tag-input">
            <uui-input
              placeholder="Add a tag..."
              .value=${this._newTag}
              @input=${o(this, i, y)}
              @keypress=${o(this, i, b)}
            ></uui-input>
            <uui-button
              look="primary"
              @click=${o(this, i, v)}
              label="Add Tag"
              .disabled=${!this._newTag.trim()}
            >
              Add
            </uui-button>
          </div>

          <div class="tags-list">
            ${this._tags.length > 0 ? this._tags.map(
      (t) => d`
                    <uui-tag>
                      ${t}
                      <uui-button
                        compact
                        look="primary"
                        color="danger"
                        @click=${() => o(this, i, w).call(this, t)}
                        label="Remove tag"
                      >
                        <uui-icon name="icon-delete"></uui-icon>
                      </uui-button>
                    </uui-tag>
                  `
    ) : d`<p class="no-tags">No tags yet. Add some tags to organize your notes.</p>`}
          </div>
        </div>
      </uui-box>

      <uui-box headline="Information" class="info-box">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Created</span>
            <span class="info-value">-</span>
          </div>
          <div class="info-item">
            <span class="info-label">Modified</span>
            <span class="info-value">-</span>
          </div>
          <div class="info-item">
            <span class="info-label">Created by</span>
            <span class="info-value">-</span>
          </div>
          <div class="info-item">
            <span class="info-label">Modified by</span>
            <span class="info-value">-</span>
          </div>
        </div>
      </uui-box>
    `;
  }
};
n = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
x = function() {
  u(this, n) && this.observe(u(this, n).tags, (t) => {
    this._tags = t || [];
  });
};
y = function(t) {
  const a = t.target;
  this._newTag = a.value;
};
v = function() {
  var t;
  this._newTag.trim() && ((t = u(this, n)) == null || t.addTag(this._newTag.trim()), this._newTag = "");
};
w = function(t) {
  var a;
  (a = u(this, n)) == null || a.removeTag(t);
};
b = function(t) {
  t.key === "Enter" && o(this, i, v).call(this);
};
l.styles = [
  z`
      :host {
        display: block;
        padding: var(--uui-size-layout-1);
      }

      uui-box {
        margin-bottom: var(--uui-size-space-5);
      }

      .tags-section {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-4);
      }

      .tag-input {
        display: flex;
        gap: var(--uui-size-space-3);
      }

      .tag-input uui-input {
        flex: 1;
        max-width: 300px;
      }

      .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--uui-size-space-2);
      }

      .tags-list uui-tag {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-2);
      }

      .tags-list uui-tag uui-button {
        margin-left: var(--uui-size-space-1);
      }

      .no-tags {
        color: var(--uui-color-text-alt);
        font-style: italic;
        margin: 0;
      }

      .info-box {
        margin-top: var(--uui-size-space-5);
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--uui-size-space-4);
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-1);
      }

      .info-label {
        font-size: var(--uui-type-small-size);
        color: var(--uui-color-text-alt);
        text-transform: uppercase;
      }

      .info-value {
        color: var(--uui-color-text);
      }
    `
];
g([
  m()
], l.prototype, "_tags", 2);
g([
  m()
], l.prototype, "_newTag", 2);
l = g([
  E("notes-note-settings-view")
], l);
const P = l;
export {
  l as NoteSettingsViewElement,
  P as default
};
//# sourceMappingURL=note-settings.view.element-CLDNH-sH.js.map
