import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { UmbBooleanState, UmbStringState } from "@umbraco-cms/backoffice/observable-api";

import { TimeManagementRepository } from "../repository/time.repository.js";

export class TimeManagementContext extends UmbControllerBase {

    #repository: TimeManagementRepository;

    #time = new UmbStringState("unknown");
    public readonly time = this.#time.asObservable();

    #date = new UmbStringState("unknown");
    public readonly date = this.#date.asObservable();

    constructor(host: UmbControllerHost) {
        super(host);

        this.provideContext(TIME_MANAGEMENT_CONTEXT_TOKEN, this);
        this.#repository = new TimeManagementRepository(this);
    }

    async getTime() {
        const {data} = await this.#repository.getTime();

        if (data) {
            this.#time.setValue(data);
        }
    }

    async getDate() {
        const {data} = await this.#repository.getDate();

        if (data) {
            this.#date.setValue(data);
        }
    }

    async getDateAndTime() {
        this.getTime();
        this.getDate();
    }

    #intervalId: number | null = null;

    #polling = new UmbBooleanState(false);
    polling = this.#polling.asObservable();

    togglePolling() {
        const isEnabled = !this.#polling.getValue();
        this.#polling.setValue(isEnabled);

        if (isEnabled) {
            this.#intervalId = setInterval(() => {
                this.getDateAndTime();
            }, 750) as unknown as number;
            return;
        }

        clearInterval(this.#intervalId as number);
    }

}

export default TimeManagementContext;

export const TIME_MANAGEMENT_CONTEXT_TOKEN =
    new UmbContextToken<TimeManagementContext>(TimeManagementContext.name);

export const api = TimeManagementContext;
