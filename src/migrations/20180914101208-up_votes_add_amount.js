module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.addColumn('up_votes', 'amount', {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
    }),

    down: (queryInterface, Sequelize) => queryInterface.removeColumn('up_votes', 'amount')
};
