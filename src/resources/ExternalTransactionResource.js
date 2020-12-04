import Resource from './Resource';
import { pick } from 'lodash';

export default class ExternalTransactionResource extends Resource {
    async build(model, schema = []) {
        const transactionData = {
            type: model.dataValues.type == 0 ? 'withdraw' : 'deposit',
            coin: await model.getCoin({ attributes: [ 'name', 'symbol'] }),
            from_address: model.from_address,
            to_address: model.to_address,
            transaction_hash: model.transaction_hash
        };

        return {
            ...pick(model.dataValues, ['id', 'value', 'created_at', 'updated_at', ...schema]),
            ...transactionData
        };
    }
}