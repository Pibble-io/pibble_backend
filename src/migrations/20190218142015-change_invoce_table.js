module.exports = {
    up: async (queryInterface, Sequelize) => {

        await queryInterface.addColumn('invoices', 'type', {
            type: Sequelize.ENUM(['internal', 'goods']),
            allowNull: false,
            defaultValue: 'internal'
        })
        await queryInterface.addColumn('invoices', 'post_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            foreignKey: true,
            references: {
                model: 'posts',
                key: 'id'
            },
            onDelete: 'SET NULL'
        })
        await queryInterface.renameColumn('invoices', 'internal_transaction_id', 'transaction_id');
        await queryInterface.sequelize.query('ALTER TABLE invoices DROP FOREIGN KEY invoices_ibfk_1;');


    },

    down: (queryInterface, Sequelize) => {
        queryInterface.renameColumn('invoices', 'transaction_id', 'internal_transaction_id');
        queryInterface.removeColumn('invoices', 'type')
        queryInterface.removeColumn('invoices', 'post_id')
    }
};