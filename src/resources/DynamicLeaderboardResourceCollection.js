import ResourceCollection from './ResourceCollection'
import DynamicLeaderboardResource from "./DynamicLeaderboardResource";

export default class DynamicLeaderboardResourceCollection extends ResourceCollection {

    itemResource = DynamicLeaderboardResource;

    async attachAdditionalData(requester, schema = {}) {
        this.items = await Promise.all(this.items.map(async function (item) {
            return await item.attachAdditionalData(requester, schema);
        }));

        return this;
    }

}