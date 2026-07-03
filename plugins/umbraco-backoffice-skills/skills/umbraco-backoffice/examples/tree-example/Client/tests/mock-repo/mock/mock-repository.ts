import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import type { UmbApi } from '@umbraco-cms/backoffice/extension-api';
import {
  UmbTreeRepositoryBase,
  type UmbTreeChildrenOfRequestArgs,
  type UmbTreeRootItemsRequestArgs,
} from '@umbraco-cms/backoffice/tree';

// Import from original src files
import {
  OUR_TREE_ROOT_ENTITY_TYPE,
  OUR_TREE_ITEM_ENTITY_TYPE,
  type OurTreeItemModel,
  type OurTreeRootModel,
} from '../../../src/settingsTree/types.js';

// Import mock data
import { rootItems, childrenByParent, type MockTreeItem } from './mock-data.js';

/**
 * Mock data source that returns mock data directly without API calls.
 */
class MockTreeDataSource {
  constructor(_host: UmbControllerHost) {
    // Host not needed for mock data source
  }

  async getRootItems(args: UmbTreeRootItemsRequestArgs) {
    const paging = args.paging;
    const skip = paging && 'skip' in paging ? paging.skip : 0;
    const take = paging && 'skip' in paging ? paging.take : 100;
    const items = rootItems.slice(skip, skip + take);
    return {
      data: {
        total: rootItems.length,
        totalBefore: 0,
        totalAfter: 0,
        items: this.#mapItems(items),
      },
    };
  }

  async getChildrenOf(args: UmbTreeChildrenOfRequestArgs) {
    if (!args.parent?.unique) {
      return this.getRootItems({});
    }
    const children = childrenByParent[args.parent.unique] || [];
    return {
      data: {
        total: children.length,
        totalBefore: 0,
        totalAfter: 0,
        items: this.#mapItems(children),
      },
    };
  }

  async getAncestorsOf() {
    return { data: [] };
  }

  #mapItems(items: MockTreeItem[]): OurTreeItemModel[] {
    return items.map((item) => ({
      unique: item.id,
      parent: { unique: null, entityType: OUR_TREE_ROOT_ENTITY_TYPE },
      name: item.name,
      entityType: OUR_TREE_ITEM_ENTITY_TYPE,
      hasChildren: item.hasChildren,
      isFolder: false,
      icon: item.icon,
    }));
  }
}

/**
 * Mock repository that uses mock data instead of API calls.
 * This replaces the original OurTreeRepository when running in mock mode.
 */
export class MockTreeRepository
  extends UmbTreeRepositoryBase<OurTreeItemModel, OurTreeRootModel>
  implements UmbApi
{
  constructor(host: UmbControllerHost) {
    super(host, MockTreeDataSource);
  }

  async requestTreeRoot() {
    const data: OurTreeRootModel = {
      unique: null,
      entityType: OUR_TREE_ROOT_ENTITY_TYPE,
      name: 'Our Tree Root',
      icon: 'icon-star',
      hasChildren: true,
      isFolder: true,
    };

    return { data };
  }
}

export { MockTreeRepository as api };
