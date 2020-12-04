'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('external_transactions', 'fee', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('external_transactions', 'fee');
  }
};
