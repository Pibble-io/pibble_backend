import { PostPromotion } from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(PostPromotion.tableName, PostPromotion.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(PostPromotion.tableName);
    }
};