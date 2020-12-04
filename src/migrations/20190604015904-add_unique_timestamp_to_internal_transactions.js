module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'internal_transactions',
            'unique_timestamp',
            {
                type: Sequelize.INTEGER,
            },
        );

        const internal_transactions = await queryInterface.sequelize.query(
            'SELECT * FROM `internal_transactions` WHERE unique_timestamp IS NULL',
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
            },
        );

        for (const item of internal_transactions) {

            await queryInterface.sequelize.query(
                'UPDATE internal_transactions SET unique_timestamp = :unique_timestamp WHERE id = :id',
                { replacements: { unique_timestamp: item.id, id: item.id } }
            );
        };

        await queryInterface.changeColumn(
            'internal_transactions',
            'unique_timestamp',
            {
                type: Sequelize.INTEGER,
                allowNull: false
            },
        );

        await queryInterface.addIndex(
            'internal_transactions',
            ['unique_timestamp', 'coin_id', 'from_user_id', 'to_user_id', 'value'], {
                unique: true,
                name: 'internal_transactions_composite_index'
            }
        );

    },

    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeIndex('internal_transactions', 'internal_transactions_composite_index');
        return queryInterface.removeColumn('internal_transactions', 'unique_timestamp');
    }
};
