module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users_teams', {
            user_id: {
                type: Sequelize.INTEGER,
                foreignKey: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                allowNull: true,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            team_id: {
                type: Sequelize.INTEGER,
                foreignKey: true,
                references: {
                    model: 'teams',
                    key: 'id'
                },
                allowNull: true,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            joined_at: {
                allowNull: true,
                type: Sequelize.DATE
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
        await queryInterface.addIndex('users_teams', ['user_id', 'team_id'], {
            unique: true,
            name: 'users_teams_composite_index'
        });
    },

    down: (queryInterface, Sequelize) => queryInterface.dropTable('users_teams')
};