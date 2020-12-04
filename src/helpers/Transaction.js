import {
    Balance,
    Post,
    Commerce,
    InternalTransaction,
    DigitalGoodsTransaction,
    Good,
    GoodsOrder,
    GoodsTransaction,
    ExchangeTransaction,
    FundingTransaction,
    CommerceTransaction,
    AssetTransaction,
    sequelize
} from '../models';
import { digitalGoodsBuyingReward } from './rewards-system';
import { createSystemMessage, getRoom } from './chat'
import config from "../config";
import { SystemEventEmitter } from '../utils/system_events';
import LocalizationError from '../utils/localizationError';

export async function internalTransfer(fromUser, toUser, coin, value) {

    let tx = await sequelize.transaction();
    try {
        await InternalTransaction.checkLevelLimit(fromUser, coin, value);

        let senderBalance = await Balance.getBalance(fromUser.id, coin.id);
        let recipientBalance = await Balance.getBalance(toUser.id, coin.id);

        if (parseFloat(senderBalance.value) < value) {
            return false;
        }

        let internalTransaction = await InternalTransaction.create({
            value: value,
            coin_id: coin.id,
            from_user_id: fromUser.id,
            to_user_id: toUser.id,
            type: 0
        }, {
                transaction: tx
            });

        senderBalance.value = parseFloat(senderBalance.value) - value;
        await senderBalance.save({
            transaction: tx
        });

        recipientBalance.value = parseFloat(recipientBalance.value) + value;
        await recipientBalance.save({
            transaction: tx
        });

        await tx.commit();

        return internalTransaction;

    } catch (error) {
        console.log(error);
        await tx.rollback();
        throw error;
    }
}

export async function exchange(user, fromCoin, toCoin, value, rate) {


    const toValue = value * rate;
    let tx = await sequelize.transaction();
    try {
        await ExchangeTransaction.checkLevelLimit(fromCoin, toCoin, user, value);

        let fromBalance = await Balance.getBalance(user.id, fromCoin.id);

        fromBalance.value = parseFloat(fromBalance.value) - value;
        await fromBalance.save({
            transaction: tx
        });

        let toBalance = await Balance.getBalance(user.id, toCoin.id);
        toBalance.value = parseFloat(toBalance.value) + toValue;
        await toBalance.save({
            transaction: tx
        });

        let exchangeTransaction = await ExchangeTransaction.create({
            from_value: value,
            to_value: toValue,
            from_coin_id: fromCoin.id,
            to_coin_id: toCoin.id,
            user_id: user.id,
            rate: rate
        }, {
                transaction: tx
            });

        await tx.commit();

        return exchangeTransaction;

    } catch (error) {
        console.log(error);
        await tx.rollback();
        throw error;
    }
}

export async function exchange_asset(user, asset, toCoin, value) {

    const toValue = value * asset.exchange_rate;
    let tx;
    try {
        tx = await sequelize.transaction();

        let toBalance = await Balance.getBalance(user.id, toCoin.id);
        toBalance.value = parseFloat(toBalance.value) + toValue;
        await toBalance.save({
            transaction: tx
        });

        let assetTransaction = await AssetTransaction.create({
            from_value: value,
            to_value: toValue,
            asset_id: asset.id,
            to_coin_id: toCoin.id,
            user_id: user.id,
            rate: asset.exchange_rate
        }, {
                transaction: tx
            });

        await tx.commit();

        return assetTransaction;

    } catch (error) {
        console.log(error);
        await tx.rollback();
        return false;
    }
}

export async function funding(user, coin, value, post) {
    let tx;
    try {
        tx = await sequelize.transaction();

        let userBalance = await Balance.getBalance(user.id, coin.id);
        userBalance.value = parseFloat(userBalance.value) - value;
        await userBalance.save({
            transaction: tx
        });

        let fundingTransaction = await FundingTransaction.create({
            value,
            coin_id: coin.id,
            from_user_id: user.id,
            post_id: post.id
        }, {
                transaction: tx
            });

        await tx.commit();

        return fundingTransaction;

    } catch (error) {
        console.log(error);
        await tx.rollback();
        return false;
    }
}

export async function commercePosting(user, coin, value, post) {
    let tx;
    try {
        tx = await sequelize.transaction();

        let userBalance = await Balance.getBalance(user.id, coin.id);
        if (parseFloat(userBalance.value) < value) {
            return false;
        }
        userBalance.value = parseFloat(userBalance.value) - value;
        await userBalance.save({
            transaction: tx
        });

        let commerceTransaction = await CommerceTransaction.create({
            value,
            coin_id: coin.id,
            from_user_id: user.id,
            post_id: post.id
        }, {
                transaction: tx
            });

        await tx.commit();

        return commerceTransaction;

    } catch (error) {
        console.log(error);
        await tx.rollback();
        return false;
    }
}

