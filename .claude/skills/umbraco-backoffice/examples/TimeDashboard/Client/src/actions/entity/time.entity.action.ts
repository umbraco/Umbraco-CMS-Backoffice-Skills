import { UmbControllerHostElement } from "@umbraco-cms/backoffice/controller-api";
import { UmbDocumentItemRepository } from "@umbraco-cms/backoffice/document";
import { UmbEntityActionArgs, UmbEntityActionBase } from "@umbraco-cms/backoffice/entity-action";
import { UMB_NOTIFICATION_CONTEXT, UmbNotificationContext } from "@umbraco-cms/backoffice/notification";

export class TimeEntityAction extends UmbEntityActionBase<UmbDocumentItemRepository> {
    #notificationContext?: UmbNotificationContext;

    constructor(host: UmbControllerHostElement, args: UmbEntityActionArgs<UmbDocumentItemRepository>) {
        super(host, args)

        this.consumeContext(UMB_NOTIFICATION_CONTEXT, (instance) => {
            this.#notificationContext = instance;
        });
    }

    async execute() {
        this.#notificationContext?.peek('warning', {
            data: {
                headline: 'A thing has happened !',
                message: 'What that thing is? only time will tell.'
            }
        });
    }

}
