module.exports = {
    up: async (queryInterface, Sequelize) => {
        const types = ['verification', 'password_reset', 'authentication', 'pincode_reset'];
        await queryInterface.changeColumn('email_confirmations', 'type', {
            type: Sequelize.ENUM(types),
            allowNull: false
        });
        await queryInterface.changeColumn('phone_confirmations', 'type', {
            type: Sequelize.ENUM(types),
            allowNull: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        const types = ['verification', 'password_reset', 'authentication'];
        await queryInterface.changeColumn('email_confirmations', 'type', {
            type: Sequelize.ENUM(types),
            allowNull: true
        });
        await queryInterface.changeColumn('phone_confirmations', 'type', {
            type: Sequelize.ENUM(types),
            allowNull: true
        });
    }
};
