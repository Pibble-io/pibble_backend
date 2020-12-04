import Resource from './Resource';
import { Post, FundingTransaction } from "../models";
import { pick } from 'lodash';
import { Op } from "sequelize";

export default class CampaignResource extends Resource {

    async build(model, schema = []) {

        const post_ids = model.entity_type === 'team'
        ? await Post.findAll({ where: { team_id: model.entity_id}, attributes: ['id'] }).map(p => p.id)
        : [model.entity_id];

        const raised = await FundingTransaction.sum('value', {
            where: {
                post_id: {
                    [Op.in]: post_ids
                }
            }
        }) || 0;

        return {
            ...pick(model, ['title', 'funding_type', 'raising_for', 'start_date', 'end_date', 'soft_cap', 'hard_cap', 'raised'], ...schema),
            raised,
            category: await this.getCampaignCategory(model),
        };
    }

    async getCampaignCategory(model) {
        return await model.getCategory({ attributes: [ 'id', 'name' ] });
    }
}