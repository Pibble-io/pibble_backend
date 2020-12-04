import { FeedSettings } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(FeedSettings.tableName, FeedSettings.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(FeedSettings.tableName);
    }
};