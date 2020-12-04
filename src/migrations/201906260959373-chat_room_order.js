module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('chat_rooms', 'goods_order_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            foreignKey: true,
            references: {
                model: 'goods_orders',
                key: 'id'
            },
            onDelete: 'SET NULL'
        })
    },

    down: async (queryInterface, Sequelize) => {        
        queryInterface.removeColumn('chat_rooms', 'post_id')
    }
};