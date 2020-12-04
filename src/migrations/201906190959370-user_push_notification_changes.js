module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'users_settings',
            'allow_push_notification_account_username_changed',
            {
                type: Sequelize.ENUM(['off', 'friends_and_following']),
                defaultValue: 'friends_and_following'
            },
        );

        await queryInterface.addColumn(
            'users_settings',
            'allow_push_notification_new_charity_funding',
            {
                type: Sequelize.ENUM(['off', 'friends_and_following', 'everyone']),
                defaultValue: 'friends_and_following'
            },
        );
    },

    down: async function (queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'users_settings',
            'allow_push_notification_account_username_changed',
            {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
        );
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_new_charity_funding');
    }
};
