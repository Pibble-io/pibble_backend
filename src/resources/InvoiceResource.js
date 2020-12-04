import Resource from './Resource';
import { pick } from 'lodash';
import { User } from "../models";
import UserResource from "./UserResource";

export default class InvoiceResource extends Resource {
    async build(model, schema = []) {
        const invoiceData = {
            coin: await model.getCoin({ attributes: ['name', 'symbol'] }),
            from_user: await this.getFromUser(model),
            to_user: await this.getToUser(model)
        };

        model.dataValues.value = parseFloat(model.dataValues.value);
        return {
            ...pick(model.dataValues, ['id', 'value', 'description', 'status', 'type', 'created_at', ...schema]),
            ...invoiceData,
        };
    }

    async getFromUser(model) {
        return await UserResource.create(await model.getUserFrom());
    }

    async getToUser(model) {
        return await UserResource.create(await model.getUserTo());
    }
}