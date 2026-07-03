import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import type { UmbApi } from "@umbraco-cms/backoffice/extension-api";
import {
  UmbTreeRepositoryBase,
  UmbTreeServerDataSourceBase,
  type UmbTreeAncestorsOfRequestArgs,
  type UmbTreeChildrenOfRequestArgs,
  type UmbTreeRootItemsRequestArgs,
} from "@umbraco-cms/backoffice/tree";
import {
  OUR_TREE_ROOT_ENTITY_TYPE,
  OUR_TREE_ITEM_ENTITY_TYPE,
  type OurTreeItemModel,
  type OurTreeRootModel,
} from "./types.js";
import type {
  OurTreeItemResponseModel,
  PagedOurTreeItemResponseModel,
} from "../api/index.js";
import { UmbTreeClientService } from "../api/index.js";

/**
 * Extract offset paging (skip/take) from the tree request args.
 * Since 16.3 paging moved into `args.paging` (skip/take are deprecated), which is either offset-based
 * ({ skip, take }) or target-based. This server API only supports offset.
 */
function toOffsetQuery(paging: UmbTreeRootItemsRequestArgs["paging"]) {
  if (paging && "skip" in paging) {
    return { skip: paging.skip, take: paging.take };
  }
  return { skip: 0, take: 100 };
}

/**
 * The tree data source (16.3+) expects a UmbTargetPagedModel response with
 * totalBefore/totalAfter. The server returns a simple paged model, so pad
 * the windowed counts (unused by this flat tree).
 */
function toTargetPaged(data: PagedOurTreeItemResponseModel) {
  return {
    items: data.items,
    total: data.total,
    totalBefore: 0,
    totalAfter: 0,
  };
}

/**
 * Data source for the tree - inlined in repository file for simplicity.
 * Uses UmbTreeServerDataSourceBase with function parameters.
 */
class OurTreeDataSource extends UmbTreeServerDataSourceBase<
  OurTreeItemResponseModel,
  OurTreeItemModel
> {
  constructor(host: UmbControllerHost) {
    super(host, {
      getRootItems: async (args: UmbTreeRootItemsRequestArgs) => {
        const { data, ...rest } = await UmbTreeClientService.getRoot({
          query: toOffsetQuery(args.paging),
        });
        return { ...rest, data: data ? toTargetPaged(data) : undefined };
      },
      getChildrenOf: async (args: UmbTreeChildrenOfRequestArgs) => {
        if (args.parent?.unique === null) {
          const { data, ...rest } = await UmbTreeClientService.getRoot({
            query: toOffsetQuery(args.paging),
          });
          return { ...rest, data: data ? toTargetPaged(data) : undefined };
        } else {
          const { data, ...rest } = await UmbTreeClientService.getChildren({
            query: { parent: args.parent.unique },
          });
          return { ...rest, data: data ? toTargetPaged(data) : undefined };
        }
      },
      getAncestorsOf: async (args: UmbTreeAncestorsOfRequestArgs) => {
        return await UmbTreeClientService.getAncestors({
          query: { id: args.treeItem.unique },
        });
      },
      mapper: (item: OurTreeItemResponseModel): OurTreeItemModel => {
        return {
          unique: item.id ?? "",
          parent: { unique: "", entityType: OUR_TREE_ROOT_ENTITY_TYPE },
          name: item.name ?? "unknown",
          entityType: OUR_TREE_ITEM_ENTITY_TYPE,
          hasChildren: item.hasChildren,
          isFolder: false,
          icon: item.icon ?? "icon-bug",
        };
      },
    });
  }
}

export class OurTreeRepository
  extends UmbTreeRepositoryBase<OurTreeItemModel, OurTreeRootModel>
  implements UmbApi
{
  constructor(host: UmbControllerHost) {
    super(host, OurTreeDataSource);
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
