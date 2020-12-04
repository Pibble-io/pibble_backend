module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'users',
      'closed_at',
      {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
    );

    queryInterface.addIndex('users', ['closed_at']);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'closed_at');
  }
};
