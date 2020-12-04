import { RegistrationPhoneConfirmation } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(RegistrationPhoneConfirmation.tableName, RegistrationPhoneConfirmation.attributes);
        await queryInterface.addIndex('registration_phone_confirmations', ['code']);
        await queryInterface.addIndex('registration_phone_confirmations', ['user_id']);
        await queryInterface.addIndex('registration_phone_confirmations', ['expire_at']);
        await queryInterface.addIndex('registration_phone_confirmations', ['is_checked']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(RegistrationPhoneConfirmation.tableName);
    }
};