import { Level, User } from '../models';
import {Op} from "sequelize";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const users = await User.all();
        for (const user of users) {
            const level = await Level.findOne({
                where: {
                    points_earn: {
                        [Op.lte]: user.level_points
                    },
                    id: {
                        [Op.gt]: user.level
                    }
                },
                order: [
                    ['points_earn', 'DESC'],
                ]
            });

            if(level && level.id !== user.level) {
                await user.setLevels(level);
            }
        }
    },

    down: (queryInterface, Sequelize) => {

    }
};