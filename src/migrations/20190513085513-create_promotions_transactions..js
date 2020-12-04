import { PostPromotionTransaction } from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(PostPromotionTransaction.tableName, PostPromotionTransaction.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(PostPromotionTransaction.tableName);
    }
};