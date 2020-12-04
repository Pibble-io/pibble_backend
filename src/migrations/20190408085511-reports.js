import { Reports } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(Reports.tableName, Reports.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(Reports.tableName);
    }
};