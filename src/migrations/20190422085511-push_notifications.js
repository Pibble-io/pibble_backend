import { PushNotifications, PushNotificationRecipients } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(PushNotifications.tableName, PushNotifications.attributes);
        await queryInterface.createTable(PushNotificationRecipients.tableName, PushNotificationRecipients.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(PushNotifications.tableName);
        await queryInterface.dropTable(PushNotificationRecipients.tableName);
    }
};