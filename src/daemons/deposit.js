import web3 from '../ethereum';
import axios from 'axios';
import {
    getETHBalance,
    getPIBBalance,
    depositEther,
    depositPIBToken
} from '../ethereum/helpers';

import {
    Wallet,
    Balance,
    Coin,
    User,
    ExternalTransaction,
    sequelize
} from '../models';

import BN from 'bn.js';

var log = require('debug')('daemon:deposit');

const {
    MAIN_ACCOUNT: mainAccount,
    ETHERSCAN_API_HOST: etherscanAPIHost,
    PIBBLE_TOKEN_ADDRESS: pibbleTokenAddress
} = process.env;

const MINIMUM_DEPOSIT_AMOUNT = new BN(process.env.MINIMUM_DEPOSIT_AMOUNT);

const ETHER_COIN_ID = 1;
const PIBBLE_COIN_ID = 2;


export async function DepositMonitor() {

    log('Scanning ETH/PIB Deposit Transactions...');

    const wallets = await Wallet.findAll({
        include: [{
            model: Coin,
            where: {
                symbol: 'ETH'
            }
        },
        {
            model: User,
            where: {
                deleted_at: {
                    [sequelize.Op.eq]: null
                }
            }

        }]
    });

    for (let item of wallets) {
        try {
            const ethBalance = new BN(await getETHBalance(item.address));
            const pibBalance = new BN(await getPIBBalance(item.address));

            if (ethBalance.gt(MINIMUM_DEPOSIT_AMOUNT)) {
                await getEtherTransaction(item);
            }

            if (pibBalance.gt(MINIMUM_DEPOSIT_AMOUNT)) {
                await getPIBTransaction(item);
            }
        } catch (ex) {
            log('error - ' + ex.message);
        }
    }
}


export async function DepositCollector() {

    log('Collecting funds...');

    const transactions = await sequelize.query(`
    SELECT external_transactions.user_id, external_transactions.coin_id, external_transactions.to_address
    FROM external_transactions
    WHERE type = 1
    AND status = 0
    AND external_transactions.coin_id in (${ETHER_COIN_ID}, ${PIBBLE_COIN_ID})
    GROUP BY external_transactions.user_id, external_transactions.coin_id, external_transactions.to_address
    ORDER BY external_transactions.coin_id
  `, {
            type: sequelize.QueryTypes.SELECT
        });

    for (let item of transactions) {
        let txHash;
        try {
            let wallet = await Wallet.findOne({
                where: {
                    coin_id: item.coin_id,
                    user_id: item.user_id
                }
            });
            if (!wallet) {
                log(`error - wallet doesn't exist ${item.to_address}`);
                continue;
            }
            log(`collecting funds from ${wallet.address}`);
            if (item.coin_id == ETHER_COIN_ID) {
                txHash = await depositEther(wallet.private_key);
                log(`ETH collecting tx was sent: ${txHash}`);
            } else if (item.coin_id == PIBBLE_COIN_ID) {
                txHash = await depositPIBToken(wallet.private_key);
                log(`PIB collecting tx was sent: ${txHash}`);
            }
            await ExternalTransaction.update({
                status: 1,
            }, {
                    where: {
                        type: 1,
                        user_id: item.user_id,
                        coin_id: item.coin_id
                    }
                });
        } catch (ex) {
            log(ex);
        }
    }
}

async function getEtherTransaction(wallet) {

    let newTxCount = 0;

    let lastBlockNumber = await ExternalTransaction.max('block_number', {
        where: {
            user_id: wallet.user_id,
            coin_id: ETHER_COIN_ID
        }
    });

    lastBlockNumber = lastBlockNumber ? lastBlockNumber : 5050000;

    const apiUrl = `${etherscanAPIHost}/api?module=account&action=txlist&address=${wallet.address}&startblock=${lastBlockNumber}&endblock=99999999&sort=asc&apikey=YourApiKeyToken`;

    let {
        data: response
    } = await axios.get(apiUrl);

    if (response.message == 'OK') {
        let balance = await Balance.getBalance(wallet.user_id, ETHER_COIN_ID);

        for (let item of response.result) {
            const txCount = await ExternalTransaction.count({
                where: {
                    transaction_hash: item.hash
                }
            });
            if (item.to.toLowerCase() == wallet.address.toLowerCase() &&
                item.from.toLowerCase() != mainAccount.toLowerCase() &&
                item.value &&
                txCount < 1) {
                let value = web3.utils.fromWei(item.value);
                let externalTransaction = await ExternalTransaction.create({
                    value: value,
                    from_address: item.from,
                    to_address: item.to,
                    type: 1,
                    transaction_hash: item.hash,
                    block_number: item.blockNumber,
                    user_id: wallet.user_id,
                    coin_id: ETHER_COIN_ID,
                    status: 0
                });

                balance.value = parseFloat(balance.value) + parseFloat(value);

                log(`Deposit ETH Tx - value: ${value} ETH, from: ${item.from} to: ${item.to}`);

                newTxCount++;
            }
        }
        if (newTxCount) {
            await balance.save();
        }
    }

    return newTxCount;
}

async function getPIBTransaction(wallet) {
    let newTxCount = 0;

    let lastBlockNumber = await ExternalTransaction.max('block_number', {
        where: {
            user_id: wallet.user_id,
            coin_id: PIBBLE_COIN_ID
        }
    });

    lastBlockNumber = lastBlockNumber ? lastBlockNumber : 5050000;

    const apiUrl = `${etherscanAPIHost}/api?module=account&action=tokentx&contractaddress=${pibbleTokenAddress}&address=${wallet.address}&page=1&offset=100&startblock=${lastBlockNumber}&endblock=99999999&sort=asc&apikey=YourApiKeyToken`;

    let {
        data: response
    } = await axios.get(apiUrl);

    if (response.message == 'OK') {
        let balance = await Balance.getBalance(wallet.user_id, PIBBLE_COIN_ID);

        for (let item of response.result) {
            const txCount = await ExternalTransaction.count({
                where: {
                    transaction_hash: item.hash
                }
            });
            if (item.to.toLowerCase() == wallet.address.toLowerCase() && item.value && txCount < 1) {
                let value = web3.utils.fromWei(item.value);
                let externalTransaction = await ExternalTransaction.create({
                    value: value,
                    from_address: item.from,
                    to_address: item.to,
                    type: 1,
                    transaction_hash: item.hash,
                    block_number: item.blockNumber,
                    user_id: wallet.user_id,
                    coin_id: PIBBLE_COIN_ID,
                    status: 0
                });

                balance.value = parseFloat(balance.value) + parseFloat(value);

                log(`Deposit PIB Tx value: ${value} PIB, from: ${item.from} to: ${item.to}`);

                newTxCount++;
            }
        }

        if (newTxCount) {
            await balance.save();
        }
    }

    return newTxCount;
}