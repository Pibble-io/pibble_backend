module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.changeColumn('up_votes', 'entity_type', {
            type: Sequelize.ENUM(['post', 'comment']),
            allowNull: false
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.changeColumn('up_votes', 'entity_type', {
            type: Sequelize.ENUM(['post']),
            allowNull: false
        });
    }
};
