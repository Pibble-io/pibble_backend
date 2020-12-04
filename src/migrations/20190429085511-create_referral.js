import { Referral } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(Referral.tableName, Referral.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(Referral.tableName);
    }
};