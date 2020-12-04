module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users_settings', 'allow_push_notification_profile_updated', {
      type: Sequelize.ENUM(['off', 'friends_and_following']),
      defaultValue: 'friends_and_following'
    })
    await queryInterface.changeColumn('users_settings', 'allow_push_notification_created_post', {
      type: Sequelize.ENUM(['off', 'friends_and_following']),
      defaultValue: 'friends_and_following'
    })
    await queryInterface.changeColumn('users_settings', 'allow_push_notification_profile_level_up', {
      type: Sequelize.ENUM(['off', 'friends_and_following']),
      defaultValue: 'friends_and_following'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users_settings', 'allow_push_notification_profile_updated', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    })
    await queryInterface.changeColumn('users_settings', 'allow_push_notification_created_post', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    })
    await queryInterface.changeColumn('users_settings', 'allow_push_notification_profile_level_up', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    })
  }
};
