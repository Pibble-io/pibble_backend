import Resource from './Resource';
import { pick } from 'lodash';

export default class AirdropResource extends Resource {
    async build(model, schema = []) {
        const transactionData = {
            coin: await model.getCoin({ attributes: [ 'name', 'symbol'] }),
            value: model.value
        };

        return {
            ...pick(model.dataValues, ['id', 'value', 'created_at', 'updated_at', ...schema]),
            ...transactionData
        };
    }
}