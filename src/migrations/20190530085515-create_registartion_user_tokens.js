import { RegistrationUsersTokens } from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(RegistrationUsersTokens.tableName, RegistrationUsersTokens.attributes);
        await queryInterface.addIndex('registration_users_tokens', ['user_id','user_agent']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(RegistrationUsersTokens.tableName);
    }
};