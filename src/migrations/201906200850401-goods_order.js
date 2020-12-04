import { GoodsOrder } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(GoodsOrder.tableName, GoodsOrder.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(GoodsOrder.tableName);
    }
};