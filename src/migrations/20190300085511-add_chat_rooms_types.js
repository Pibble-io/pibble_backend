import { ChatRoom } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0")
        await queryInterface.dropTable(ChatRoom.tableName, {

            force: true,
            cascade: false,

        });
        await queryInterface.createTable(ChatRoom.tableName, ChatRoom.attributes);
        await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1")
    },

    down: (queryInterface, Sequelize) => {
        queryInterface.removeColumn('chat_rooms', 'type');
        queryInterface.removeColumn('chat_rooms', 'post_id');
    }

};
