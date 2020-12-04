'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('coins', 'withdrawal_fee', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0
    });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.removeColumn('coins', 'withdrawal_fee');
  }
};