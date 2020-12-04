module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.changeColumn('media', 'type', {
        type: Sequelize.ENUM(['post', 'avatar', 'album', 'wall_cover', 'team']),
        allowNull: false
    }),

    down: (queryInterface, Sequelize) => queryInterface.changeColumn('media', 'type', {
        type: Sequelize.ENUM(['post', 'avatar', 'album', 'wall_cover']),
        allowNull: false
    })
};
