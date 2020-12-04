module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('exchange_rate_histories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            from_symbol: {
                allowNull: false,
                type: Sequelize.STRING
            },
            to_symbol: {
                allowNull: false,
                type: Sequelize.STRING
            },
            rate: {
                allowNull: false,
                type: Sequelize.DECIMAL(60, 18)
            },
            timestamp: {
                allowNull: false,
                type: Sequelize.DATE
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('exchange_rate_histories');
    }
};