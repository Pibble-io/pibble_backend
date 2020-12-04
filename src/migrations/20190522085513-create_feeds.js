import { Feeds } from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(Feeds.tableName, Feeds.attributes);
        await queryInterface.addIndex(Feeds.tableName, ['emitter_id', 'entity_type', 'entity_id', 'target_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(Feeds.tableName);
    }
};