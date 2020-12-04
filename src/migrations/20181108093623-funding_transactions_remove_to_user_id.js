'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('funding_transactions', 'to_user_id');
    },

    down: (queryInterface, Sequelize) => queryInterface.addColumn('funding_transactions', 'to_user_id', {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: {
            model: 'users',
            key: 'id'
        },
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    })
};