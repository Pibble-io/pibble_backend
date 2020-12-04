import Resource from './Resource';
import { pick } from 'lodash';
import DynamicPostResource from "./DynamicPostResource";
import DynamicUserResource from "./DynamicUserResource";
import { GoodsTransaction } from '../models';

export default class DigitalGoodsTransactionResource extends Resource {
    async attachData(requester) {

        this.data.value = (this.data.to_user_id === requester.id && this.data.type !== GoodsTransaction.goodsTransactionTypeReturn) ? (this.data.value - (this.data.fee / 100) * this.data.value) : this.data.value;
        return this;
    }

    async build(model, schema = []) {
        const userSchema = {
            User: {
                fields: ['id', 'avatar'],
                resources: []
            },
        };
        const postSchema = {
            Post: {
                fields: ['media', 'user', 'palce', 'commerce'],
                resources: [
                    userSchema
                ]
            }
        };

        const order = await model.getGoodsOrder();
        const post = order ? await DynamicPostResource.create(await order.getPost({ paranoid: false }), postSchema) : null;

        const transactionData = {
            coin: await model.getCoin({ attributes: ['name', 'symbol'] }),
            post: post,
            order: order,
            from_user: await this.getFromUser(model, userSchema),
            to_user: await this.getToUser(model, userSchema),
            value: parseFloat(model.value)
        };

        return {
            ...pick(model.dataValues, ['id', 'fee', 'from_user_id', 'to_user_id', 'type', 'created_at', 'updated_at', ...schema]),
            ...transactionData
        };
    }

    async getFromUser(model, userSchema) {
        const user = await model.getUserFrom();
        return await (user && DynamicUserResource.create(user, userSchema));
    }

    async getToUser(model, userSchema) {
        const user = await model.getUserTo();
        return await (user && DynamicUserResource.create(user, userSchema));
    }
}