import Resource from './Resource';
import { Metric } from '../models';

export default class PostStatisticResource extends Resource {

    async build(model, schema = []) {

        const engage_sum = await Metric.count({ where: { post_id: model.id } });
        const engage = await Metric.getPostActionsStatistic(model.id);
        const unique_users = await Metric.getPostUniqueUsers(model.id);

        return {
            engage_sum,
            engage,
            unique_users
        };
    }
}