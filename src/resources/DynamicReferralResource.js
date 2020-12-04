import Resource from './Resource';
import DynamicUserResource from "./DynamicUserResource";
import { pick } from 'lodash';

export default class DynamicPostResource extends Resource {

    async attachFlagsState(requester) {
        return this.data;
    }

    async build(model, _schema = {}) {
        const schema = _schema.Referral || { fields: [], resources: [] };
        const postData = {
            ...pick(model.dataValues, ['id', ...schema.fields]),
        };

        const keys = [];
        const promises = [];

        if (!schema.fields.length || schema.fields.includes('user')) {
            const userSchema = schema.resources.find(i => i.User) || [];
            keys.push('user');
            promises.push(DynamicUserResource.create(await model.getUsed_by(), userSchema));
        }

        const result = await Promise.all(promises);
        keys.forEach((key, index) => {
            postData[key] = result[index];
        })

        return postData;
    }

}