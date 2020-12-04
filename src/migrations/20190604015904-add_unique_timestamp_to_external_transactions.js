module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'external_transactions',
            'unique_timestamp',
            {
                type: Sequelize.INTEGER,
            },
        );

        const external_transactions = await queryInterface.sequelize.query(
            'SELECT * FROM `external_transactions` WHERE unique_timestamp IS NULL',
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
            },
        );

        for (const item of external_transactions) {

            await queryInterface.sequelize.query(
                'UPDATE external_transactions SET unique_timestamp = :unique_timestamp WHERE id = :id',
                { replacements: { unique_timestamp: item.id, id: item.id } }
            );
        };

        await queryInterface.changeColumn(
            'external_transactions',
            'unique_timestamp',
            {
                type: Sequelize.INTEGER,
                allowNull: false
            },
        );

        await queryInterface.addIndex(
            'external_transactions',
            ['unique_timestamp', 'from_address', 'to_address', 'user_id', 'coin_id', 'value'], {
                unique: true,
                name: 'external_transactions_composite_index'
            }
        );

    },

    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeIndex('external_transactions', 'external_transactions_composite_index');
        return queryInterface.removeColumn('external_transactions', 'unique_timestamp');
    }
};
