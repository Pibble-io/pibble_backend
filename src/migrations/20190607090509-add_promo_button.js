
import { PostPromotion } from '../models';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('post_promotions', 'action_button', PostPromotion.attributes.action_button);
    },

    down: (queryInterface, Sequelize) => {
    }
};
