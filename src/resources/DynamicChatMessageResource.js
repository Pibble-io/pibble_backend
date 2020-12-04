import Resource from './Resource';
import { ChatMessageStatus, Post, ChatRoomUser, User, sequelize } from "../models";
import DynamicPostResource from '../resources/DynamicPostResource';
import { pick } from 'lodash';
import DynamicUserResource from './DynamicUserResource';

export default class DynamicChatMessageResource extends Resource {

    async attachInteractionStatus(requester, _schema = {}) {
        
        const schema = _schema.ChatMessage || { fields: [], resources: [] };

        const userSchema = schema.resources.find(i => i.User) || [];
        this.data.from_user.attachInteractionStatus(requester, userSchema);

        this.data.from_user.data.unread_message_count = await ChatMessageStatus.getUnreadMessageCount(this.data.room_id, requester.id);

        if (this.data.type === 'goods') {
            let roomMembers;
            if (!roomMembers) {
                roomMembers = await this.getRoomMembersIds(this.data);
            }
            await this.data.message.attachFlagsState(requester);
            await this.data.message.attachRoomInvoices(roomMembers);
        }

        return this.data;
    }

    async build(model, _schema = {}) {
        const schema = _schema.ChatMessage || { fields: [], resources: [] };
        const postData = {
            ...pick(model.dataValues, ['id', 'type', 'message', 'room_id', 'created_at', 'updated_at', 'chat_message_statuses', ...schema.fields]),
            from_user: await this.getFromUser(model, schema.resources)
        };

        if (model.type === 'goods') {
            postData.message = await this.getPost(model.message, schema.resources);
        }
        postData.to_user = null;
        if (model.type === 'system' && model.message.to_user_id) {
            postData.to_user = await this.getToUser(model.message.to_user_id, schema.resources);
        }

        return postData;
    }

    async getFromUser(model, _schema) {
        const userSchema = _schema.find(i => i.User) || [];
        const user = await model.getUser();
        return await (user && DynamicUserResource.create(user, userSchema));
    }

    async getToUser(user_id, _schema) {
        const userSchema = _schema.find(i => i.User) || [];
        const user = await User.findById(user_id);
        return await (user && DynamicUserResource.create(user, userSchema));
    }

    async getPost(message, _schema) {
        const postSchema = _schema.find(i => i.Post) || [];
        const post = await Post.unscoped().findById(message.post_id,{ paranoid: false});
        const postResource = await DynamicPostResource.create(post, postSchema);

        return await postResource;
    }

    async getRoomMembersIds(model) {
        const members = await ChatRoomUser.findAll({
            attributes: ['user_id'],
            where: {
                chat_room_id: model.room_id
            }
        });
        const members_ids = members.map(user => user.user_id);
        return members_ids;
    }

}