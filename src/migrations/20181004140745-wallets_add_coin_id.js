module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('wallets', 'coin_id', {
            type: Sequelize.INTEGER,
            foreignKey: true,
            references: {
                model: 'coins',
                key: 'id'
            },
            allowNull: true,
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });
        const [ { id } ] = await queryInterface.sequelize.query(
            'SELECT `id` FROM `coins` WHERE `symbol` LIKE "ETH"',
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        console.log(id);
        await queryInterface.sequelize.query('UPDATE wallets SET coin_id = :id', { replacements: { id } });
    },
    down: (queryInterface, Sequelize) => queryInterface.removeColumn('wallets', 'coin_id')
};