module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('post_promotion_transactions', ['type', 'promotion_id','to_user_id'], {
            unique: true,
            name: 'unique_action'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('post_promotion_transactions', 'unique_action');
    }
};
