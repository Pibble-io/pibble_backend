import {
    Setting,
} from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(Setting.tableName, Setting.attributes);
    },


    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(Setting.tableName)
    }
};