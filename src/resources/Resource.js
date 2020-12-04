import { pick } from 'lodash';

export default class Resource {

    data = {};

    static async create(model, schema = [], invalidate = false, data = {}) {
        const instance = new this;
        instance.data = await instance.build(model, schema, invalidate, data);
        return instance;
    }

    build() {
        throw new Error('You should overwrite this method in child');
    }

    toJSON() {
        return this.data;
    }
}
