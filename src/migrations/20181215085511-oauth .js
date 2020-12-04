import {
    OAuthAccessToken,
    OAuthAuthorizationCode,
    OAuthClient,
    OAuthRefreshToken,
    OAuthScope,
} from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(OAuthClient.tableName, OAuthClient.attributes);
        await queryInterface.createTable(OAuthAccessToken.tableName, OAuthAccessToken.attributes);
        await queryInterface.createTable(OAuthAuthorizationCode.tableName, OAuthAuthorizationCode.attributes);
        await queryInterface.createTable(OAuthRefreshToken.tableName, OAuthRefreshToken.attributes);
        await queryInterface.createTable(OAuthScope.tableName, OAuthScope.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(OAuthAccessToken.tableName);
        await queryInterface.dropTable(OAuthAuthorizationCode.tableName);
        await queryInterface.dropTable(OAuthClient.tableName);
        await queryInterface.dropTable(OAuthRefreshToken.tableName);
        await queryInterface.dropTable(OAuthScope.tableName);
    }
};