import { UmbControllerBase as n } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken as m } from "@umbraco-cms/backoffice/context-api";
import { UmbStringState as i, UmbBooleanState as h } from "@umbraco-cms/backoffice/observable-api";
import { c as r } from "./client.gen-DmQNfLcT.js";
class s {
  static getDate(e) {
    return (e?.client ?? r).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/timedashboard/api/v1/time/date",
      ...e
    });
  }
  static getTime(e) {
    return (e?.client ?? r).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/timedashboard/api/v1/time/time",
      ...e
    });
  }
  static getChildren(e) {
    return (e?.client ?? r).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/timedashboard/api/v1/tree",
      ...e
    });
  }
  static getRoot(e) {
    return (e?.client ?? r).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/timedashboard/api/v1/tree/root",
      ...e
    });
  }
}
class l {
  async getTime() {
    const { data: e, error: t } = await s.getTime();
    return t ? { error: new Error(String(t)) } : { data: e };
  }
  async getDate() {
    const { data: e, error: t } = await s.getDate();
    return t ? { error: new Error(String(t)) } : { data: e };
  }
}
class u extends n {
  #e;
  constructor(e) {
    super(e), this.#e = new l(), console.log("repository constructor");
  }
  async getTime() {
    return this.#e.getTime();
  }
  async getDate() {
    return this.#e.getDate();
  }
}
class o extends n {
  constructor(e) {
    super(e), this.#r = new i("unknown"), this.time = this.#r.asObservable(), this.#a = new i("unknown"), this.date = this.#a.asObservable(), this.#i = null, this.#t = new h(!1), this.polling = this.#t.asObservable(), this.provideContext(g, this), this.#e = new u(this);
  }
  #e;
  #r;
  #a;
  async getTime() {
    const { data: e } = await this.#e.getTime();
    e && this.#r.setValue(e);
  }
  async getDate() {
    const { data: e } = await this.#e.getDate();
    e && this.#a.setValue(e);
  }
  async getDateAndTime() {
    this.getTime(), this.getDate();
  }
  #i;
  #t;
  togglePolling() {
    const e = !this.#t.getValue();
    if (this.#t.setValue(e), e) {
      this.#i = setInterval(() => {
        this.getDateAndTime();
      }, 750);
      return;
    }
    clearInterval(this.#i);
  }
}
const g = new m(o.name), y = o;
export {
  g as TIME_MANAGEMENT_CONTEXT_TOKEN,
  o as TimeManagementContext,
  y as api,
  o as default
};
//# sourceMappingURL=time.context-DShPQY3b.js.map
