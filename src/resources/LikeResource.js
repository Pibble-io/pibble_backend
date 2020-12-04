import Resource from './Resource';
import UserResource from "./UserResource";
import { pick } from 'lodash';

export default class LikeResource extends Resource {

    async attachFlagsState(requester) {
        this.data.user = await this.data.user.attachInteractionStatus(requester);

        return this.data;
    }

    async build(model, schema = []) {
        const user = await UserResource.create( await model.getUser());

        return {
            ...pick(model.dataValues, ['id', 'amount', 'created_at', ...schema]),
            user
        };
    }
}