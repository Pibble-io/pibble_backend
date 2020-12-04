module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.addColumn('posts', 'hide', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }),

    down: (queryInterface, Sequelize) => queryInterface.removeColumn('posts', 'hide')
};