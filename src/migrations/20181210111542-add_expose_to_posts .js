module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('posts', 'expose', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('expose');
    }
};