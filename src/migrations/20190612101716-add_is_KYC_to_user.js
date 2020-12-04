module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.addColumn('users', 'is_KYC', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }),

    down: (queryInterface, Sequelize) => queryInterface.removeColumn('users', 'is_KYC')
};
