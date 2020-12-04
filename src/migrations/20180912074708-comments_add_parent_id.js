module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('comments', 'parent_id', {
            type: Sequelize.INTEGER(11),
            foreignKey: true,
            references: {
                model: 'сomments',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('comments', 'parent_id');
    }
};
