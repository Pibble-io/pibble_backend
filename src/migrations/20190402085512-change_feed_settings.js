import { Spam } from "../models";

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.changeColumn('feed_settings', 'entity_type', {
        type: Sequelize.ENUM(['post', 'user']),
        allowNull: false,
        defaultValue: 'user',
    }),

    down: (queryInterface, Sequelize) => { }

};
