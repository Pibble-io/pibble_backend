import ResourceCollection from './ResourceCollection'
import DynamicFeedsResource from "./DynamicFeedsResource";

export default class DynamicFeedsResourceCollection extends ResourceCollection {

    itemResource = DynamicFeedsResource;

    async attachAdditionalData(requester, schema = {}) {
        this.items = await Promise.all(this.items.map(async function (item) {
            return await item.attachAdditionalData(requester, schema);
        }));

        return this;
    }

}