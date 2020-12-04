import {Spam} from "../models";

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.addColumn('users', 'type', {
        type: Sequelize.ENUM(['general', 'business', 'pro', 'doubt']),
        allowNull: false,
        defaultValue: 'general',
    }),

    down: (queryInterface, Sequelize) => queryInterface.removeColumn('users', 'type')

};
