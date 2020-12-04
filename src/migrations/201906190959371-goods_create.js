import { Good } from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(Good.tableName, Good.attributes);
        await queryInterface.addIndex(Good.tableName, ['post_id'], {
            unique: true,
            name: 'unique_goods'
        });
        await queryInterface.addIndex(Good.tableName, ['uuid']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(Good.tableName);
    }
};