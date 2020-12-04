module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'pin_code', {
            type: Sequelize.STRING(127),
            allowNull: true
        });
        const data = await queryInterface.sequelize.query(
            'SELECT `pin_code`, `user_id` FROM `wallets` WHERE `pin_code` IS NOT NULL',
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        data.map(async ({ pin_code, user_id }) => {
            await queryInterface.sequelize.query(
                'UPDATE users SET pin_code = :pin_code WHERE id = :user_id',
                { replacements: { pin_code, user_id } }
            );
        });
        await queryInterface.removeColumn('wallets', 'pin_code');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('wallets', 'pin_code', {
            type: Sequelize.TEXT,
            allowNull: true
        });
        const data = await queryInterface.sequelize.query(
            'SELECT `pin_code`, `id` FROM `users` WHERE `pin_code` IS NOT NULL',
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        data.map(async ({ pin_code, id }) => {
            await queryInterface.sequelize.query(
                'UPDATE wallets SET pin_code = :pin_code WHERE user_id = :id',
                { replacements: { pin_code, id } }
            );
        });
        await queryInterface.removeColumn('users', 'pin_code');
    }
};
