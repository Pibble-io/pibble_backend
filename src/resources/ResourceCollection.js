import { pick } from "lodash";

export default class ResourceCollection {

    itemResource = null;

    static async create(items, pagination = null, schema = [], invalidate = false, data = {}) {
        const instance = new this();

        if (!instance.itemResource) {
            throw new Error('Resource of collection is not defined')
        }

        instance.items = await Promise.all(items.map(item => instance.itemResource.create(item, schema, invalidate, data)));
        instance.pagination = pagination;

        return instance;
    }
}