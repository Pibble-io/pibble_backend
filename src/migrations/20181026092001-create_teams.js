module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('teams', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        name: {
            type: Sequelize.STRING(63),
            unique: true,
            allowNull: false
        },
        user_id: {
            type: Sequelize.INTEGER,
            foreignKey: true,
            references: {
                model: 'users',
                key: 'id'
            },
            allowNull: true,
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        logo_id: {
            type: Sequelize.INTEGER,
            foreignKey: true,
            references: {
                model: 'media',
                key: 'id'
            },
            allowNull: true,
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        created_at: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updated_at: {
            allowNull: false,
            type: Sequelize.DATE
        }
    }),

    down: (queryInterface, Sequelize) => queryInterface.dropTable('teams')
};