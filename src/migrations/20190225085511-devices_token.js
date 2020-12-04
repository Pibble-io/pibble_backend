import { DevicesToken } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(DevicesToken.tableName, DevicesToken.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(DevicesToken.tableName);
    }
};