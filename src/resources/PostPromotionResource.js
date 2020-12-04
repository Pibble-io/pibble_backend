import Resource from './Resource';
import { pick } from 'lodash';
import moment from "moment/moment";
import { PostPromotionTransaction } from '../models';

export default class PostPromotionResource extends Resource {

    async attachFlagsState(requester) {
        this.data.impressionSpent = await PostPromotionTransaction.getImpressionSpent(requester.id);
        this.data.actionsSpent = await PostPromotionTransaction.getActionsSpent(requester.id);
        this.data.total_spent = await PostPromotionTransaction.getSpent(requester.id);

        return this.data;
    }

    async build(model, schema = []) {
        const is_close = !(model.deleted_at === null);
        const expiration_date = moment(model.created_at, "DD-MM-YYYY").add(model.duration, 'days');
        return {
            is_close,
            ...pick(model, [
                'id',
                'budget',
                'duration',
                'destination',
                'is_paused',
                'action_button',
                'site_url',
                'created_at',
                ...schema
            ]),
            expiration_date,
        };
    }
}