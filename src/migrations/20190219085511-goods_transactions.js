import { GoodsTransaction } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(GoodsTransaction.tableName, GoodsTransaction.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(GoodsTransaction.tableName);
    }
};