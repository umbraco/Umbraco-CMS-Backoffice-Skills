import { UmbTreeServerDataSourceBase as i, UmbTreeRepositoryBase as p } from "@umbraco-cms/backoffice/tree";
import { N as n, a as o, b as u } from "./bundle.manifests-JkEH1cPZ.js";
import "./client.gen-m1c42xYY.js";
import { N as r } from "./sdk.gen-DVGT3O8n.js";
import { NOTES_TREE_STORE_CONTEXT as d } from "./notes-tree.store-BxgHc6cf.js";
class c extends i {
  constructor(t) {
    super(t, {
      getRootItems: s,
      getChildrenOf: T,
      getAncestorsOf: l,
      mapper: y
    });
  }
}
const s = async (e) => {
  const t = await r.getRoot({
    query: { skip: e.skip, take: e.take }
  });
  return {
    data: {
      items: t.data.items,
      total: t.data.total
    }
  };
}, T = async (e) => {
  var a;
  if (((a = e.parent) == null ? void 0 : a.unique) === null)
    return await s(e);
  const t = await r.getChildren({
    path: { parentId: e.parent.unique },
    query: { skip: e.skip, take: e.take }
  });
  return {
    data: {
      items: t.data.items,
      total: t.data.total
    }
  };
}, l = async (e) => ({ data: (await r.getAncestors({
  path: { id: e.treeItem.unique }
})).data }), y = (e) => {
  let t;
  return e.isFolder || e.entityType === "notes-folder" ? t = n : t = u, {
    unique: e.id,
    parent: {
      unique: e.parentId || null,
      entityType: e.parentId ? n : o
    },
    name: e.name,
    entityType: t,
    hasChildren: e.hasChildren,
    isFolder: e.isFolder,
    icon: e.icon || (e.isFolder ? "icon-folder" : "icon-notepad")
  };
};
class f extends p {
  constructor(t) {
    super(t, c, d);
  }
  /**
   * Returns the root model for the tree.
   * This is displayed when hideTreeRoot is false.
   */
  async requestTreeRoot() {
    return { data: {
      unique: null,
      entityType: o,
      name: "Notes",
      icon: "icon-notepad",
      hasChildren: !0,
      isFolder: !0
    } };
  }
}
export {
  f as NotesTreeRepository,
  f as api
};
//# sourceMappingURL=notes-tree.repository-nnfyCMF_.js.map
