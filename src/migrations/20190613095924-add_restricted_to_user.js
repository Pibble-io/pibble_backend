module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'users',
            'restricted_wallet',
            {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: 0
            },
        );

        await queryInterface.addColumn(
            'users',
            'restricted_post',
            {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: 0
            },
        );

        await queryInterface.addIndex('users', ['restricted_wallet']);
        await queryInterface.addIndex('users', ['restricted_post']);
    },

    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'restricted_wallet');
        await queryInterface.removeColumn('users', 'restricted_post');
    }
};
