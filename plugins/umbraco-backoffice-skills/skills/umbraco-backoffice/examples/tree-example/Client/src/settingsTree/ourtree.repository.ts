import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import type { UmbApi } from "@umbraco-cms/backoffice/extension-api";
import { UmbTreeRepositoryBase } from "@umbraco-cms/backoffice/tree";
import { OUR_TREE_STORE_CONTEXT } from "./ourtree.store.js";
import {
  OUR_TREE_ROOT_ENTITY_TYPE,
  type OurTreeItemModel,
  type OurTreeRootModel,
} from "./types.js";
import { OurTreeDataSource } from "./ourtree.data-source.js";

export class OurTreeRepository
  extends UmbTreeRepositoryBase<OurTreeItemModel, OurTreeRootModel>
  implements UmbApi
{
  constructor(host: UmbControllerHost) {
    super(host, OurTreeDataSource, OUR_TREE_STORE_CONTEXT);
  }

  async requestTreeRoot() {
    const data: OurTreeRootModel = {
      unique: null,
      entityType: OUR_TREE_ROOT_ENTITY_TYPE,
      name: "Our Tree Root",
      icon: "icon-star",
      hasChildren: true,
      isFolder: true,
    };

    return { data };
  }
}

export { OurTreeRepository as api };
