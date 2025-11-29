import { N as z } from "./note-workspace.context-token-DNUQtk0q.js";
import { html as f, css as D, state as d, customElement as $ } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as E } from "@umbraco-cms/backoffice/lit-element";
var C = Object.defineProperty, k = Object.getOwnPropertyDescriptor, y = (e) => {
  throw TypeError(e);
}, u = (e, t, i, c) => {
  for (var l = c > 1 ? void 0 : c ? k(t, i) : t, p = e.length - 1, v; p >= 0; p--)
    (v = e[p]) && (l = (c ? v(t, i, l) : v(l)) || l);
  return c && l && C(t, i, l), l;
}, h = (e, t, i) => t.has(e) || y("Cannot " + i), n = (e, t, i) => (h(e, t, "read from private field"), t.get(e)), _ = (e, t, i) => t.has(e) ? y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), B = (e, t, i, c) => (h(e, t, "write to private field"), t.set(e, i), i), r = (e, t, i) => (h(e, t, "access private method"), i), a, s, b, g, x, m, w, T;
let o = class extends E {
  constructor() {
    super(), _(this, s), _(this, a), this._tags = [], this._newTag = "", this.consumeContext(z, (e) => {
      B(this, a, e), r(this, s, b).call(this);
    });
  }
  render() {
    return f`
      <uui-box headline="Tags">
        <div class="tags-section">
          <div class="tag-input">
            <uui-input
              placeholder="Add a tag..."
              .value=${this._newTag}
              @input=${r(this, s, x)}
              @keypress=${r(this, s, T)}
            ></uui-input>
            <uui-button
              look="primary"
              @click=${r(this, s, m)}
              label="Add Tag"
              .disabled=${!this._newTag.trim()}
            >
              Add
            </uui-button>
          </div>

          <div class="tags-list">
            ${this._tags.length > 0 ? this._tags.map(
      (e) => f`
                    <span class="tag">
                      ${e}
                      <button
                        class="tag-remove"
                        @click=${() => r(this, s, w).call(this, e)}
                        aria-label="Remove tag"
                      >
                        <uui-icon name="icon-wrong"></uui-icon>
                      </button>
                    </span>
                  `
    ) : f`<p class="no-tags">No tags yet. Add some tags to organize your notes.</p>`}
          </div>
        </div>
      </uui-box>

      <uui-box headline="Information" class="info-box">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Created</span>
            <span class="info-value">${r(this, s, g).call(this, this._createdDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Modified</span>
            <span class="info-value">${r(this, s, g).call(this, this._modifiedDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Created by</span>
            <span class="info-value">${this._createdBy || "-"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Modified by</span>
            <span class="info-value">${this._modifiedBy || "-"}</span>
          </div>
        </div>
      </uui-box>
    `;
  }
};
a = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
b = function() {
  n(this, a) && (this.observe(n(this, a).tags, (e) => {
    this._tags = e || [];
  }), this.observe(n(this, a).createdDate, (e) => {
    this._createdDate = e;
  }), this.observe(n(this, a).modifiedDate, (e) => {
    this._modifiedDate = e;
  }), this.observe(n(this, a).createdBy, (e) => {
    this._createdBy = e;
  }), this.observe(n(this, a).modifiedBy, (e) => {
    this._modifiedBy = e;
  }));
};
g = function(e) {
  return e ? new Date(e).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "-";
};
x = function(e) {
  const t = e.target;
  this._newTag = t.value;
};
m = function() {
  var e;
  this._newTag.trim() && ((e = n(this, a)) == null || e.addTag(this._newTag.trim()), this._newTag = "");
};
w = function(e) {
  var t;
  (t = n(this, a)) == null || t.removeTag(e);
};
T = function(e) {
  e.key === "Enter" && r(this, s, m).call(this);
};
o.styles = [
  D`
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

      .tag {
        display: inline-flex;
        align-items: center;
        gap: var(--uui-size-space-2);
        padding: var(--uui-size-space-1) var(--uui-size-space-3);
        background: var(--uui-color-surface-alt);
        border: 1px solid var(--uui-color-border);
        border-radius: var(--uui-border-radius);
        font-size: var(--uui-type-small-size);
        color: var(--uui-color-text);
      }

      .tag-remove {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
        color: var(--uui-color-text-alt);
        transition: color 0.1s ease;
      }

      .tag-remove:hover {
        color: var(--uui-color-danger);
      }

      .tag-remove uui-icon {
        font-size: 12px;
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
u([
  d()
], o.prototype, "_tags", 2);
u([
  d()
], o.prototype, "_newTag", 2);
u([
  d()
], o.prototype, "_createdDate", 2);
u([
  d()
], o.prototype, "_modifiedDate", 2);
u([
  d()
], o.prototype, "_createdBy", 2);
u([
  d()
], o.prototype, "_modifiedBy", 2);
o = u([
  $("notes-note-settings-view")
], o);
const S = o;
export {
  o as NoteSettingsViewElement,
  S as default
};
//# sourceMappingURL=note-settings.view.element-Bn3rxrq8.js.map
