module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.addColumn('users', 'level_points', {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
    }),

    down: (queryInterface, Sequelize) => queryInterface.removeColumn('users', 'level_points')
};
