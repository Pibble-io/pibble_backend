module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.addColumn('media', 's3Key_thumbnail', {
        type: Sequelize.STRING(127),
        allowNull: true
    }),

    down: (queryInterface, Sequelize) => queryInterface.removeColumn('media', 's3Key_thumbnail')
};
