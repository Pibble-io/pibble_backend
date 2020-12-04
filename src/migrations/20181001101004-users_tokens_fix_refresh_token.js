module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.changeColumn('users_tokens', 'refresh_token', {
        type: Sequelize.TEXT,
        allowNull: false
    }),

    down: (queryInterface, Sequelize) => queryInterface.changeColumn('users_tokens', 'refresh_token', {
        type: Sequelize.STRING,
        allowNull: false
    })
};
