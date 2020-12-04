import { Spam } from "../models";

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.changeColumn('commerces', 'status', {
        type: Sequelize.ENUM(['wait', 'in-progress', 'pending_contract_deploy', 'failed', 'success']),
        allowNull: false,
        defaultValue: 'wait',
    }),

    down: (queryInterface, Sequelize) => queryInterface.changeColumn('commerces', 'status', {
        type: Sequelize.ENUM(['wait', 'in-progress', 'failed', 'success']),
        allowNull: false,
        defaultValue: 'wait',
    }),
};
