import { AdminUsersRole } from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(AdminUsersRole.tableName, AdminUsersRole.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(AdminUsersRole.tableName);
    }
};