import Resource from './Resource';
import { pick } from 'lodash';
import DynamicPostResource from "./DynamicPostResource";
import postSchema from '../schemas/fundingTransactionSchema'

export default class FundingTransactionResource extends Resource {
    async build(model, schema = []) {
        const transactionData = {
            coin: await model.getCoin({ attributes: ['name', 'symbol'] }),
            post: await DynamicPostResource.create(await model.getPost({ paranoid: false }), postSchema)
        };

        return {
            ...pick(model.dataValues, ['id', 'value', 'created_at', 'updated_at', ...schema]),
            ...transactionData
        };
    }
}