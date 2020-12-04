import { InappropriateReport } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.renameTable('block_reports', 'inappropriate_reports');

        await queryInterface.sequelize.query(`
        UPDATE inappropriate_reports SET reason=IF(reason LIKE '%마음에%' OR reason LIKE '%like it%', 'dont_like',
                                    IF(reason LIKE '%또는 음란물%' OR reason LIKE '%pornography%','nudity', 
                                    IF(reason LIKE '%발언이나%' OR reason LIKE '%speech%','hate', 
                                    IF(reason LIKE '%또는 협박%' OR reason LIKE '%Violence or threat%','violence',
                                    IF(reason LIKE '%총기류%' OR reason LIKE '%of firearms%','firearms',
                                    IF(reason LIKE '%마약%' OR reason LIKE '%of drugs%','drugs',
                                    IF(reason LIKE '%따돌림%' OR reason LIKE '%bullying%','bullying',
                                    IF(reason LIKE '%재산권%' OR reason LIKE '%property violation%','intellectual',                                    
                                    IF(reason LIKE '%자해%' OR reason LIKE '%injury%','injury','dont_like' 
                                    )))))))));
        `);

        await queryInterface.changeColumn('inappropriate_reports', 'reason', {
            type: Sequelize.ENUM(InappropriateReport.allowTypes),
            allowNull: false
        });
    },

    down: (queryInterface, Sequelize) => {

    }
};
