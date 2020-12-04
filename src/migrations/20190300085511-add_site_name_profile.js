import { ChatRoom } from '../models';
module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.addColumn('users_profiles', 'site_name', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
    }),

    down: (queryInterface, Sequelize) => queryInterface.removeColumn('site_name')

};
