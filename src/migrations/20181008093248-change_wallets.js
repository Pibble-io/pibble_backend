module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('wallets', ['user_id', 'coin_id'], {
            unique: true,
            name: 'wallets_composite_index'
        });
        await queryInterface.removeIndex('wallets', 'PRIMARY');
        await queryInterface.changeColumn('wallets', 'private_key', {
            type: Sequelize.CHAR(66),
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('wallets', 'private_key', {
            type: Sequelize.CHAR(66),
            allowNull: false
        });
        await queryInterface.removeIndex('wallets', 'wallets_composite_index');
    }
};
