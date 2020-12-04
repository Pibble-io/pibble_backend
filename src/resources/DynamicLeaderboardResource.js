import Resource from './Resource';
import DynamicUserResource from "./DynamicUserResource";
import { pick } from 'lodash';

export default class DynamicLeaderboardResource extends Resource {

    async attachAdditionalData(requester) {
        return this;
    }

    async build(model, _schema = {}) {
        const schema = _schema.Feeds || { fields: [], resources: [] };
        const userSchema = schema.resources.find(i => i.User) || [];
        const userModel = await model.getUser({ paranoid: false });
        const user = userModel ? await DynamicUserResource.create(userModel, userSchema) : null;

        return {
            ...pick(model.dataValues, ['id', 'value', ...schema]),
            user
        };
    }

}