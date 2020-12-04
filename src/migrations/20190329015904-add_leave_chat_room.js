module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
          'chat_room_users',
          'deleted_at',
          {
              type: Sequelize.DATE,
              allowNull: true,
              validate: {
              }
          }
      );
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('chat_room_users', 'deleted_at');
  }
};
