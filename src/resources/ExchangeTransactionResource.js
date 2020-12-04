import Resource from './Resource';
import { pick } from 'lodash';

export default class ExchangeTransactionResource extends Resource {
    async build(model, schema = []) {

        const transactionData = {
            type: model.type,
            from: await model.getCoinFrom({ attributes: [ 'name', 'symbol'] }),
            to: await model.getCoinTo({ attributes: [ 'name', 'symbol'] }),
            from_value: model.from_value,
            to_value: model.to_value,
            rate: model.rate
        };

        return {
            ...pick(model.dataValues, ['id', 'value', 'created_at', 'updated_at', ...schema]),
            ...transactionData
        };
    }
}