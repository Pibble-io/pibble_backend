module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
          'users_profiles',
          'referral',
          {
              type: Sequelize.STRING,
              unique: true
          },
      );
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('commerces', 'is_downloadable');
  }
};
