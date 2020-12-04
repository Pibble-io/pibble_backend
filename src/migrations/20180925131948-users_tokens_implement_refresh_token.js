module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('users_tokens');
        await queryInterface.addIndex('users_tokens', ['user_id', 'user_agent'], {
            unique: true,
            name: 'users_tokens_composite_index'
        });
        await queryInterface.removeColumn('users_tokens', 'id');
        await queryInterface.removeColumn('users_tokens', 'token');
        await queryInterface.removeColumn('users_tokens', 'user_agent_hash');
        await queryInterface.addColumn('users_tokens', 'refresh_token', {
            type: Sequelize.STRING,
            allowNull: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users_tokens', 'refresh_token');
        await queryInterface.addColumn('users_tokens', 'token', {
            type: Sequelize.STRING,
            allowNull: false
        });
        await queryInterface.addColumn('users_tokens', 'user_agent_hash', {
            type: Sequelize.STRING,
            allowNull: false
        });

    }
};
