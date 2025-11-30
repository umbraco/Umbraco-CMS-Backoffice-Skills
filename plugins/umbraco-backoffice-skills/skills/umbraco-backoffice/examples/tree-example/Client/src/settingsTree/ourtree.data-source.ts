import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import type {
  UmbTreeAncestorsOfRequestArgs,
  UmbTreeChildrenOfRequestArgs,
  UmbTreeRootItemsRequestArgs,
} from "@umbraco-cms/backoffice/tree";
import { UmbTreeServerDataSourceBase } from "@umbraco-cms/backoffice/tree";
import type { OurTreeItemResponseModel } from "../api/index.js";
import { UmbTreeClientService } from "../api/index.js";
import {
  OUR_TREE_ITEM_ENTITY_TYPE,
  OUR_TREE_ROOT_ENTITY_TYPE,
  type OurTreeItemModel,
} from "./types.js";

export class OurTreeDataSource extends UmbTreeServerDataSourceBase<OurTreeItemResponseModel, OurTreeItemModel> {
  constructor(host: UmbControllerHost) {
    super(host, {
      getRootItems,
      getChildrenOf,
      getAncestorsOf,
      mapper,
    });
  }
}

const getAncestorsOf = async (args: UmbTreeAncestorsOfRequestArgs) => {
  return await UmbTreeClientService.getAncestors({
    query: { id: args.treeItem.unique },
  });
};

const getRootItems = async (args: UmbTreeRootItemsRequestArgs) =>
  await UmbTreeClientService.getRoot({
    query: { skip: args.skip, take: args.take },
  });

const getChildrenOf = async (args: UmbTreeChildrenOfRequestArgs) => {
  if (args.parent?.unique === null) {
    return await getRootItems(args);
  } else {
    return await UmbTreeClientService.getChildren({
      query: { parent: args.parent.unique },
    });
  }
};

const mapper = (item: OurTreeItemResponseModel): OurTreeItemModel => {
  return {
    unique: item.id ?? "",
    parent: { unique: "", entityType: OUR_TREE_ROOT_ENTITY_TYPE },
    name: item.name ?? "unknown",
    entityType: OUR_TREE_ITEM_ENTITY_TYPE,
    hasChildren: item.hasChildren,
    isFolder: false,
    icon: item.icon ?? "icon-bug",
  };
};
