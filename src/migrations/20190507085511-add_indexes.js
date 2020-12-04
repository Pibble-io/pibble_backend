module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('comments', ['entity_id', 'entity_type']);
        await queryInterface.addIndex('up_votes', ['entity_id', 'entity_type']);
        await queryInterface.addIndex('favorites', ['entity_id', 'entity_type']);
        await queryInterface.addIndex('likes', ['entity_id', 'entity_type']);
    },

    down: async (queryInterface, Sequelize) => {
        
    }
};