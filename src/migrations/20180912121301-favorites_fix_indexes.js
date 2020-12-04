module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('favorites', ['user_id', 'entity_id', 'entity_type'], {
            unique: true,
            name: 'favorites_composite_index'
        });
        await queryInterface.removeIndex('favorites', 'PRIMARY');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addConstraint('favorites', ['user_id', 'entity_id', 'entity_type'], {
            type: 'primary key'
        });
        await queryInterface.removeIndex('favorites', 'favorites_composite_index');
    }
};
