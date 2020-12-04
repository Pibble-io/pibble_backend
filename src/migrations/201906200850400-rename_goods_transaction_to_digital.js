import { InappropriateReport } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.renameTable('goods_transactions', 'digital_goods_transactions');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.renameTable('digital_goods_transactions', 'goods_transactions');
    }
};
