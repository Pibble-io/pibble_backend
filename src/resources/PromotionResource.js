import Resource from './Resource';
import { pick } from 'lodash';
import { PromotionTransaction } from "../models";

export default class PromotionResource extends Resource {

    async attachFlagsState(requester) {
        this.data.spent = await PromotionTransaction.getSpent(requester.id);
        return this.data;
    }

    async build(model, schema = []) {
        return {
            ...pick(model.dataValues, [
                'id',
                'budget',
                'reward_type_collect',
                'reward_type_tag',
                'reward_type_up_vote',
                'reward_type_share',
                // old fields
                // 'reward_type_curate',
                // 'reward_type_mention',
                // 'reward_type_like',
                ...schema
            ]),
        };
    }
}