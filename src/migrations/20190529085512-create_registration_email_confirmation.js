import { RegistrationEmailConfirmation } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(RegistrationEmailConfirmation.tableName, RegistrationEmailConfirmation.attributes);
        await queryInterface.addIndex('registration_email_confirmations', ['code']);
        await queryInterface.addIndex('registration_email_confirmations', ['user_id']);
        await queryInterface.addIndex('registration_email_confirmations', ['expire_at']);
        await queryInterface.addIndex('registration_email_confirmations', ['is_checked']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(RegistrationEmailConfirmation.tableName);
    }
};