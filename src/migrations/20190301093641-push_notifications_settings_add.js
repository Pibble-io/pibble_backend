module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users_settings', 'allow_push_notification_upvoted_post', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_upvoted_comment', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_commented', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_followed', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_created_post', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_created_first_post', {
            type: Sequelize.ENUM(['off', 'friends_and_following', 'everyone']),
            defaultValue: 'friends_and_following'
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_created_digital_post', {
            type: Sequelize.ENUM(['off', 'friends_and_following', 'everyone']),
            defaultValue: 'friends_and_following'
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_created_shop_post', {
            type: Sequelize.ENUM(['off', 'friends_and_following', 'everyone']),
            defaultValue: 'friends_and_following'
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_new_follower', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_friend_request_arrived', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_friend_request_accepted', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_profile_updated', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_profile_level_up', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_chat_new_message', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_chat_new_feedback', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_new_promotion', {
            type: Sequelize.ENUM(['off', 'friends_and_following', 'everyone']),
            defaultValue: 'friends_and_following'
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_new_funding', {
            type: Sequelize.ENUM(['off', 'friends_and_following', 'everyone']),
            defaultValue: 'friends_and_following'
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_funding_contributed', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_promotion_joined', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_wallet_pincode_changed', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_wallet_deposit', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_wallet_withdraw', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_account_password_changed', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('users_settings', 'allow_push_notification_account_username_changed', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_upvoted_post');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_upvoted_comment');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_commented');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_followed');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_created_post');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_created_first_post');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_created_digital_post');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_created_shop_post');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_new_follower');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_friend_request_arrived');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_friend_request_accepted');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_profile_updated');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_profile_level_up');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_chat_new_message');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_chat_new_feedback');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_new_promotion');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_new_funding');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_funding_contributed');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_promotion_joined');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_wallet_pincode_changed');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_wallet_deposit');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_wallet_withdraw');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_account_password_changed');
        await queryInterface.removeColumn('users_settings', 'allow_push_notification_account_username_changed');
    }
};