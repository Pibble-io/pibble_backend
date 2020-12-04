import { BlockReports } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(BlockReports.tableName, BlockReports.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(BlockReports.tableName);
    }
};