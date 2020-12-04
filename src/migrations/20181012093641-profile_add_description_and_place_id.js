module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users_profiles', 'description', {
            type: Sequelize.STRING(1023),
            allowNull: true
        });
        await queryInterface.addColumn('users_profiles', 'place_id', {
            type: Sequelize.INTEGER,
            foreignKey: true,
            references: {
                model: 'places',
                key: 'id'
            },
            allowNull: true,
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users_profiles', 'description');
        await queryInterface.removeColumn('users_profiles', 'place_id');
    }
};