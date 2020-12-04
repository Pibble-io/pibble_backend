'use strict';
import {
    Like,
} from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('favorites', 'deleted_at', {
            type: Sequelize.DATE,
            allowNull: true,
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('favorites', 'deleted_at')
    }
};