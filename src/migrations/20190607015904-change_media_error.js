module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'media',
            'error',
            {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null,
                after: 'processed'
            },
        );
    },

    down: async function (queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'media',
            'error',
            {
                type: Sequelize.ENUM(['S3_error']),
                allowNull: true,
                defaultValue: null,
                after: 'processed'
            },
        );
    }
};
