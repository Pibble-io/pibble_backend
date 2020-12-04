import { ChatRoomSettings } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(ChatRoomSettings.tableName, ChatRoomSettings.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(ChatRoomSettings.tableName);
    }
};