export async function digitalGoodsBuyingTransfer(fromUser, toUser, coin, value, post_id) {

    const chatRoom = await getRoom([fromUser.id, toUser.id], post_id);

    let senderBalance = await Balance.getBalance(fromUser.id, coin.id);
    let recipientBalance = await Balance.getBalance(toUser.id, coin.id);

    if (parseFloat(senderBalance.value) < value) {
        return false;
    }

    let tx, digitalGoodsTransaction;
    try {
        tx = await sequelize.transaction();

        digitalGoodsTransaction = await DigitalGoodsTransaction.create({
            value: value,
            coin_id: coin.id,
            from_user_id: fromUser.id,
            to_user_id: toUser.id,
            fee: config.GOODS_SYSTEM_FEE,
            post_id
        }, {
                transaction: tx
            });

        senderBalance.value = parseFloat(senderBalance.value) - value;
        await senderBalance.save({
            transaction: tx
        });

        //without 30%
        recipientBalance.value = parseFloat(recipientBalance.value) + (value - (config.GOODS_SYSTEM_FEE / 100) * value);
        await recipientBalance.save({
            transaction: tx
        });

        await tx.commit();
    } catch (error) {
        console.log(error);
        await tx.rollback();
        return false;
    }

    createSystemMessage(toUser, { text: i18n.__('Thank you for your purchase. %s PIB has been paid from your wallet.', value), to_user_id: fromUser.id }, chatRoom.id)

    //Buying reward
    const rewardAmount = (config.GOODS_BUYING_REWARD / 100) * value;
    await digitalGoodsBuyingReward(fromUser, rewardAmount);
    createSystemMessage(toUser, { text: i18n.__('Your purchase has been completed, you will reward %s PIB.', rewardAmount) }, chatRoom.id);

    const post = await Post.findOne({
        where: {
            id: post_id
        },
        include: [
            { model: Commerce, as: 'commerce' }
        ]
    })

    SystemEventEmitter.emit('digital_goods_bought', fromUser, post, value);

    return digitalGoodsTransaction;
}

export async function goodsOrderCreateTransfer(fromUser, toUser, coin, value, post_id) {

    let senderBalance = await Balance.getBalance(fromUser.id, coin.id);

    if (parseFloat(senderBalance.value) < value) {
        throw new LocalizationError('Insufficient funds.');
    }

    let tx, goodsOrder, chatRoom;
    try {
        tx = await sequelize.transaction();

        goodsOrder = await GoodsOrder.create({
            freezed_price: value,
            buyer_id: fromUser.id,
            post_id
        }, {
                transaction: tx
            });

        senderBalance.value = parseFloat(senderBalance.value) - value;
        await senderBalance.save({
            transaction: tx
        });

        await GoodsTransaction.create({
            value: value,
            coin_id: coin.id,
            from_user_id: fromUser.id,
            to_user_id: toUser.id,
            fee: config.NO_DIGITAL_GOODS_SYSTEM_FEE,
            type: GoodsTransaction.goodsTransactionTypeEscrow,
            goods_order_id: goodsOrder.id
        }, {
                transaction: tx
            });


        await tx.commit();
    } catch (error) {
        console.log(error);
        await tx.rollback();
        throw Error(error);
    }

    chatRoom = await getRoom([fromUser.id, toUser.id], post_id, goodsOrder.id);
    createSystemMessage(toUser, { text: i18n.__('Thank you for your purchase. %s PIB has been escrowed to the system.', value), order: goodsOrder, to_user_id: fromUser.id }, chatRoom.id)

    return goodsOrder;
}

export async function goodsConfirmTransfer(fromUser, toUser, coin, value, goods_order, tx) {

    const chatRoom = await getRoom([fromUser.id, toUser.id], goods_order.post_id);

    let recipientBalance = await Balance.getBalance(toUser.id, coin.id);

    const goodsTransaction = await GoodsTransaction.create({
        value: value,
        coin_id: coin.id,
        from_user_id: fromUser.id,
        to_user_id: toUser.id,
        fee: config.NO_DIGITAL_GOODS_SYSTEM_FEE,
        type: GoodsTransaction.goodsTransactionTypePay,
        goods_order_id: goods_order.id
    }, {
            transaction: tx
        });

    //without 3%
    recipientBalance.value = parseFloat(recipientBalance.value) + (value - (config.NO_DIGITAL_GOODS_SYSTEM_FEE / 100) * value);
    await recipientBalance.save({
        transaction: tx
    });

    createSystemMessage(toUser, { text: i18n.__('Confirmation completed.'), to_user_id: fromUser.id }, chatRoom.id)

    const post = await Post.findOne({
        where: {
            id: goods_order.post_id
        },
        include: [
            { model: Good, as: 'goods' }
        ]
    })

    SystemEventEmitter.emit('no_digital_goods_bought', fromUser, post, value);

    return goodsTransaction;
}

export async function goodsReturnTransfer(fromUser, toUser, coin, value, goods_order, tx) {

    const chatRoom = await getRoom([fromUser.id, toUser.id], goods_order.post_id);

    let recipientBalance = await Balance.getBalance(toUser.id, coin.id);

    const goodsTransaction = await GoodsTransaction.create({
        value: value,
        coin_id: coin.id,
        from_user_id: fromUser.id,
        to_user_id: toUser.id,
        fee: config.NO_DIGITAL_GOODS_SYSTEM_FEE,
        type: GoodsTransaction.goodsTransactionTypeReturn,
        goods_order_id: goods_order.id
    }, {
            transaction: tx
        });

    recipientBalance.value = parseFloat(recipientBalance.value) + parseFloat(value);
    await recipientBalance.save({
        transaction: tx
    });

    createSystemMessage(toUser, { text: i18n.__('A return request has been arrived.', value), order: goods_order, to_user_id: fromUser.id }, chatRoom.id)

    return goodsTransaction;
}