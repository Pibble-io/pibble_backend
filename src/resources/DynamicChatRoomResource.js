import Resource from './Resource';
import { ChatMessage, ChatMessageStatus, ChatRoomUser, ChatRoomGroup, User, Post, sequelize } from "../models";
import { pick } from 'lodash';
import DynamicChatMessageResource from './DynamicChatMessageResource';
import DynamicPostResource from './DynamicPostResource';
import ChatMemberResourceCollection from './ChatMemberResourceCollection';


export default class DynamicChatRoomResource extends Resource {

    async attachInteractionStatus(requester, _schema = {}) {
        const schema = _schema.ChatRoom || { fields: [], resources: [] };

        this.data.muted = !!this.data.muted;
        this.data.left = !!this.data.left;

        this.data.unread_message_count = await ChatMessageStatus.getUnreadMessageCount(this.data.id, requester.id);
        const messageSchema = schema.resources.find(i => i.ChatMessage) || [];
        this.data.last_message && await this.data.last_message.attachInteractionStatus(requester, messageSchema);
        this.data.post = this.data.post && await this.data.post.attachFlagsState(requester);

        return this.data;
    }

    async build(model, _schema = {}) {
        const schema = _schema.ChatRoom || { fields: [], resources: [] };
        const roomData = {};

        if (!schema.fields.length || schema.fields.includes('last_message')) {
            roomData.last_message = await this.getLastMessage(model, schema.resources)
        }

        if (!schema.fields.length || schema.fields.includes('members')) {
            const members = await this.getMembers(model, schema.resources);
            roomData.members = members.items
        }

        if (!schema.fields.length || schema.fields.includes('post')) {
            roomData.post = await this.getPost(model, schema.resources)
        }

        if (!schema.fields.length || schema.fields.includes('goods_order')) {
            roomData.goods_order = await model.getGoods_order()
        }

        if (!schema.fields.length || schema.fields.includes('group')) {
            roomData.group = await this.getGroup(model)
        }

        return {
            ...pick(model.dataValues, ['id', 'title', 'type', 'post_id', 'members', 'last_message', 'unread_message_count', 'group', 'muted', 'left', ...schema]),
            ...roomData
        };

    }

    async getPost(model, _schema) {
        const postSchema = _schema.find(i => i.Post) || [];
        if (model.group) {
            const post = await Post.scope('withSales').findOne({ where: { id: model.group.post_id }, paranoid: false });
            if (post) {
                const postResource = await DynamicPostResource.create(post, postSchema);
                // await postResource.attachRoomInvoices(members.items.map(user => user.data.user_id));
                return postResource;
            }
        }
        return null;
    }

    async getGroup(model) {
        const group = await ChatRoomGroup.findById(model.group_id);
        return group;
    }

    async getMembers(model, _schema) {
        const membersSchema = _schema.find(i => i.ChatMember) || [];
        const members = await ChatRoomUser.findAll({
            where: {
                chat_room_id: model.id
            },
            include: [
                { model: User, as: 'user' }
            ],
            paranoid: false
        });

        const membersCollection = await ChatMemberResourceCollection.create(members, null, membersSchema);
        return membersCollection;
    }

    async getLastMessage(model, _schema) {
        const messageSchema = _schema.find(i => i.ChatMessage) || [];
        const last_message = await ChatMessage.getLastMessage(model.id)
        return await (last_message && DynamicChatMessageResource.create(last_message, messageSchema));
    }

}