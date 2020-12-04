import {Spam} from "../models";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(Spam.tableName, Spam.attributes);
        await queryInterface.addIndex(Spam.tableName, ['user_id', 'entity_id', 'entity_type', 'type'], {
            unique: true,
            name: 'spams_composite_index'
        });
    },

    down: (queryInterface, Sequelize) => queryInterface.dropTable(Spam.tableName),

};
