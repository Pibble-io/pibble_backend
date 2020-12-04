import { InappropriateReport } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.renameTable('reports', 'block_reports');

        await queryInterface.sequelize.query(`UPDATE block_reports SET reason=NULL, description=NULL;`);
    },

    down: (queryInterface, Sequelize) => {

    }
};
