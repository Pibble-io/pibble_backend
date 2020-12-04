import {
    GameAsset,
    AssetTransaction
} from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(GameAsset.tableName, GameAsset.attributes);
        await queryInterface.addIndex('game_assets', ['symbol', 'game_app_id'], {
            unique: true,
            name: 'asset_composite_index'
        });

        await queryInterface.createTable(AssetTransaction.tableName, AssetTransaction.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null)
        // await queryInterface.removeIndex('game_assets', 'asset_composite_index');
        await queryInterface.dropTable(GameAsset.tableName);
        await queryInterface.dropTable(AssetTransaction.tableName);
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null)
    }
};