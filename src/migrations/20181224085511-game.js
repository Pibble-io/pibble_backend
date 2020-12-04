import {
    GameObject,
    GameRequest,
    GameApp,
    GameToken
} from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(GameApp.tableName, GameApp.attributes);
        await queryInterface.createTable(GameObject.tableName, GameObject.attributes);
        await queryInterface.createTable(GameRequest.tableName, GameRequest.attributes);
        await queryInterface.createTable(GameToken.tableName, GameToken.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null)
        await queryInterface.dropTable(GameApp.tableName);
        await queryInterface.dropTable(GameObject.tableName);
        await queryInterface.dropTable(GameRequest.tableName);
        await queryInterface.dropTable(GameToken.tableName);
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null)
    }
};