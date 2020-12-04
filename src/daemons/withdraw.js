import {
    Coin,
    ExternalTransaction,
    sequelize
} from '../models';

import {
    withdrawEther,
    withdrawToken
} from '../ethereum/helpers';
import {
    withdrawBitcoin
} from '../bitcoin/helpers';

var log = require('debug')('daemon:withdraw');

export async function WithdrawMonitor() {

    log('checking requests...');

    const requests = await ExternalTransaction.findAll({
        include: [{
            model: Coin
        }],
        where: {
            type: 0,
            status: 0
        }
    });

    for (let item of requests) {
        try {
            let balance = await getBalance(item.user_id, item.coin_id);

            log(`UserId=${item.user_id}, CoindId=${item.coin_id}, Real Balance=${balance}`);

            // if (balance < 0) {
            //     item.status = 2;
            //     await item.save();
            // } else {
                let txHash;
                let value = parseFloat(item.value);
                if (item.coin.symbol === 'ETH') {
                    txHash = await withdrawEther(item.to_address, item.value);
                } else if (item.coin.symbol === 'PIB') {
                    txHash = await withdrawToken(item.to_address, item.value);
                } else if (item.coin.symbol === 'BTC') {
                    txHash = await withdrawBitcoin(item.to_address, item.value);
                } else {
                    log(`fail - unsupported coin: recipient: ${item.to_address}, value: ${value} ${item.coin.symbol}`);
                    continue;
                }

                if (!txHash) {
                    log(`fail - tx error: recipient: ${item.to_address}, value: ${value} ${item.coin.symbol}`);
                    continue;
                }

                item.transaction_hash = txHash;
                item.status = 1;
                await item.save();
                log(`success - tx hash: ${txHash}, recipient: ${item.to_address}, value: ${value} ${item.coin.symbol}`);
            // }
        } catch (error) {
            log(`error - ${error.message} : ${item.coin.symbol}, recipient: ${item.to_address}, value: ${item.value}`);
        }
    }
}

async function getBalance(userId, coinId) {
    const res = await sequelize.query(`
    SELECT
        (SELECT	SUM(CASE	WHEN to_coin_id = :coinId THEN to_value
                        WHEN from_coin_id = :coinId THEN -from_value
                        ELSE 0
                END)
        FROM	exchange_transactions
        WHERE	user_id = :userId) +

        (SELECT	SUM(CASE WHEN type = 1 THEN value
                ELSE -value END)
        FROM	external_transactions
        WHERE	user_id = :userId) +

        (SELECT	SUM(CASE	WHEN to_user_id = :userId THEN value * (1 - fee * 0.01)
                        WHEN from_user_id = :userId THEN -value
                        ELSE 0
                END)
        FROM	digital_goods_transactions

        WHERE	coin_id = :coinId) +
        
        (SELECT	SUM(value)
        FROM	airdrops
        WHERE	user_id = :userId
        AND		coin_id = :coinId) +

        (SELECT	SUM(CASE	WHEN to_user_id = :userId THEN value
                            WHEN from_user_id = :userId THEN -value
                            ELSE 0
                    END)
        FROM	internal_transactions
        WHERE	coin_id = :coinId) AS balance
  `, {
        replacements: {
            coinId: coinId,
            userId: userId
        },
        type: sequelize.QueryTypes.SELECT
    });

    return res[0].balance;
}