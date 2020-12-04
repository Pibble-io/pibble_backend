import { ChatMessage, ChatRoom, ChatRoomUser, ChatMessageStatus } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(ChatRoom.tableName, ChatRoom.attributes);
        await queryInterface.createTable(ChatMessage.tableName, ChatMessage.attributes);
        await queryInterface.createTable(ChatRoomUser.tableName, ChatRoomUser.attributes);
        await queryInterface.createTable(ChatMessageStatus.tableName, ChatMessageStatus.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(ChatRoom.tableName);
        await queryInterface.dropTable(ChatMessage.tableName);
        await queryInterface.dropTable(ChatRoomUser.tableName);
        await queryInterface.dropTable(ChatMessageStatus.tableName);
    }
};