import { Metric } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('metrics', 'type', {
            type: Sequelize.ENUM(Metric.allowTypes),
            allowNull: false
        });
    },

    down: (queryInterface, Sequelize) => {

    }
};
