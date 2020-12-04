import { AdminRole } from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(AdminRole.tableName, AdminRole.attributes);
        await queryInterface.bulkInsert('admin_roles', [
            {title: 'Super Admin',name:'super_admin'},
            {title: 'Admin',name:'admin'},
            {title: 'Content Manager',name:'content_manager'},
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(AdminUsers.tableName);
    }
};