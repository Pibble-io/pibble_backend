import Resource from './Resource';
import { Post, ChatRoom, sequelize } from "../models";
import { pick } from 'lodash';
import DynamicPostResource from './DynamicPostResource';
import ChatRoomResourceCollection from './ChatRoomResourceCollection';


export default class DynamicChatGroupResource extends Resource {

    async attachInteractionStatus(requester, _schema = {}) {
        const schema = _schema.ChatGroup ||  { fields: [], resources: [] };
        this.data.chat_room = await this.getChatRoom(this.data, requester, schema.resources);
        this.data.rooms_count = this.data.chat_room.items.length;
        this.data.last_message = this.getLastMessage(this.data);


        return this.data;
    }

    async build(model, _schema = {}) {
        const schema = _schema.ChatGroup ||  { fields: [], resources: [] };
        const postData = {
            post: await this.getPost(model, schema.resources),
        };

        return {
            ...pick(model.dataValues, ['id', 'owner', 'post_id', 'created_at', 'last_message_created_at', 'unread_message_count', ...schema.fields]),
            ...postData
        };

    }


    async getPost(model, _schema = []) {
        const postSchema = _schema.find(i => i.Post) || [];
        const post = await Post.scope('withSales').findOne({ where: { id: model.post_id }, paranoid: false });
        let postResource = null;
        if (post) {
            postResource = await DynamicPostResource.create(post, postSchema);
        }

        return await postResource;
    }

    getLastMessage(group) {
        //Don`t know how add last_message in one query
        let last_message;
        group.chat_room.items.map((room) => {
            if (!last_message) {
                last_message = room.last_message
            } else {
                if (room.last_message && new Date(last_message.data.created_at) > new Date(room.last_message.created_at)) {
                    last_message = room.last_message;
                }
            }
        });
        return last_message;
    }

    async getChatRoom(group_model, user, _schema) {
        const chatRoomSchema = _schema.find(i => i.ChatRoom) || [];
        const rooms = await ChatRoom.scope([
            { method: ['withChatSettings', user.id] },
            { method: ['withUnreadMessagesCount', user.id] },
            { method: ['whereIamMember', user.id] },
            'withGroup',
        ]).findAll({
            where: {
                group_id: group_model.id
            },
            order: [
                [sequelize.literal('unread_message_count'), 'desc'],
                [sequelize.literal('last_message_created_at'), 'desc'],
                [sequelize.literal('created_at'), 'desc']
            ]
        })
        const roomsCollection = await ChatRoomResourceCollection.create(rooms, null, chatRoomSchema);
        return await roomsCollection.attachInteractionStatus(user)
    }
}