import Resource from './Resource';
import { pick } from 'lodash';
import moment from 'moment/moment';
import { PostPromotionTransaction, Metric } from '../models';

export default class PostPromotionStatisticResource extends Resource {

    async attachFlagsState(promotion) {
        this.data.impression_spent = await PostPromotionTransaction.getImpressionSpent(promotion.id);
        this.data.actions_spent = await PostPromotionTransaction.getActionsSpent(promotion.id);
        this.data.total_spent = await PostPromotionTransaction.getSpent(promotion.id);
        this.data.total_left = this.data.budget - this.data.total_spent;
        this.data.engage_sum = await Metric.count({ where: { post_promotion_id: promotion.id } });
        this.data.engage = await Metric.getPromoActionsStatistic(promotion.id);
        this.data.impression = await Metric.getPromoImpresionsStatistic(promotion.id);
        this.data.unique_users = await Metric.getPromoUniqueUsers(promotion.id);

        return this.data;
    }

    async build(model, schema = []) {

        const start_date = moment(model.created_at, 'DD-MM-YYYY');
        const end_date = moment(model.created_at, 'DD-MM-YYYY').add(model.duration, 'days');

        return {
            start_date,
            end_date,
            ...pick(model, [
                'id',
                'budget',
                'duration',
                ...schema
            ]),
        };
    }
}