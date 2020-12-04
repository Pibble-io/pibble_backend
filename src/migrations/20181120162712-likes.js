'use strict';
import {
    Like,
} from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(Like.tableName, Like.attributes);

        await queryInterface.addIndex(Like.tableName, ['user_id', 'entity_id', 'entity_type'], {
            unique: true,
            name: 'likes_composite_index'
        });
    },


    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(Like.tableName)
    }
};