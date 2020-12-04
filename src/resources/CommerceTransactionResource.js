import Resource from './Resource';
import { pick } from 'lodash';
import PostResource from "./PostResource";

export default class CommerceTransactionResource extends Resource {
    async build(model, schema = []) {
        const transactionData = {
            coin: await model.getCoin({ attributes: ['name', 'symbol'] }),
            post: await PostResource.create(await model.getPost({ paranoid: false }))
        };

        return {
            ...pick(model.dataValues, ['id', 'value', 'created_at', 'updated_at', ...schema]),
            ...transactionData
        };
    }
}