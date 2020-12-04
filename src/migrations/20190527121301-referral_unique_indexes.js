module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('referrals', ['user_id', 'used_by_id'], {
            unique: true,
            name: 'referrals_unique_index'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('referrals', 'referrals_unique_index');
    }
};
