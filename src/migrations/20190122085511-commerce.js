import { Commerce } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(Commerce.tableName, Commerce.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(Commerce.tableName);
    }
};