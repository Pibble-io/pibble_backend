import {
    Campaign,
} from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(Campaign.tableName, Campaign.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(Campaign.tableName)
    }
};