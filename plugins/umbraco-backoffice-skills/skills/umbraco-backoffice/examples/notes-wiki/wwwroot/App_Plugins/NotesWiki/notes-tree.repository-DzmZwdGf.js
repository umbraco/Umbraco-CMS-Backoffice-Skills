import { UmbTreeServerDataSourceBase as i, UmbTreeRepositoryBase as p } from "@umbraco-cms/backoffice/tree";
import { a as n, b as o, N as u } from "./bundle.manifests-CPE-rfRR.js";
import "./client.gen-m1c42xYY.js";
import { N as r } from "./sdk.gen-DVGT3O8n.js";
import { NOTES_TREE_STORE_CONTEXT as d } from "./notes-tree.store-BoALzgMr.js";
class c extends i {
  /**
   * Creates a new data source instance.
   *
   * @param {UmbControllerHost} host - The controller host (unused but required by base class)
   */
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
      // Infer parent entity type: if no parentId, parent is root
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
  /**
   * Creates a new Notes tree repository.
   *
   * @param {UmbControllerHost} host - The controller host for context consumption.
   *   This is typically the component or context that creates the repository.
   */
  constructor(t) {
    super(t, c, d);
  }
  /**
   * Returns the root model for the tree.
   *
   * The tree root is a virtual item that represents the top of the hierarchy.
   * It's displayed when `hideTreeRoot: false` in the tree manifest.
   *
   * **Why is this needed?**
   *
   * Unlike regular tree items that come from the API, the root is synthetic.
   * It provides:
   * - A consistent top-level item for navigation
   * - A target for "Create at root" actions
   * - An entity type for root-level entity actions
   *
   * @returns {Promise<{data: NotesTreeRootModel}>} The tree root model
   *
   * @example
   * const { data: root } = await repository.requestTreeRoot();
   * console.log(root.entityType); // "notes-root"
   * console.log(root.name);       // "Notes"
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
//# sourceMappingURL=notes-tree.repository-DzmZwdGf.js.map
