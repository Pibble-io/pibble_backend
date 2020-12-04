'use strict';
import {
    PromotionTransaction,
} from '../models';


module.exports = {

    up: async (queryInterface, Sequelize) => {

        await queryInterface.addColumn('promotions', 'reward_type_like', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: 0,
        });

        await queryInterface.addColumn('promotions', 'reward_type_collect', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: 0,
        });

        await queryInterface.addColumn('promotions', 'reward_type_tag', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: 0,
        });

        await queryInterface.addColumn('promotions', 'campaign_name', {
            type: Sequelize.STRING(150),
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('promotions', 'reward_type_like');
        await queryInterface.removeColumn('promotions', 'reward_type_collect');
        await queryInterface.removeColumn('promotions', 'reward_type_tag');
        await queryInterface.removeColumn('promotions', 'campaign_name');
    },

};