import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { TimeManagementDataSource } from "./sources/time.datasource.js";

export class TimeManagementRepository extends UmbControllerBase {
    #timeDataSource: TimeManagementDataSource;

    constructor(host: UmbControllerHost) {
        super(host);
        this.#timeDataSource = new TimeManagementDataSource();

        console.log('repository constructor');
    }

    async getTime() {
        return this.#timeDataSource.getTime();
    }

    async getDate() {
        return this.#timeDataSource.getDate();
    }
}
