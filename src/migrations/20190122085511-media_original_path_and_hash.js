module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.addColumn('media', 's3Key_original', {
            type: Sequelize.STRING(127),
            allowNull: true,
            defaultValue: null,
        })
        queryInterface.addColumn('media', 'bit_dna_hash', {
            type: Sequelize.STRING(16),
            allowNull: true,
            defaultValue: null,
        })
        queryInterface.addColumn('media', 'bit_dna_passed', {
            type: Sequelize.BOOLEAN,
            defaultValue: null,
            allowNull: true
        })
    },

    down: (queryInterface, Sequelize) => {
        queryInterface.removeColumn('media', 's3Key_original');
        queryInterface.removeColumn('media', 'bit_dna_hash');
        queryInterface.removeColumn('media', 'bit_dna_passed');
    }

};
