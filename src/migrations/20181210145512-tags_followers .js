import {
    TagsFollowers,
} from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(TagsFollowers.tableName, TagsFollowers.attributes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(TagsFollowers.tableName)
    }
};