module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('categories', 'is_charity', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });

        await queryInterface.addColumn('categories', 'is_crowd', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('categories', 'is_charity');
        await queryInterface.removeColumn('categories', 'is_crowd');
    }
};