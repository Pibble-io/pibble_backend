import Resource from './Resource';
import {Post, UsersFollowers, UsersFriends} from "../models";
import { pick } from 'lodash';
import DynamicUserResource from "./DynamicUserResource";

export default class TransactionResource extends Resource {
    async build(model, schema = []) {
        const userSchema = {
            User: {
                fields: ['id', 'avatar'],
                resources: []
            },
        };
        const transactionData = {
            type: model.type,
            coin: await model.getCoin({ attributes: [ 'name', 'symbol'] }),
            from_user: await this.getFromUser(model,userSchema),
            to_user: await this.getToUser(model,userSchema)
        };

        return {
            ...pick(model.dataValues, ['id', 'value', 'created_at', 'updated_at', ...schema]),
            ...transactionData
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
