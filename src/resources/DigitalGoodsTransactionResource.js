import Resource from './Resource';
import { pick } from 'lodash';
import DynamicPostResource from "./DynamicPostResource";
import DynamicUserResource from "./DynamicUserResource";

export default class DigitalGoodsTransactionResource extends Resource {
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
        const transactionData = {
            coin: await model.getCoin({ attributes: ['name', 'symbol'] }),
            post: await DynamicPostResource.create(await model.getPost({ paranoid: false }), postSchema),
            from_user: await this.getFromUser(model, userSchema),
            to_user: await this.getToUser(model, userSchema),
            value: parseFloat(model.value)
        };

        return {
            ...pick(model.dataValues, ['id', 'fee', 'from_user_id', 'to_user_id', 'created_at', 'updated_at', ...schema]),
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