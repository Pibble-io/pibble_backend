module.exports = {
    up: async (queryInterface, Sequelize) => queryInterface.addColumn('teams', 'atts', {
        type: Sequelize.JSON,
        defaultValue: {},
        allowNull: false
    }),
    down: (queryInterface, Sequelize) => queryInterface.removeColumn('teams', 'atts')
};