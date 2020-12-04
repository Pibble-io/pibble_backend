module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('balances', ['user_id', 'coin_id'], {
            unique: true,
            name: 'balances_composite_index'
        });
        await queryInterface.bulkInsert('coins', [{
            name: 'Bitcoin',
            symbol: 'BTC',
            public_status: false
        }]);
    },

    down: async (queryInterface, Sequelize) => {
        const [ { constraintName: usersConstraint } ] = await queryInterface.getForeignKeyReferencesForTable('balances', 'users');
        await queryInterface.removeConstraint('balances', usersConstraint);
        const [ { constraintName: coinsConstraint } ] = await queryInterface.getForeignKeyReferencesForTable('balances', 'coins');
        await queryInterface.removeConstraint('balances', coinsConstraint);
        await queryInterface.removeIndex('balances', 'balances_composite_index');
        await queryInterface.changeColumn('balances', 'user_id', {
            type: Sequelize.INTEGER,
            foreignKey: true,
            references: {
                model: 'users',
                key: 'id'
            },
            allowNull: true,
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });
        await queryInterface.changeColumn('balances', 'coin_id', {
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
        await queryInterface.bulkDelete('coins', {
            name: 'Bitcoin',
            symbol: 'BTC',
            public_status: false
        });
    }
};
