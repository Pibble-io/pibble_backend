module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('spams', 'who', {
            type: Sequelize.ENUM(['admin', 'user']),
            allowNull: false,
            defaultValue: 'user',
        });
    },

    down: (queryInterface, Sequelize) => queryInterface.removeColumn('spams', 'who')
};
