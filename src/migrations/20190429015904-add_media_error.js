module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'media',
      'error',
      {
        type: Sequelize.ENUM(['S3_error']),
        allowNull: true,
        defaultValue: null,
        after: 'processed'
      },
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('media', 'error');
  }
};
