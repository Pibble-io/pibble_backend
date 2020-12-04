import { RegistrationUser } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        let atts = {};
        Object.keys(RegistrationUser.attributes).map(attr => { return (RegistrationUser.attributes[attr].type instanceof Sequelize.VIRTUAL) === false ? atts[attr] = RegistrationUser.attributes[attr] : null })
        await queryInterface.createTable(RegistrationUser.tableName, atts);
        await queryInterface.addIndex('registration_users', ['username'], {
            unique: true,
            name: 'username'
        });
        await queryInterface.addIndex('registration_users', ['email'], {
            unique: true,
            name: 'email'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable(RegistrationUser.tableName);
    }
};