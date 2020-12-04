module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'users',
            'is_banned',
            {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: 0
            },
        );

        await queryInterface.addIndex('users', ['is_banned']);


        await queryInterface.sequelize.query('UPDATE `users` SET `is_banned`=1 WHERE `deleted_at` IS NOT NULL;');
    },

    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'is_banned');
    }
};
