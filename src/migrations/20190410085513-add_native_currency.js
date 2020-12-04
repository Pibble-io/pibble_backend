module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'users_profiles',
            'currency',
            {
                type: Sequelize.ENUM(['KRW', 'AUD', 'GBP', 'CAD', 'CNY', 'EUR', 'JPY']),
                defaultValue: 'KRW'
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('users_profiles', 'currency');
    }
};
