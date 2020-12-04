import {
    History,
} from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(History.tableName, History.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(History.tableName)
    }
};