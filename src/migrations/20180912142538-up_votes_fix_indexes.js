module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('up_votes', ['user_id', 'entity_id', 'entity_type'], {
            unique: true,
            name: 'up_votes_composite_index'
        });
        await queryInterface.removeIndex('up_votes', 'PRIMARY');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addConstraint('up_votes', ['user_id', 'entity_id', 'entity_type'], {
            type: 'primary key'
        });
        await queryInterface.removeIndex('up_votes', 'up_votes_composite_index');
    }
};
