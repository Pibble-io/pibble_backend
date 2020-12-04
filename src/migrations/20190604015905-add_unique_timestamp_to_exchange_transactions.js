module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'exchange_transactions',
            'unique_timestamp',
            {
                type: Sequelize.INTEGER,
                unique: true
            },
        );

        const exchange_transactions = await queryInterface.sequelize.query(
            'SELECT * FROM `exchange_transactions` WHERE unique_timestamp IS NULL',
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
            },
        );

        for (const item of exchange_transactions) {

            await queryInterface.sequelize.query(
                'UPDATE exchange_transactions SET unique_timestamp = :unique_timestamp WHERE id = :id',
                { replacements: { unique_timestamp: item.id, id: item.id } }
            );
        };

        await queryInterface.changeColumn(
            'exchange_transactions',
            'unique_timestamp',
            {
                type: Sequelize.INTEGER,
                allowNull: false
            },
        );

        await queryInterface.addIndex(
            'exchange_transactions',
            ['unique_timestamp', 'from_value', 'user_id', 'from_coin_id', 'to_coin_id'], {
                unique: true,
                name: 'exchange_transactions_composite_index'
            }
        );

    },

    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeIndex('exchange_transactions', 'exchange_transactions_composite_index');
        return queryInterface.removeColumn('exchange_transactions', 'unique_timestamp');
    }
};
