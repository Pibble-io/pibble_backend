const { exec } = require('child_process');

import { Post, Team, Campaign } from '../models';
import moment from 'moment';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        /*
        const teams = await Team.all({include: 'posts'});
        for (const team of teams) {
            if (team.atts.campaign) {
                const category_id = team.posts[0] && team.posts[0]['category_id'] ? team.posts[0]['category_id'] : 1;
                const { title, funding_type, raising_for, goal } = team.atts.campaign;
                await Campaign.create({
                    entity_id: team.id,
                    entity_type: 'team',
                    title,
                    funding_type,
                    raising_for,
                    category_id,
                    start_date: moment().add(-12, 'M'),
                    end_date: moment().add(12, 'M'),
                    soft_cap: 1,
                    hard_cap: parseInt(goal),
                });
            }
        }
        for (let item of teams) {
            item.atts = {};
            await item.save();
        }
        const posts = await Post.all({where: {team_id: null, type: 'funding'}});
        for (const post of posts) {
            if (post.atts.campaign) {
                const category_id = post['category_id'] ? post['category_id'] : 1;
                const { title, funding_type, raising_for, goal } = post.atts.campaign;
                await Campaign.create({
                    entity_id: post.id,
                    entity_type: 'individual',
                    title,
                    funding_type,
                    raising_for,
                    category_id,
                    start_date: moment().add(-12, 'M'),
                    end_date: moment().add(12, 'M'),
                    soft_cap: 1,
                    hard_cap: parseInt(goal),
                });
            }
        }
        for (let item of posts) {
            if(item.atts.caption) {
                item.atts = {
                    caption: item.atts.caption,
                }
            } else {
                item.atts = {}
            }
            await item.save();
        }
        */
    },

    down: (queryInterface, Sequelize) => {

    }
};
