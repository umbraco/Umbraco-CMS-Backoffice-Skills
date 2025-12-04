import { UmbTreeServerDataSourceBase as n, UmbTreeRepositoryBase as i } from "@umbraco-cms/backoffice/tree";
import { OUR_TREE_STORE_CONTEXT as s } from "./ourtree.store-CiK112rZ.js";
import { O as l, a as u } from "./bundle.manifests-D-kuPIxP.js";
import { c as t } from "./client.gen-CinYYOVQ.js";
class a {
  static getAncestors(e) {
    return ((e == null ? void 0 : e.client) ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/umbtreeclient/api/v1/Ancestors",
      ...e
    });
  }
  static getChildren(e) {
    return ((e == null ? void 0 : e.client) ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/umbtreeclient/api/v1/Children",
      ...e
    });
  }
  static ping(e) {
    return ((e == null ? void 0 : e.client) ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/umbtreeclient/api/v1/ping",
      ...e
    });
  }
  static getRoot(e) {
    return ((e == null ? void 0 : e.client) ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/umbtreeclient/api/v1/root",
      ...e
    });
  }
}
class m extends n {
  constructor(e) {
    super(e, {
      getRootItems: c,
      getChildrenOf: y,
      getAncestorsOf: T,
      mapper: h
    });
  }
}
const T = async (r) => await a.getAncestors({
  query: { id: r.treeItem.unique }
}), c = async (r) => await a.getRoot({
  query: { skip: r.skip, take: r.take }
}), y = async (r) => {
  var e;
  return ((e = r.parent) == null ? void 0 : e.unique) === null ? await c(r) : await a.getChildren({
    query: { parent: r.parent.unique }
  });
}, h = (r) => ({
  unique: r.id ?? "",
  parent: { unique: "", entityType: u },
  name: r.name ?? "unknown",
  entityType: l,
  hasChildren: r.hasChildren,
  isFolder: !1,
  icon: r.icon ?? "icon-bug"
});
class g extends i {
  constructor(e) {
    super(e, m, s);
  }
  async requestTreeRoot() {
    return { data: {
      unique: null,
      entityType: u,
      name: "Our Tree Root",
      icon: "icon-star",
      hasChildren: !0,
      isFolder: !0
    } };
  }
}
export {
  g as OurTreeRepository,
  g as api
};
//# sourceMappingURL=ourtree.repository-B9x7s5CC.js.map
