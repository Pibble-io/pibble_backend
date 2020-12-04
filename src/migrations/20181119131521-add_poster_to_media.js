'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => await queryInterface.addColumn('media', 's3Key_poster', {
        type: Sequelize.STRING,
        allowNull: true,
    }),

    down: async queryInterface => await queryInterface.removeColumn('media', 's3Key_poster')

};