import { AdminUsersTokens } from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(AdminUsersTokens.tableName, AdminUsersTokens.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(AdminUsersTokens.tableName);
    }
};