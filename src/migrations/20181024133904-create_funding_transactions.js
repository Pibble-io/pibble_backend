module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('funding_transactions', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        value: {
            type: Sequelize.DECIMAL(60, 18),
            allowNull: false
        },
        from_user_id: {
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
        to_user_id: {
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
        coin_id: {
            type: Sequelize.INTEGER,
            foreignKey: true,
            references: {
                model: 'coins',
                key: 'id'
            },
            allowNull: true,
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        post_id: {
            type: Sequelize.INTEGER,
            foreignKey: true,
            references: {
                model: 'posts',
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

    down: (queryInterface, Sequelize) => queryInterface.dropTable('funding_transactions')
};