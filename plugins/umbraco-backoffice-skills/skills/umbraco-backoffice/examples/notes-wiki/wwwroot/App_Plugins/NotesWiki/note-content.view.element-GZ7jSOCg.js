import { N as w } from "./note-workspace.context-token-DNUQtk0q.js";
import { html as x, css as y, state as f, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as b } from "@umbraco-cms/backoffice/lit-element";
var O = Object.defineProperty, T = Object.getOwnPropertyDescriptor, d = (t) => {
  throw TypeError(t);
}, p = (t, e, i, a) => {
  for (var n = a > 1 ? void 0 : a ? T(e, i) : e, u = t.length - 1, h; u >= 0; u--)
    (h = t[u]) && (n = (a ? h(e, i, n) : h(n)) || n);
  return a && n && O(e, i, n), n;
}, v = (t, e, i) => e.has(t) || d("Cannot " + i), l = (t, e, i) => (v(t, e, "read from private field"), e.get(t)), _ = (t, e, i) => e.has(t) ? d("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), N = (t, e, i, a) => (v(t, e, "write to private field"), e.set(t, i), i), c = (t, e, i) => (v(t, e, "access private method"), i), o, s, m, g, C;
let r = class extends b {
  /**
   * Sets up context consumption on construction.
   *
   * Uses `consumeContext` to get the workspace context, then
   * sets up observers for reactive data binding.
   */
  constructor() {
    super(), _(this, s), _(this, o), this._title = "", this._content = "", this.consumeContext(w, (t) => {
      N(this, o, t), c(this, s, m).call(this);
    });
  }
  render() {
    return x`
      <uui-box>
        <div class="form-group">
          <label for="title">Title</label>
          <uui-input
            id="title"
            placeholder="Enter note title..."
            .value=${this._title}
            @input=${c(this, s, g)}
          ></uui-input>
        </div>

        <div class="form-group">
          <label for="content">Content</label>
          <uui-textarea
            id="content"
            placeholder="Write your note content here..."
            .value=${this._content}
            @input=${c(this, s, C)}
            rows="20"
          ></uui-textarea>
        </div>
      </uui-box>
    `;
  }
};
o = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
m = function() {
  l(this, o) && (this.observe(l(this, o).title, (t) => {
    this._title = t || "";
  }), this.observe(l(this, o).content, (t) => {
    this._content = t || "";
  }));
};
g = function(t) {
  var i;
  const e = t.target;
  (i = l(this, o)) == null || i.setTitle(e.value);
};
C = function(t) {
  var i;
  const e = t.target;
  (i = l(this, o)) == null || i.setContent(e.value);
};
r.styles = [
  y`
      :host {
        display: block;
        padding: var(--uui-size-layout-1);
      }

      .form-group {
        margin-bottom: var(--uui-size-space-5);
      }

      .form-group:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        margin-bottom: var(--uui-size-space-2);
        font-weight: 600;
        color: var(--uui-color-text);
      }

      uui-input {
        width: 100%;
      }

      uui-textarea {
        width: 100%;
        min-height: 400px;
        font-family: var(--uui-font-family);
      }
    `
];
p([
  f()
], r.prototype, "_title", 2);
p([
  f()
], r.prototype, "_content", 2);
r = p([
  E("notes-note-content-view")
], r);
const $ = r;
export {
  r as NoteContentViewElement,
  $ as default
};
//# sourceMappingURL=note-content.view.element-GZ7jSOCg.js.map
