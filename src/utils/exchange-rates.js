import axios from 'axios';
import config from '../config';
import moment from "moment/moment";

export const getKryptoRates = async () => {
    const pairs = ['PIB_BTC', 'ETH_BTC', 'BTC_USDT', 'ETH_USDT'];
    const { data } = await axios.get('https://p.kryptono.exchange/k/api/v2/market-price');

    return data
        .filter(({ symbol }) => pairs.includes(symbol))
        .map(({ symbol, price: rate, updated_time: timestamp }) => {
            const [ from_symbol, to_symbol ] = symbol.split('_');

            return { from_symbol, to_symbol, rate: parseFloat(rate), timestamp: moment(parseInt(timestamp)) };
        });
};

export const getForexRates = async () => {
    const source = 'USD';
    const currencies = ['KRW','AUD','GBP','CAD','CNY','EUR','JPY'];
    let { data: { timestamp, quotes } } = await axios.get('http://apilayer.net/api/live', {
        params: { source, currencies: currencies.join(','), access_key: config.CURRENCYLAYER_ACCESS_KEY, format: 1 }
    });

    timestamp = moment.unix(parseInt(timestamp));

    const result = [];

    for (const pair in quotes) {
        result.push({
            from_symbol: source,
            to_symbol: pair.replace(source, ''),
            rate: parseFloat(quotes[pair]),
            timestamp
        });
    }

    return result;
};