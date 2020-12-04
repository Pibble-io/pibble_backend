import { CommerceTransaction } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(CommerceTransaction.tableName, CommerceTransaction.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(CommerceTransaction.tableName);
    }
};