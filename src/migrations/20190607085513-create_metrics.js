import { Metric } from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(Metric.tableName, Metric.attributes);
        await queryInterface.addIndex(Metric.tableName, ['user_id', 'type', 'post_id', 'post_promotion_id', 'created_at']);
        await queryInterface.addIndex(Metric.tableName, ['user_id']);
        await queryInterface.addIndex(Metric.tableName, ['type']);
        await queryInterface.addIndex(Metric.tableName, ['created_at']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(Metric.tableName);
    }
};