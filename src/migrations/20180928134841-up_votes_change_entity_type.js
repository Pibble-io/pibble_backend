module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('up_votes', 'id', {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        });
        await queryInterface.changeColumn('up_votes', 'entity_type', {
            type: Sequelize.ENUM(['post', 'comment', 'profile']),
            allowNull: false
        });
        await queryInterface.sequelize.query('ALTER TABLE `up_votes` RENAME INDEX `up_votes_composite_index` TO `up_votes_composite_index_old`');
        await queryInterface.addIndex('up_votes', ['user_id', 'entity_id', 'entity_type'], {
            unique: false,
            name: 'up_votes_composite_index'
        });
        await queryInterface.removeIndex('up_votes', 'up_votes_composite_index_old');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query('ALTER TABLE `up_votes` MODIFY `id` INT NOT NULL');
        await queryInterface.removeIndex('up_votes', 'PRIMARY');
        await queryInterface.removeColumn('up_votes', 'id');
        await queryInterface.sequelize.query('ALTER TABLE `up_votes` RENAME INDEX `up_votes_composite_index` TO `up_votes_composite_index_old`');
        await queryInterface.addIndex('up_votes', ['user_id', 'entity_id', 'entity_type'], {
            unique: true,
            name: 'up_votes_composite_index'
        });
        await queryInterface.removeIndex('up_votes', 'up_votes_composite_index_old');
        await queryInterface.changeColumn('up_votes', 'entity_type', {
            type: Sequelize.ENUM(['post', 'comment']),
            allowNull: false
        });
    }
};
