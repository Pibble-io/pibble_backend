module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.addColumn('posts_tags', 'order', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    }),

    down: (queryInterface, Sequelize) => queryInterface.removeColumn('posts_tags', 'order')
};
