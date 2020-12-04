module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(
            "UPDATE feeds SET `message_data` = REPLACE(`message_data`, ' your ', ' <-!your!-> ');"
        );
        await queryInterface.sequelize.query(
            "UPDATE feeds SET `message_data` = REPLACE(`message_data`, ' you ', ' <-!you!-> ');"
        );
        await queryInterface.sequelize.query(
            "UPDATE feeds SET `message_data` = REPLACE(`message_data`, 'You ', '<-!you!-> ');"
        );
    },

    down: async (queryInterface, Sequelize) => {

    }
};