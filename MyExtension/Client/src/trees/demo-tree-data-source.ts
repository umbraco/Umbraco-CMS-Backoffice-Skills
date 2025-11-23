import type { UmbTreeDataSource, UmbTreeRootModel } from "@umbraco-cms/backoffice/tree";
import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import type { UmbTreeItemModel } from "@umbraco-cms/backoffice/tree";

export interface DemoTreeItemModel extends UmbTreeItemModel {}

export interface DemoTreeRootModel extends UmbTreeRootModel {}

export class DemoTreeDataSource extends UmbControllerBase implements UmbTreeDataSource<DemoTreeItemModel> {
  constructor(host: UmbControllerHost) {
    super(host);
  }

  async getRootItems() {
    console.log("getRootItems called");
    const items: Array<DemoTreeItemModel> = [
      {
        unique: "item-1",
        name: "Item 1",
        entityType: "demo-tree-item",
        hasChildren: true,
        isFolder: true,
        parent: { unique: "null", entityType: "demo-tree-root" },
      },
      {
        unique: "item-2",
        name: "Item 2",
        entityType: "demo-tree-item",
        hasChildren: false,
        isFolder: false,
        parent: { unique: "null", entityType: "demo-tree-root" },
      },
    ];

    return { data: { items, total: items.length } };
  }

  async getChildrenOf(args: { parent: { unique: string | null } }) {
    console.log("getChildrenOf called with parent:", args.parent);
    const items: Array<DemoTreeItemModel> = [];
    const parentUnique = args.parent?.unique;

    // Root level items
    if (parentUnique === null) {
      console.log("Loading root level items");
      items.push(
        {
          unique: "item-1",
          name: "Item 1",
          entityType: "demo-tree-item",
          hasChildren: true,
          isFolder: true,
          parent: { unique: "null", entityType: "demo-tree-root" },
        },
        {
          unique: "item-2",
          name: "Item 2",
          entityType: "demo-tree-item",
          hasChildren: false,
          isFolder: false,
          parent: { unique: "null", entityType: "demo-tree-root" },
        }
      );
    } else if (parentUnique === "item-1") {
      console.log("Loading children for item-1");
      items.push(
        {
          unique: "item-1-1",
          name: "Sub Item 1.1",
          entityType: "demo-tree-item",
          hasChildren: false,
          isFolder: false,
          parent: { unique: "item-1", entityType: "demo-tree-item" },
        },
        {
          unique: "item-1-2",
          name: "Sub Item 1.2",
          entityType: "demo-tree-item",
          hasChildren: false,
          isFolder: false,
          parent: { unique: "item-1", entityType: "demo-tree-item" },
        }
      );
    }

    console.log("Returning items:", items);
    return { data: { items, total: items.length } };
  }

  async getAncestorsOf(args: { treeItem: { unique: string } }) {
    const ancestors: Array<DemoTreeItemModel> = [];
    const unique = args.treeItem.unique;

    if (unique === "item-1-1" || unique === "item-1-2") {
      ancestors.push({
        unique: "item-1",
        name: "Item 1",
        entityType: "demo-tree-item",
        hasChildren: true,
        isFolder: true,
        parent: { unique: "", entityType: "demo-tree-root" },
      });
    }

    return { data: ancestors };
  }
}
