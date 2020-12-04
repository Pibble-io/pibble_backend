module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('levels', 'points_earn', {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false
        });
        await queryInterface.removeColumn('levels', 'multiplier');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('levels', 'points_earn');
        await queryInterface.addColumn('levels', 'multiplier', {
            type: DataTypes.DECIMAL,
            allowNull: false
        });
    }
};
