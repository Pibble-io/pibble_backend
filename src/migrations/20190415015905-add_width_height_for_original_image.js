module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn(
          'media',
          'original_width',
          {
              type: Sequelize.SMALLINT.UNSIGNED,
              allowNull: true,
              after: 'height'
          },
      );
      await queryInterface.addColumn(
        'media',
        'original_height',
        {
            type: Sequelize.SMALLINT.UNSIGNED,
            allowNull: true,
            after: 'original_width'
        },
    );
  },

  down: async function(queryInterface, Sequelize) {
    await queryInterface.removeColumn('media', 'original_width');
    await queryInterface.removeColumn('media', 'original_height');
  }
};
