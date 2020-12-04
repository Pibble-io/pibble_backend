import Resource from './Resource';
import { pick } from 'lodash';

export default class AssetTransactionResource extends Resource {
    async build(model, schema = []) {
        const asset = await model.getAsset({ attributes: ['name', 'symbol', 's3Key','game_app_id'] });
        const app = await asset.getApp({ attributes: ['name'] })
        const transactionData = {
            type: model.type,
            from: asset,
            to: await model.getCoinTo({ attributes: ['name', 'symbol'] }),
            from_value: model.from_value,
            to_value: model.to_value,
            rate: model.rate,
            fromApp: app
        };

        return {
            ...pick(model.dataValues, ['id', 'value', 'created_at', 'updated_at', ...schema]),
            ...transactionData
        };
    }
}