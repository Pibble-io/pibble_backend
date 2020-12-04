import { Coin, GameAsset } from "../models";
import { exchange_asset } from "./Transaction";
import LocalizationError from '../utils/localizationError';

export default async (appID, user, fromAssetSymbol, toCoinSymbol, value) => {
    fromAssetSymbol = fromAssetSymbol.toUpperCase();
    toCoinSymbol = 'PRB';
    value = parseFloat(value);

    const asset = await GameAsset.findOne({
        where: {
            symbol: fromAssetSymbol,
            game_app_id: appID
        }
    });

    const toCoin = await Coin.findOne({
        where: {
            symbol: toCoinSymbol
        }
    });

    if (!toCoin) {
        throw new LocalizationError('To coin symbol wrong.');
    }

    if (!asset) {
        throw new LocalizationError('Asset symbol wrong.');
    }

    if (!value || value <= 0) {
        throw new LocalizationError('Amount wrong.');
    }

    if (value > asset.limit_amount) {
        throw new LocalizationError('Amount wrong. Limit is: %s',asset.limit_amount);
    }


    const transaction = await exchange_asset(user, asset, toCoin, value);
    if (transaction) {
        return transaction;
    }
    else {
        throw new LocalizationError('Exchange transaction error.');
    }
}