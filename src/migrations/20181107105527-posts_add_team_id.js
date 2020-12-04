module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('posts', 'team_id', {
            type: Sequelize.INTEGER,
            foreignKey: true,
            references: {
                model: 'teams',
                key: 'id'
            },
            allowNull: true,
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });
    },
    down: (queryInterface, Sequelize) => queryInterface.removeColumn('posts', 'team_id')
};