import {
   GoodsRate
} from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(GoodsRate.tableName, GoodsRate.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(GoodsRate.tableName);
    }
};