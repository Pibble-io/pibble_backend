import ResourceCollection from './ResourceCollection';
import DynamicPostResource from './DynamicPostResource';

export default class DynamicPostResourceCollection extends ResourceCollection {

    itemResource = DynamicPostResource;
    tempData = { // some kind of cache
        users: []
    };

    static async create(items, pagination = null, schema = [], invalidate = false, data = {}) {
        const instance = new this();

        if (!instance.itemResource) {
            throw new Error('Resource of collection is not defined');
        }

        instance.items = await Promise.all(
            items.map(
                item => instance.itemResource.create(item, schema, invalidate, data, instance.tempData)
            )
        );
        instance.pagination = pagination;
        delete instance.tempData;

        return instance;
    }

    async attachFlagsState (requester, schema) {
        this.items = await Promise.all(this.items.map( async function ( item ) {
            return await item.attachFlagsState(requester, schema);
        }));

        return this;
    }

}