import { LeaderBoard } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(LeaderBoard.tableName, LeaderBoard.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(LeaderBoard.tableName);
    }
};