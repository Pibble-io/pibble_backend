'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('posts', 'is_published', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true,
        });
        await queryInterface.addColumn('posts', 'services', {
            type: Sequelize.JSON,
            defaultValue: {},
            allowNull: false
        })
    },

    down: async queryInterface => {
        await queryInterface.removeColumn('posts', 'is_published');
        await queryInterface.removeColumn('posts', 'services');
    },

};