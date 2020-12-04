module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.addColumn('posts_media', 'order', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    }),

    down: (queryInterface, Sequelize) => queryInterface.removeColumn('posts_media', 'order')
};
