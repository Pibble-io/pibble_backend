module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
          'commerces',
          'is_downloadable',
          {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: true,
              after:'is_exclusive'
          },
      );
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('commerces', 'is_downloadable');
  }
};
