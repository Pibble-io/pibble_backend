module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('up_votes', 'duplication_number', {
            type: Sequelize.INTEGER,
            allowNull: null,
            defaultValue: null
        });

        const up_votes = await queryInterface.sequelize.query(
            'SELECT * FROM `up_votes` WHERE duplication_number IS NULL',
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
            },
        );

        let duplicatesCounter = 0;
        for (const item of up_votes) {
            const max_duplication_number = await queryInterface.sequelize.query(
                'SELECT max(duplication_number) as max_duplication_number FROM `up_votes` WHERE user_id=:user_id AND entity_type=:entity_type AND entity_id=:entity_id LIMIT 1',
                {
                    replacements: { user_id: item.user_id, entity_type: item.entity_type, entity_id: item.entity_id },
                    type: queryInterface.sequelize.QueryTypes.SELECT,
                },
            );

            duplicatesCounter = max_duplication_number[0].max_duplication_number === null ? 0 : max_duplication_number[0].max_duplication_number + 1;

            await queryInterface.sequelize.query(
                'UPDATE up_votes SET duplication_number = :duplication_number WHERE id = :id',
                { replacements: { duplication_number: duplicatesCounter, id: item.id } }
            );
        };


        await queryInterface.changeColumn('up_votes', 'duplication_number', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        });
        await queryInterface.addIndex('up_votes', ['user_id', 'duplication_number', 'entity_id', 'entity_type'], {
            unique: true,
            name: 'up_vote_unique_index'
        });



    },

    down: async (queryInterface, Sequelize) => {

    }
};