import { AdminUser } from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let atts = {};
        Object.keys(AdminUser.attributes).map(attr => { return (AdminUser.attributes[attr].type instanceof Sequelize.VIRTUAL) === false ? atts[attr] = AdminUser.attributes[attr] : null })
        await queryInterface.createTable(AdminUser.tableName, atts);
        await queryInterface.addIndex(AdminUser.tableName, ['email']);
        await queryInterface.addIndex(AdminUser.tableName, ['username']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(AdminUser.tableName);
    }
};