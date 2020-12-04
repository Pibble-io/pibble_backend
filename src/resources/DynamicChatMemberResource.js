import Resource from './Resource';
import DynamicUserResource from './DynamicUserResource';
import { pick } from 'lodash';



export default class DynamicChatMemberResource extends Resource {

    async build(model, _schema = {}) {
        const schema = _schema.ChatMember ||  { fields: [], resources: [] };
        const user = await this.getMemberUser(model, schema.resources);

        const data = {
            ...user.data
        };

        return {
            ...pick(model, ['chat_room_id', 'user_id', 'deleted_at', ...schema.fields]),
            ...{ user: { ...data } }
        };
    }

    async getMemberUser(model, _schema = []) {
        const userSchema = _schema.find(i => i.User) || [];
        return await (model.user && DynamicUserResource.create(model.user, userSchema));
    }
}