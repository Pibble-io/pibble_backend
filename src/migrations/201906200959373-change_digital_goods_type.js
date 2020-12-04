module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('invoices', 'type', {
            type: Sequelize.ENUM(['internal', 'goods','digital_goods']), //should be 'goods' 'digital-goods'
            allowNull: false
        });
        await queryInterface.sequelize.query('UPDATE invoices SET type = "digital_goods" WHERE type="goods"');


        await queryInterface.changeColumn('posts', 'type', {
            type: Sequelize.ENUM(['media', 'digital_goods','sale', 'funding','goods']),
            allowNull: false
        });

        await queryInterface.sequelize.query('UPDATE posts SET type = "digital_goods" WHERE type="sale"');

        await queryInterface.changeColumn('posts', 'type', {
            type: Sequelize.ENUM(['media', 'digital_goods', 'funding','goods']),
            allowNull: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('posts', 'type', {
            type: Sequelize.ENUM(['media', 'digital_goods','sale', 'funding','goods']),
            allowNull: false
        });

        await queryInterface.sequelize.query('UPDATE posts SET type = "sale" WHERE type="digital_goods"');

        await queryInterface.changeColumn('posts', 'type', {
            type: Sequelize.ENUM(['media', 'sale', 'funding','goods']),
            allowNull: false
        });

        await queryInterface.changeColumn('invoices', 'type', {
            type: Sequelize.ENUM(['internal', 'goods']), //should be 'goods' 'digital-goods'
            allowNull: false
        });
    }
};
