import { Balance, Coin, ExchangeRateHistory } from "../models";
import { exchange } from "./Transaction";
import { Op } from "sequelize";
import LocalizationError from '../utils/localizationError';

export default async (user, fromCoinSymbol, toCoinSymbol, value) => {
    fromCoinSymbol = fromCoinSymbol.toUpperCase();
    toCoinSymbol = toCoinSymbol.toUpperCase();
    value = parseFloat(value);

    const fromCoin = await Coin.findOne({
        where: {
            symbol: fromCoinSymbol
        }
    });

    if (!fromCoin) {
        throw new LocalizationError('From coin symbol wrong.');
    }

    const toCoin = await Coin.findOne({
        where: {
            symbol: toCoinSymbol
        }
    });

    if (!toCoin) {
        throw new LocalizationError('To coin symbol wrong.');
    }

    if (!value || value <= 0) {
        throw new LocalizationError('Amount wrong.');
    }

    const latestRate = await ExchangeRateHistory.findOne({
        where: {
            [Op.or]: [
                {
                    from_symbol: fromCoin.symbol,
                    to_symbol: toCoin.symbol
                },
                {
                    from_symbol: toCoin.symbol,
                    to_symbol: fromCoin.symbol
                }
            ]
        },
        order: [['timestamp', 'DESC']]
    });

    if (!latestRate) {
        throw new LocalizationError('No exchange rate for these coins.');
    }

    const rate = latestRate.from_symbol == fromCoin.symbol ? latestRate.rate : (1 / latestRate.rate);

    const balance = await Balance.getBalance(user.id, fromCoin.id);

    if (parseFloat(balance.value) < value) {
        throw new LocalizationError('There are not enough %s on your balance.', fromCoin.symbol);
    }

    try {
        const transaction = await exchange(user, fromCoin, toCoin, value, rate);
        if (transaction) {
            return transaction;
        }
        else {
            throw new LocalizationError('Exchange transaction error.');
        }
    }
    catch (error) {
        throw error;
    }

}