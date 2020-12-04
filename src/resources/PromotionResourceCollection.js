import ResourceCollection from './ResourceCollection'
import PromotionResource from "./PromotionResource";

export default class PromotionResourceCollection extends ResourceCollection {

    itemResource = PromotionResource;

    async attachFlagsState() {
        this.items = await Promise.all(this.items.map(async item => {
            return await item.attachFlagsState(item.data);
        }));

        return this;
    }

    async attachTotals() {
        let total_spent = 0
        let total_budget = 0
        let has_reward_type_collect = false;
        let has_reward_type_tag = false;
        let has_reward_type_up_vote = false;
        let has_reward_type_share = false;
        await Promise.all(this.items.map(async item => {
            const newItem = await item.attachFlagsState(item.data);
            if (newItem.reward_type_collect && newItem.spent < newItem.budget) {
                has_reward_type_collect = true;
            }
            if (newItem.reward_type_tag && newItem.spent < newItem.budget) {
                has_reward_type_tag = true;
            }
            if (newItem.reward_type_up_vote && newItem.spent < newItem.budget) {
                has_reward_type_up_vote = true;
            }
            if (newItem.reward_type_share && newItem.spent < newItem.budget) {
                has_reward_type_share = true;
            }
            total_spent += newItem.spent
            total_budget += newItem.budget
        }));

        return { total_spent, total_budget, has_reward_type_collect, has_reward_type_tag, has_reward_type_up_vote, has_reward_type_share };
    }

}