module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'deleted_at', {
            type: Sequelize.DATE,
            allowNull: true,
        });
        await queryInterface.addColumn('posts', 'deleted_at', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'deleted_at')
        await queryInterface.removeColumn('posts', 'deleted_at')
    }
};
