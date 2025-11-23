import { UmbTreeRepositoryBase } from "@umbraco-cms/backoffice/tree";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { DemoTreeDataSource, type DemoTreeItemModel, type DemoTreeRootModel } from "./demo-tree-data-source.js";

class DemoTreeRepository extends UmbTreeRepositoryBase<DemoTreeItemModel, DemoTreeRootModel> {
  constructor(host: UmbControllerHost) {
    super(host, DemoTreeDataSource);
  }

  async requestTreeRoot() {
    return {
      data: {
        unique: null,
        entityType: "demo-tree-root",
        name: "Demo Tree",
        hasChildren: true,
        isFolder: true,
      },
    };
  }
}

export { DemoTreeRepository as default };
export { DemoTreeRepository as api };
