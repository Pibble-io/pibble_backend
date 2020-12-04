import amqp from 'amqplib';
import bitcoin from './index';

import {
  Wallet,
  Balance,
  Coin,
  ExternalTransaction,
  sequelize
} from '../models';

export default () => {
  amqp.connect(`amqp://${process.env.AMQP_USERNAME}:${process.env.AMQP_PASSWORD}@${process.env.AMQP_HOST}`)
    .then(connection => {
      return connection.createChannel();
    })
    .then(channel => {
      console.log("Connected to Rabbitmq Server");

      const q = 'pibble.deposit.bitcoin';
      channel.assertQueue(q, {
        durable: false
      });

      console.log(" [*] Waiting for BTC transaction messages in %s", q);
      channel.consume(q, function (msg) {
        const txId = msg.content.toString();
        console.log(" [x] Received BTC txID: %s", txId);
        checkTransaction(txId);
      }, {
        noAck: true
      });
    })
    .catch(console.error);
}

function checkTransaction(txId) {
  bitcoin.getTransaction(txId).then(async (tx) => {
      if (tx.confirmations > 0) {
        for (let item of tx.details) {
          if (item.category == 'receive') {
            const exists = await ExternalTransaction.count({
              where: {
                transaction_hash: tx.txid
              }
            });

            if (!exists) {
              deposit(tx.txid, item);
            }
          }
        }
      }
    })
    .catch(console.error);
}

async function deposit(txId, txItem) {
  const wallet = await Wallet.findOne({
    where: {
      address: txItem.address
    },
    include: [{
      model: Coin,
      where: {
        symbol: 'BTC'
      }
    }]
  });

  if (wallet) {

    let tx;
    try {
      tx = await sequelize.transaction();

      let balance = await Balance.getBalance(wallet.user_id, wallet.coin_id);
      balance.value = parseFloat(balance.value) + parseFloat(txItem.amount);
      await balance.save({
        transaction: tx
      });

      const externalTransaction = await ExternalTransaction.create({
        value: txItem.amount,
        from_address: 'BTC',
        to_address: txItem.address,
        type: 1,
        transaction_hash: txId,
        block_number: null,
        user_id: wallet.user_id,
        coin_id: wallet.coin_id,
        status: 1
      }, {
        transaction: tx
      });
      await tx.commit();
    } catch (error) {
      console.log(error);
      await tx.rollback();
    }
  }
}