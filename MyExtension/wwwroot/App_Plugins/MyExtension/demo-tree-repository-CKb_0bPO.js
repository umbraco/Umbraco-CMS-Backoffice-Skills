import { UmbTreeRepositoryBase as i } from "@umbraco-cms/backoffice/tree";
import { UmbControllerBase as o } from "@umbraco-cms/backoffice/class-api";
class m extends o {
  constructor(e) {
    super(e);
  }
  async getRootItems() {
    console.log("getRootItems called");
    const e = [
      {
        unique: "item-1",
        name: "Item 1",
        entityType: "demo-tree-item",
        hasChildren: !0,
        isFolder: !0,
        parent: { unique: "null", entityType: "demo-tree-root" }
      },
      {
        unique: "item-2",
        name: "Item 2",
        entityType: "demo-tree-item",
        hasChildren: !1,
        isFolder: !1,
        parent: { unique: "null", entityType: "demo-tree-root" }
      }
    ];
    return { data: { items: e, total: e.length } };
  }
  async getChildrenOf(e) {
    console.log("getChildrenOf called with parent:", e.parent);
    const t = [], n = e.parent?.unique;
    return n === null ? (console.log("Loading root level items"), t.push(
      {
        unique: "item-1",
        name: "Item 1",
        entityType: "demo-tree-item",
        hasChildren: !0,
        isFolder: !0,
        parent: { unique: "null", entityType: "demo-tree-root" }
      },
      {
        unique: "item-2",
        name: "Item 2",
        entityType: "demo-tree-item",
        hasChildren: !1,
        isFolder: !1,
        parent: { unique: "null", entityType: "demo-tree-root" }
      }
    )) : n === "item-1" && (console.log("Loading children for item-1"), t.push(
      {
        unique: "item-1-1",
        name: "Sub Item 1.1",
        entityType: "demo-tree-item",
        hasChildren: !1,
        isFolder: !1,
        parent: { unique: "item-1", entityType: "demo-tree-item" }
      },
      {
        unique: "item-1-2",
        name: "Sub Item 1.2",
        entityType: "demo-tree-item",
        hasChildren: !1,
        isFolder: !1,
        parent: { unique: "item-1", entityType: "demo-tree-item" }
      }
    )), console.log("Returning items:", t), { data: { items: t, total: t.length } };
  }
  async getAncestorsOf(e) {
    const t = [], n = e.treeItem.unique;
    return (n === "item-1-1" || n === "item-1-2") && t.push({
      unique: "item-1",
      name: "Item 1",
      entityType: "demo-tree-item",
      hasChildren: !0,
      isFolder: !0,
      parent: { unique: "", entityType: "demo-tree-root" }
    }), { data: t };
  }
}
class l extends i {
  constructor(e) {
    super(e, m);
  }
  async requestTreeRoot() {
    return {
      data: {
        unique: null,
        entityType: "demo-tree-root",
        name: "Demo Tree",
        hasChildren: !0,
        isFolder: !0
      }
    };
  }
}
export {
  l as api,
  l as default
};
//# sourceMappingURL=demo-tree-repository-CKb_0bPO.js.map
