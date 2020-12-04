import { Reports } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn(
            'users',
            'report_level',
            {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                after: 'level_points'
            }
        );
        await queryInterface.addColumn(
            'users',
            'report_end_of_restriction_time',
            {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: null,
                after: 'report_level'
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'report_level');
        await queryInterface.removeColumn('users', 'report_end_of_restriction_time');
    }
};