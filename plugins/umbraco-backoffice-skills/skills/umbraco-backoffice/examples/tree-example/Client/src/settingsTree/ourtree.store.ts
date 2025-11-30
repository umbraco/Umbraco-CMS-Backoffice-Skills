import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbUniqueTreeStore } from "@umbraco-cms/backoffice/tree";

export class OurTreeStore extends UmbUniqueTreeStore {
  constructor(host: UmbControllerHost) {
    super(host, OUR_TREE_STORE_CONTEXT.toString());
  }
}

export { OurTreeStore as api };

export const OUR_TREE_STORE_CONTEXT = new UmbContextToken<OurTreeStore>(
  "OUR_TREE_STORE_CONTEXT"
);
