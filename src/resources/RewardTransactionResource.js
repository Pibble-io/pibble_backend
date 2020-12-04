import Resource from './Resource';
import { pick } from 'lodash';
import { User } from "../models";
import DynamicUserResource from "./DynamicUserResource";

export default class RewardTransactionResource extends Resource {
    async build(model, schema = []) {
        const userSchema = {
            User: {
                fields: ['id', 'avatar'],
                resources: []
            },
        };
        const data = {
            type: model.type,
            from_coin: await model.getCoinFrom({ attributes: [ 'name', 'symbol'] }),
            to_coin: await model.getCoinTo({ attributes: [ 'name', 'symbol'] }),
            from_user: await this.getFromUser(model, userSchema),
            to_user: await this.getToUser(model, userSchema)
        };

        return {
            ...pick(model.dataValues, ['id', 'from_value', 'to_value', 'status', 'created_at', ...schema]),
            ...data,
        };
    }

    async getFromUser(model,userSchema) {
        const user = await model.getUserFrom();
        return await (user && DynamicUserResource.create(user,userSchema));
    }

    async getToUser(model,userSchema) {
        const user = await model.getUserTo();
        return await (user && DynamicUserResource.create(user,userSchema));
    }
}