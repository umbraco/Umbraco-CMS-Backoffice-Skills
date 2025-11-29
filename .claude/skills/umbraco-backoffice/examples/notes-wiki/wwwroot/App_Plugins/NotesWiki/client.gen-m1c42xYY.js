var K = Object.defineProperty;
var M = (p, f, h) => f in p ? K(p, f, { enumerable: !0, configurable: !0, writable: !0, value: h }) : p[f] = h;
var E = (p, f, h) => M(p, typeof f != "symbol" ? f + "" : f, h);
var y = {}, U;
function X() {
  if (U) return y;
  U = 1;
  var p = async (t, r) => {
    let e = typeof r == "function" ? await r(t) : r;
    if (e) return t.scheme === "bearer" ? `Bearer ${e}` : t.scheme === "basic" ? `Basic ${btoa(e)}` : e;
  }, f = (t, r, e) => {
    typeof e == "string" || e instanceof Blob ? t.append(r, e) : t.append(r, JSON.stringify(e));
  }, h = (t, r, e) => {
    typeof e == "string" ? t.append(r, e) : t.append(r, JSON.stringify(e));
  }, I = { bodySerializer: (t) => {
    let r = new FormData();
    return Object.entries(t).forEach(([e, s]) => {
      s != null && (Array.isArray(s) ? s.forEach((l) => f(r, e, l)) : f(r, e, s));
    }), r;
  } }, x = { bodySerializer: (t) => JSON.stringify(t, (r, e) => typeof e == "bigint" ? e.toString() : e) }, T = { bodySerializer: (t) => {
    let r = new URLSearchParams();
    return Object.entries(t).forEach(([e, s]) => {
      s != null && (Array.isArray(s) ? s.forEach((l) => h(r, e, l)) : h(r, e, s));
    }), r.toString();
  } }, W = (t) => {
    switch (t) {
      case "label":
        return ".";
      case "matrix":
        return ";";
      case "simple":
        return ",";
      default:
        return "&";
    }
  }, D = (t) => {
    switch (t) {
      case "form":
        return ",";
      case "pipeDelimited":
        return "|";
      case "spaceDelimited":
        return "%20";
      default:
        return ",";
    }
  }, N = (t) => {
    switch (t) {
      case "label":
        return ".";
      case "matrix":
        return ";";
      case "simple":
        return ",";
      default:
        return "&";
    }
  }, $ = ({ allowReserved: t, explode: r, name: e, style: s, value: l }) => {
    if (!r) {
      let a = (t ? l : l.map((i) => encodeURIComponent(i))).join(D(s));
      switch (s) {
        case "label":
          return `.${a}`;
        case "matrix":
          return `;${e}=${a}`;
        case "simple":
          return a;
        default:
          return `${e}=${a}`;
      }
    }
    let o = W(s), n = l.map((a) => s === "label" || s === "simple" ? t ? a : encodeURIComponent(a) : w({ allowReserved: t, name: e, value: a })).join(o);
    return s === "label" || s === "matrix" ? o + n : n;
  }, w = ({ allowReserved: t, name: r, value: e }) => {
    if (e == null) return "";
    if (typeof e == "object") throw new Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");
    return `${r}=${t ? e : encodeURIComponent(e)}`;
  }, C = ({ allowReserved: t, explode: r, name: e, style: s, value: l }) => {
    if (l instanceof Date) return `${e}=${l.toISOString()}`;
    if (s !== "deepObject" && !r) {
      let a = [];
      Object.entries(l).forEach(([m, d]) => {
        a = [...a, m, t ? d : encodeURIComponent(d)];
      });
      let i = a.join(",");
      switch (s) {
        case "form":
          return `${e}=${i}`;
        case "label":
          return `.${i}`;
        case "matrix":
          return `;${e}=${i}`;
        default:
          return i;
      }
    }
    let o = N(s), n = Object.entries(l).map(([a, i]) => w({ allowReserved: t, name: s === "deepObject" ? `${e}[${a}]` : a, value: i })).join(o);
    return s === "label" || s === "matrix" ? o + n : n;
  }, P = /\{[^{}]+\}/g, k = ({ path: t, url: r }) => {
    let e = r, s = r.match(P);
    if (s) for (let l of s) {
      let o = !1, n = l.substring(1, l.length - 1), a = "simple";
      n.endsWith("*") && (o = !0, n = n.substring(0, n.length - 1)), n.startsWith(".") ? (n = n.substring(1), a = "label") : n.startsWith(";") && (n = n.substring(1), a = "matrix");
      let i = t[n];
      if (i == null) continue;
      if (Array.isArray(i)) {
        e = e.replace(l, $({ explode: o, name: n, style: a, value: i }));
        continue;
      }
      if (typeof i == "object") {
        e = e.replace(l, C({ explode: o, name: n, style: a, value: i }));
        continue;
      }
      if (a === "matrix") {
        e = e.replace(l, `;${w({ name: n, value: i })}`);
        continue;
      }
      let m = encodeURIComponent(a === "label" ? `.${i}` : i);
      e = e.replace(l, m);
    }
    return e;
  }, O = ({ allowReserved: t, array: r, object: e } = {}) => (s) => {
    let l = [];
    if (s && typeof s == "object") for (let o in s) {
      let n = s[o];
      if (n != null) if (Array.isArray(n)) {
        let a = $({ allowReserved: t, explode: !0, name: o, style: "form", value: n, ...r });
        a && l.push(a);
      } else if (typeof n == "object") {
        let a = C({ allowReserved: t, explode: !0, name: o, style: "deepObject", value: n, ...e });
        a && l.push(a);
      } else {
        let a = w({ allowReserved: t, name: o, value: n });
        a && l.push(a);
      }
    }
    return l.join("&");
  }, B = (t) => {
    var e;
    if (!t) return "stream";
    let r = (e = t.split(";")[0]) == null ? void 0 : e.trim();
    if (r) {
      if (r.startsWith("application/json") || r.endsWith("+json")) return "json";
      if (r === "multipart/form-data") return "formData";
      if (["application/", "audio/", "image/", "video/"].some((s) => r.startsWith(s))) return "blob";
      if (r.startsWith("text/")) return "text";
    }
  }, J = async ({ security: t, ...r }) => {
    for (let e of t) {
      let s = await p(e, r.auth);
      if (!s) continue;
      let l = e.name ?? "Authorization";
      switch (e.in) {
        case "query":
          r.query || (r.query = {}), r.query[l] = s;
          break;
        case "cookie":
          r.headers.append("Cookie", `${l}=${s}`);
          break;
        case "header":
        default:
          r.headers.set(l, s);
          break;
      }
      return;
    }
  }, q = (t) => H({ baseUrl: t.baseUrl, path: t.path, query: t.query, querySerializer: typeof t.querySerializer == "function" ? t.querySerializer : O(t.querySerializer), url: t.url }), H = ({ baseUrl: t, path: r, query: e, querySerializer: s, url: l }) => {
    let o = l.startsWith("/") ? l : `/${l}`, n = (t ?? "") + o;
    r && (n = k({ path: r, url: n }));
    let a = e ? s(e) : "";
    return a.startsWith("?") && (a = a.substring(1)), a && (n += `?${a}`), n;
  }, R = (t, r) => {
    var s;
    let e = { ...t, ...r };
    return (s = e.baseUrl) != null && s.endsWith("/") && (e.baseUrl = e.baseUrl.substring(0, e.baseUrl.length - 1)), e.headers = A(t.headers, r.headers), e;
  }, A = (...t) => {
    let r = new Headers();
    for (let e of t) {
      if (!e || typeof e != "object") continue;
      let s = e instanceof Headers ? e.entries() : Object.entries(e);
      for (let [l, o] of s) if (o === null) r.delete(l);
      else if (Array.isArray(o)) for (let n of o) r.append(l, n);
      else o !== void 0 && r.set(l, typeof o == "object" ? JSON.stringify(o) : o);
    }
    return r;
  }, S = class {
    constructor() {
      E(this, "_fns");
      this._fns = [];
    }
    clear() {
      this._fns = [];
    }
    getInterceptorIndex(t) {
      return typeof t == "number" ? this._fns[t] ? t : -1 : this._fns.indexOf(t);
    }
    exists(t) {
      let r = this.getInterceptorIndex(t);
      return !!this._fns[r];
    }
    eject(t) {
      let r = this.getInterceptorIndex(t);
      this._fns[r] && (this._fns[r] = null);
    }
    update(t, r) {
      let e = this.getInterceptorIndex(t);
      return this._fns[e] ? (this._fns[e] = r, t) : !1;
    }
    use(t) {
      return this._fns = [...this._fns, t], this._fns.length - 1;
    }
  }, L = () => ({ error: new S(), request: new S(), response: new S() }), V = O({ allowReserved: !1, array: { explode: !0, style: "form" }, object: { explode: !0, style: "deepObject" } }), F = { "Content-Type": "application/json" }, z = (t = {}) => ({ ...x, headers: F, parseAs: "auto", querySerializer: V, ...t }), G = (t = {}) => {
    let r = R(z(), t), e = () => ({ ...r }), s = (n) => (r = R(r, n), e()), l = L(), o = async (n) => {
      let a = { ...r, ...n, fetch: n.fetch ?? r.fetch ?? globalThis.fetch, headers: A(r.headers, n.headers) };
      a.security && await J({ ...a, security: a.security }), a.body && a.bodySerializer && (a.body = a.bodySerializer(a.body)), (a.body === void 0 || a.body === "") && a.headers.delete("Content-Type");
      let i = q(a), m = { redirect: "follow", ...a }, d = new Request(i, m);
      for (let u of l.request._fns) u && (d = await u(d, a));
      let Q = a.fetch, c = await Q(d);
      for (let u of l.response._fns) u && (c = await u(c, d, a));
      let g = { request: d, response: c };
      if (c.ok) {
        if (c.status === 204 || c.headers.get("Content-Length") === "0") return { data: {}, ...g };
        let u = (a.parseAs === "auto" ? B(c.headers.get("Content-Type")) : a.parseAs) ?? "json";
        if (u === "stream") return { data: c.body, ...g };
        let v = await c[u]();
        return u === "json" && (a.responseValidator && await a.responseValidator(v), a.responseTransformer && (v = await a.responseTransformer(v))), { data: v, ...g };
      }
      let j = await c.text();
      try {
        j = JSON.parse(j);
      } catch {
      }
      let b = j;
      for (let u of l.error._fns) u && (b = await u(j, c, d, a));
      if (b = b || {}, a.throwOnError) throw b;
      return { error: b, ...g };
    };
    return { buildUrl: q, connect: (n) => o({ ...n, method: "CONNECT" }), delete: (n) => o({ ...n, method: "DELETE" }), get: (n) => o({ ...n, method: "GET" }), getConfig: e, head: (n) => o({ ...n, method: "HEAD" }), interceptors: l, options: (n) => o({ ...n, method: "OPTIONS" }), patch: (n) => o({ ...n, method: "PATCH" }), post: (n) => o({ ...n, method: "POST" }), put: (n) => o({ ...n, method: "PUT" }), request: o, setConfig: s, trace: (n) => o({ ...n, method: "TRACE" }) };
  };
  return y.createClient = G, y.createConfig = z, y.formDataBodySerializer = I, y.jsonBodySerializer = x, y.urlSearchParamsBodySerializer = T, y;
}
var _ = X();
const Z = _.createClient(_.createConfig({
  baseUrl: "https://localhost:44325",
  throwOnError: !0
}));
export {
  Z as c
};
//# sourceMappingURL=client.gen-m1c42xYY.js.map
