import moment from 'moment/moment';
import { Op } from 'sequelize';
import {
    Balance,
    Coin,
    RewardTransaction,
    UpVote,
    Level,
    PostPromotion,
    PostPromotionTransaction,
    Setting,
    sequelize
} from '../models';
import config from '../config';
import { SystemEventEmitter } from '../utils/system_events';
import LocalizationError from '../utils/localizationError';
import Notifications from '../utils/notifications';


const rewardTransactionType = parseInt(config.REWARD_TRANSACTION_TYPE);
const rewardFreeTransactionType = parseInt(config.REWARD_FREE_TRANSACTION_TYPE);
const rewardBaseLimit = parseInt(config.REWARD_BASE_COUNT_LIMIT_PER_DAY);
const rewardFreeLimit = parseInt(config.REWARD_COUNT_FREE_LIMIT_PER_DAY);
const rewardCoinSymbol = config.REWARD_COIN_SYMBOL;
// const rewardAmount = parseFloat(config.REWARD_AMOUNT);
const rewardAmount = PostPromotionTransaction.rewardAmount
const rewardAmountActionButton = PostPromotionTransaction.rewardAmountActionButton

const referralTransactionType = parseInt(config.REFERRAL_TRANSACTION_TYPE);
const deleteMediaPostTransactionType = parseInt(config.DELETE_MEDIA_POST_TRANSACTION_TYPE);
const voteTransactionType = parseInt(config.VOTE_TRANSACTION_TYPE);
const voteRewardCoinSymbol = config.VOTE_REWARD_COIN_SYMBOL;
const voteExchangeRate = config.VOTE_EXCHANGE_RATE;
const voteMinAmount = parseFloat(config.VOTE_MIN_AMOUNT);
const voteBaseMaxAmount = parseFloat(config.VOTE_BASE_MAX_AMOUNT);
const voteBaseLimit = parseInt(config.VOTE_BASE_COUNT_LIMIT_PER_DAY);
const voteLimitForUser = parseInt(config.VOTE_COUNT_LIMIT_FOR_USER_PER_DAY);

const voteCommentTransactionType = parseInt(config.VOTE_COMMENT_TRANSACTION_TYPE);

const voteProfileLimitForUser = parseInt(config.VOTE_PROFILE_COUNT_LIMIT_FOR_USER_PER_DAY);
const voteProfileTransactionType = parseInt(config.VOTE_PROFILE_TRANSACTION_TYPE);

const reward10minChallengeTransactionType = parseInt(config.REWARD_10_MIN_CHALLENGE_TRANSACTION_TYPE);
const rewardHourlyChallengeTransactionType = parseInt(config.REWARD_HOURLY_CHALLENGE_TRANSACTION_TYPE);
const rewardDailyChallengeTransactionType = parseInt(config.REWARD_DAILY_CHALLENGE_TRANSACTION_TYPE);

export async function mediaPostUploadedTransfer(user) {
    const countTransactions = await RewardTransaction.count({
        where: {
            to_user_id: user.id,
            created_at: {
                [Op.gt]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 30 MINUTE)')
            },
            type: {
                [Op.in]: [rewardTransactionType, rewardFreeTransactionType]
            }
        }
    });

    const dailyCountTransactions = await RewardTransaction.count({
        where: {
            to_user_id: user.id,
            created_at: {
                [Op.gt]: sequelize.literal('DATE_SUB(CURDATE(), INTERVAL 1 DAY)')
            },
            type: {
                [Op.in]: [rewardTransactionType, rewardFreeTransactionType]
            }
        }
    });

    if (countTransactions < 1 && dailyCountTransactions < rewardBaseLimit * Math.floor(Math.sqrt(user.level))) {
        const rewardCoin = await Coin.findOne({
            where: {
                symbol: rewardCoinSymbol
            }
        });

        const userBalance = await Balance.getBalance(user.id, rewardCoin.id);
        const amount = RewardTransaction.getPostRewardAmount(user.level);

        await RewardTransaction.create({
            to_value: amount,
            to_coin_id: rewardCoin.id,
            to_user_id: user.id,
            type: rewardTransactionType
        });


        userBalance.value = parseFloat(userBalance.value) + amount;
        await userBalance.save();
    }
}

export async function digitalGoodsBuyingReward(toUser, rewardValue, tx = null) {
    const rewardCoinId = 2;
    const userBalance = await Balance.getBalance(toUser.id, rewardCoinId);

    await RewardTransaction.create({
        to_value: rewardValue,
        to_coin_id: rewardCoinId,
        to_user_id: toUser.id,
        type: rewardTransactionType
    }, { transaction: tx });

    userBalance.value = parseFloat(userBalance.value) + rewardValue;
    await userBalance.save({ transaction: tx });

}

export async function postUpvotedTransfer(fromUser, toUser, fromValue = voteMinAmount, tx = null) {
    fromValue = parseFloat(fromValue);

    if (fromUser.id === toUser.id) {
        throw new LocalizationError('You cant UpVote your own post.');
    }

    /* Check Amount */
    const voteMaxAmount = voteBaseMaxAmount * fromUser.level;

    if (fromValue < voteMinAmount) {
        throw new LocalizationError('Amount value must be exactly or greater than %s.', voteMinAmount);
    }

    if (fromValue > voteMaxAmount) {
        throw new LocalizationError('Amount value must be exactly or less than %s.', voteMaxAmount);
    }

    const fromCoin = await Coin.findOne({
        where: {
            symbol: rewardCoinSymbol
        }
    });
    const fromUserBalance = await Balance.getBalance(fromUser.id, fromCoin.id);

    /* Check vote limits */
    const voteLimit = voteBaseLimit * fromUser.level;

    const upVotes = await UpVote.findAll({
        where: {
            user_id: fromUser.id,
            entity_type: 'post',
            created_at: {
                [Op.gte]: moment().subtract(1, 'days')
            }
        },
        include: ['post']
    });

    if (upVotes.length >= voteLimit) {
        throw new LocalizationError('You have reached the limit of UpVote posts in the last 24 hours.');
    }

    /* Check vote user limits */
    const countAuthor = upVotes.reduce((count, { post: { dataValues: { user_id } } }) => count + (user_id === toUser.id), 0);

    if (countAuthor >= voteLimitForUser) {
        throw new LocalizationError('You have reached the limit of UpVotes posts for this user in the last 24 hours.');
    }

    if (fromUserBalance.value < fromValue) {
        if (fromValue !== voteMinAmount) {
            throw new LocalizationError('There are not enough %s on your balance.', rewardCoinSymbol);
        }
        else {
            // Temp feature - free UpVote.
            const rewardFreeLimit = UpVote.getFreeLevelLimit(fromUser.level);
            const rewardsLimit = rewardBaseLimit * Math.floor(Math.sqrt(fromUser.level));

            const { [rewardFreeTransactionType]: countFreeTransactions = 0, [rewardTransactionType]: countTransactions = 0 } = (await RewardTransaction.findAll({
                attributes: ['type', [sequelize.fn('COUNT', sequelize.col('type')), 'count']],
                where: {
                    to_user_id: fromUser.id,
                    created_at: {
                        [Op.gte]: moment().subtract(1, 'days')
                    },
                    type: {
                        [Op.in]: [rewardTransactionType, rewardFreeTransactionType]
                    }
                },
                group: 'type'
            })).reduce((result, { dataValues: { type, count } }) => ({ ...result, [type]: count }), {});

            if (countFreeTransactions < rewardFreeLimit && countTransactions < rewardsLimit) {
                await RewardTransaction.create({
                    to_value: fromValue,
                    to_coin_id: fromCoin.id,
                    to_user_id: fromUser.id,
                    type: rewardFreeTransactionType
                }, { transaction: tx });

                fromUserBalance.value = parseFloat(fromUserBalance.value) + fromValue;
                await fromUserBalance.save({ transaction: tx });
            }
            else {
                throw new LocalizationError('There are not enough %s on your balance (reached the limit of free rewards in the last 24 hours.).', rewardCoinSymbol);
            }
        }
    }

    const toCoin = await Coin.findOne({
        where: {
            symbol: voteRewardCoinSymbol
        }
    });
    const toUserBalance = await Balance.getBalance(toUser.id, toCoin.id);
    const toValue = fromValue * voteExchangeRate;

    await RewardTransaction.create({
        from_value: fromValue,
        from_coin_id: fromCoin.id,
        from_user_id: fromUser.id,
        to_value: toValue,
        to_coin_id: toCoin.id,
        to_user_id: toUser.id,
        type: voteTransactionType
    }, { transaction: tx });

    fromUserBalance.value = parseFloat(fromUserBalance.value) - fromValue;
    await fromUserBalance.save({ transaction: tx });

    toUserBalance.value = parseFloat(toUserBalance.value) + toValue;
    await toUserBalance.save({ transaction: tx });
    await rewardUserLevelPoints(fromUser, Math.ceil(fromValue / 10 * Math.sqrt(fromUser.level)), tx);
    await rewardUserLevelPoints(toUser, toUser.level, tx);
}

export async function referralTransfer(referralOwnerId, invitedUserId) {
    const referralOwnerValue = 300;
    const invitedUserValue = 500;

    const fromCoin = await Coin.findOne({
        where: {
            symbol: voteRewardCoinSymbol
        }
    });
    const referralOwnerBalance = await Balance.getBalance(referralOwnerId, fromCoin.id);
    const invitedUserBalance = await Balance.getBalance(invitedUserId, fromCoin.id);

    referralOwnerBalance.value = parseFloat(referralOwnerBalance.value) + referralOwnerValue;
    await referralOwnerBalance.save();

    await RewardTransaction.create({
        from_value: referralOwnerValue,
        to_value: referralOwnerValue,
        from_coin_id: fromCoin.id,
        to_coin_id: fromCoin.id,
        from_user_id: null,
        to_user_id: referralOwnerId,
        type: referralTransactionType
    });


    invitedUserBalance.value = parseFloat(invitedUserBalance.value) + invitedUserValue;
    await invitedUserBalance.save();

    await RewardTransaction.create({
        from_value: invitedUserValue,
        to_value: invitedUserValue,
        from_coin_id: fromCoin.id,
        to_coin_id: fromCoin.id,
        from_user_id: null,
        to_user_id: invitedUserId,
        type: referralTransactionType
    });
}

export async function deleteMediaPostTransfer(fromUser, fromValue) {
    fromValue = parseFloat(fromValue);

    const fromCoin = await Coin.findOne({
        where: {
            symbol: voteRewardCoinSymbol
        }
    });
    const fromUserBalance = await Balance.getBalance(fromUser.id, fromCoin.id);

    if (fromUserBalance.value < fromValue) {
        throw new LocalizationError('There are not enough %s on your balance (reached the limit of free rewards in the last 24 hours.). Your balance is %s - needs %s.', rewardCoinSymbol, fromUserBalance.value, fromValue);
    }


    await RewardTransaction.create({
        from_value: fromValue,
        from_coin_id: fromCoin.id,
        from_user_id: fromUser.id,
        to_value: fromValue,
        to_coin_id: fromCoin.id,
        to_user_id: null,
        type: deleteMediaPostTransactionType
    });

    fromUserBalance.value = parseFloat(fromUserBalance.value) - fromValue;
    await fromUserBalance.save();
}

export async function commentUpvotedTransfer(fromUser, toUser, fromValue = voteMinAmount) {
    fromValue = parseFloat(fromValue);

    if (fromUser.id === toUser.id) {
        throw new LocalizationError('You cant UpVote your own comment.');
    }

    /* Check Amount */
    const voteMaxAmount = voteBaseMaxAmount * fromUser.level;

    if (fromValue < voteMinAmount) {
        throw new LocalizationError('Amount value must be exactly or greater than %s.', voteMinAmount);
    }

    if (fromValue > voteMaxAmount) {
        throw new LocalizationError('Amount value must be exactly or less than %s.', voteMaxAmount);
    }

    const fromCoin = await Coin.findOne({
        where: {
            symbol: rewardCoinSymbol
        }
    });
    const fromUserBalance = await Balance.getBalance(fromUser.id, fromCoin.id);

    /* Check vote limits */
    const voteLimit = voteBaseLimit * fromUser.level;

    const countUpVotes = await UpVote.count({
        where: {
            user_id: fromUser.id,
            entity_type: 'comment',
            created_at: {
                [Op.gte]: moment().subtract(1, 'days')
            }
        }
    });

    if (countUpVotes >= voteLimit) {
        throw new LocalizationError('You have reached the limit of UpVote comments in the last 24 hours.');
    }

    if (fromUserBalance.value < fromValue) {
        // Temp feature - free UpVote.

        const rewardFreeLimit = UpVote.getFreeLevelLimit(fromUser.level);
        const rewardsLimit = rewardBaseLimit * Math.floor(Math.sqrt(fromUser.level));

        const { [rewardFreeTransactionType]: countFreeTransactions = 0, [rewardTransactionType]: countTransactions = 0 } = (await RewardTransaction.findAll({
            attributes: ['type', [sequelize.fn('COUNT', sequelize.col('type')), 'count']],
            where: {
                to_user_id: fromUser.id,
                created_at: {
                    [Op.gte]: moment().subtract(1, 'days')
                },
                type: {
                    [Op.in]: [rewardTransactionType, rewardFreeTransactionType]
                }
            },
            group: 'type'
        })).reduce((result, { dataValues: { type, count } }) => ({ ...result, [type]: count }), {});

        if (countFreeTransactions < rewardFreeLimit && countTransactions < rewardsLimit) {
            await RewardTransaction.create({
                to_value: fromValue,
                to_coin_id: fromCoin.id,
                to_user_id: fromUser.id,
                type: rewardFreeTransactionType
            });

            fromUserBalance.value = parseFloat(fromUserBalance.value) + fromValue;
            await fromUserBalance.save();
        }
        else {
            throw new LocalizationError('There are not enough %s on your balance (reached the limit of free rewards in the last 24 hours.).', rewardCoinSymbol);
        }
    }

    const toCoin = await Coin.findOne({
        where: {
            symbol: voteRewardCoinSymbol
        }
    });
    const toUserBalance = await Balance.getBalance(toUser.id, toCoin.id);
    const toValue = fromValue * voteExchangeRate;

    await RewardTransaction.create({
        from_value: fromValue,
        from_coin_id: fromCoin.id,
        from_user_id: fromUser.id,
        to_value: toValue,
        to_coin_id: toCoin.id,
        to_user_id: toUser.id,
        type: voteCommentTransactionType
    });

    fromUserBalance.value = parseFloat(fromUserBalance.value) - fromValue;
    await fromUserBalance.save();

    toUserBalance.value = parseFloat(toUserBalance.value) + toValue;
    await toUserBalance.save();

    await rewardUserLevelPoints(fromUser, Math.ceil(fromValue / 10 * Math.sqrt(fromUser.level)));
    await rewardUserLevelPoints(toUser, toUser.level);
}

export async function rewardUserLevelPoints(user, points, tx = null) {
    let { dataValues: { level_points } } = user;

    level_points += parseInt(points);

    await user.update({ level_points }, { transaction: tx });

    const level = await Level.findOne({
        where: {
            points_earn: {
                [Op.lte]: level_points
            },
            id: {
                [Op.gt]: user.level
            }
        },
        order: [
            ['points_earn', 'DESC'],
        ]
    });

    if (level && level.id !== user.level) {
        await user.setLevels(level, { transaction: tx });

        SystemEventEmitter.emit('level_up', user, level);

    }
}

export async function profileUpvotedTransfer(fromUser, toUser, fromValue = voteMinAmount) {
    fromValue = parseFloat(fromValue);

    if (fromUser.id === toUser.id) {
        throw new LocalizationError('You cant UpVote your own profile.');
    }

    /* Check Amount */
    const voteMaxAmount = voteBaseMaxAmount * fromUser.level;

    if (fromValue < voteMinAmount) {
        throw new LocalizationError('Amount value must be exactly or greater than %s.', voteMinAmount);
    }

    if (fromValue > voteMaxAmount) {
        throw new LocalizationError('Amount value must be exactly or less than %s.', voteMaxAmount);
    }

    const fromCoin = await Coin.findOne({
        where: {
            symbol: rewardCoinSymbol
        }
    });
    const fromUserBalance = await Balance.getBalance(fromUser.id, fromCoin.id);

    /* Check vote limits */
    const voteLimit = voteBaseLimit * fromUser.level;

    const upVotes = await UpVote.findAll({
        where: {
            user_id: fromUser.id,
            entity_type: 'profile',
            created_at: {
                [Op.gte]: moment().subtract(1, 'days')
            }
        }
    });

    if (upVotes.length >= voteLimit) {
        throw new LocalizationError('You have reached the limit of UpVote profiles in the last 24 hours.');
    }

    /* Check vote user limits */
    const countProfile = upVotes.reduce((count, { dataValues: { entity_id } }) => count + (entity_id === toUser.id), 0);

    if (countProfile >= voteProfileLimitForUser) {
        throw new LocalizationError('You have reached the limit of UpVote profile for this user in the last 24 hours.');
    }

    if (fromUserBalance.value < fromValue) {
        // Temp feature - free UpVote.

        const rewardFreeLimit = UpVote.getFreeLevelLimit(fromUser.level);
        const rewardsLimit = rewardBaseLimit * Math.floor(Math.sqrt(fromUser.level));

        const { [rewardFreeTransactionType]: countFreeTransactions = 0, [rewardTransactionType]: countTransactions = 0 } = (await RewardTransaction.findAll({
            attributes: ['type', [sequelize.fn('COUNT', sequelize.col('type')), 'count']],
            where: {
                to_user_id: fromUser.id,
                created_at: {
                    [Op.gte]: moment().subtract(1, 'days')
                },
                type: {
                    [Op.in]: [rewardTransactionType, rewardFreeTransactionType]
                }
            },
            group: 'type'
        })).reduce((result, { dataValues: { type, count } }) => ({ ...result, [type]: count }), {});

        if (countFreeTransactions < rewardFreeLimit && countTransactions < rewardsLimit) {
            await RewardTransaction.create({
                to_value: fromValue,
                to_coin_id: fromCoin.id,
                to_user_id: fromUser.id,
                type: rewardFreeTransactionType
            });

            fromUserBalance.value = parseFloat(fromUserBalance.value) + fromValue;
            await fromUserBalance.save();
        }
        else {
            throw new LocalizationError('There are not enough %s on your balance (reached the limit of free rewards in the last 24 hours.).', rewardCoinSymbol);
        }
    }

    const toCoin = await Coin.findOne({
        where: {
            symbol: voteRewardCoinSymbol
        }
    });
    const toUserBalance = await Balance.getBalance(toUser.id, toCoin.id);
    const toValue = fromValue * voteExchangeRate;

    await RewardTransaction.create({
        from_value: fromValue,
        from_coin_id: fromCoin.id,
        from_user_id: fromUser.id,
        to_value: toValue,
        to_coin_id: toCoin.id,
        to_user_id: toUser.id,
        type: voteProfileTransactionType
    });

    fromUserBalance.value = parseFloat(fromUserBalance.value) - fromValue;
    await fromUserBalance.save();

    toUserBalance.value = parseFloat(toUserBalance.value) + toValue;
    await toUserBalance.save();

    await rewardUserLevelPoints(fromUser, Math.ceil(fromValue / 10 * Math.sqrt(fromUser.level)));
    await rewardUserLevelPoints(toUser, toUser.level);
}

//promotion
export async function promotionImpressionTransfer(postId, fromUser, toUser, tx = null) {

    const promotion = await PostPromotion.findOne({
        where: {
            post_id: postId,
            is_paused: false,
            [Op.and]: [
                //Not expired
                sequelize.literal('current_date <= DATE_ADD(`post_promotion`.`created_at`, INTERVAL `duration` DAY)'),
            ]
        }
    });

    if (!promotion || fromUser.id === toUser.id) {
        return true;
    }

    const actionImpressionBudget = await promotion.getImpressionBudgetLeft();

    if (actionImpressionBudget - rewardAmount < 0) {
        throw new Notifications('The whole budget has already been spent.');
    }

    const setting = await Setting.all();

    const isExist = await PostPromotionTransaction.count({
        where: {
            promotion_id: promotion.id,
            type: PostPromotionTransaction.postPromotionImpressionTransactionType,
            to_user_id: toUser.id,
        }
    });

    if (isExist) {
        throw new Notifications('You have already received %s.', setting['promotion_coin_symbol']);
    }


    const coin = await Coin.findOne({
        where: {
            symbol: setting['promotion_coin_symbol']
        }
    });

    await PostPromotionTransaction.create({
        promotion_id: promotion.id,
        from_value: rewardAmount,
        from_coin_id: coin.id,
        from_user_id: fromUser.id,
        to_value: rewardAmount,
        to_coin_id: coin.id,
        to_user_id: toUser.id,
        type: PostPromotionTransaction.postPromotionImpressionTransactionType,
    }, { transaction: tx });

    const toUserBalance = await Balance.getBalance(toUser.id, coin.id);
    toUserBalance.value = parseFloat(toUserBalance.value) + rewardAmount;
    await toUserBalance.save({ transaction: tx });

}

//promotion
export async function promotionFollowTransfer(postId, fromUserId, toUser, tx = null) {

    const promotion = await PostPromotion.findOne({
        where: {
            post_id: postId,
            is_paused: false,
            [Op.and]: [
                //Not expired
                sequelize.literal('current_date <= DATE_ADD(`post_promotion`.`created_at`, INTERVAL `duration` DAY)'),
            ]
        }
    });

    if (!promotion || fromUserId === toUser.id) {
        return true;
    }

    const actionBudget = await promotion.getActionsBudgetLeft();

    if (actionBudget - rewardAmount < 0) {
        throw new Notifications('The whole budget has already been spent.');
    }

    const setting = await Setting.all();

    const isExist = await PostPromotionTransaction.count({
        where: {
            promotion_id: promotion.id,
            type: PostPromotionTransaction.postPromotionFollowTransactionType,
            to_user_id: toUser.id,
        }
    });

    if (isExist) {
        throw new Notifications('You have already received %s.', setting['promotion_coin_symbol']);
    }


    const coin = await Coin.findOne({
        where: {
            symbol: setting['promotion_coin_symbol']
        }
    });

    await PostPromotionTransaction.create({
        promotion_id: promotion.id,
        from_value: rewardAmount,
        from_coin_id: coin.id,
        from_user_id: fromUserId,
        to_value: rewardAmount,
        to_coin_id: coin.id,
        to_user_id: toUser.id,
        type: PostPromotionTransaction.postPromotionFollowTransactionType,
    }, { transaction: tx });

    const toUserBalance = await Balance.getBalance(toUser.id, coin.id);
    toUserBalance.value = parseFloat(toUserBalance.value) + rewardAmount;
    await toUserBalance.save({ transaction: tx });

}

//promotion
export async function promotionCollectTransfer(postId, fromUser, toUser, tx = null) {

    const promotion = await PostPromotion.findOne({
        where: {
            post_id: postId,
            is_paused: false,
            [Op.and]: [
                //Not expired
                sequelize.literal('current_date <= DATE_ADD(`post_promotion`.`created_at`, INTERVAL `duration` DAY)'),
            ]
        }
    });

    if (!promotion || fromUser.id === toUser.id) {
        return true;
    }

    const actionBudget = await promotion.getActionsBudgetLeft();

    if (actionBudget - rewardAmount < 0) {
        throw new Notifications('The whole budget has already been spent.');
    }

    const setting = await Setting.all();

    const isExist = await PostPromotionTransaction.count({
        where: {
            promotion_id: promotion.id,
            type: PostPromotionTransaction.postPromotionCollectTransactionType,
            to_user_id: toUser.id,
        }
    });

    if (isExist) {
        throw new Notifications('You have already received %s.', setting['promotion_coin_symbol']);
    }


    const coin = await Coin.findOne({
        where: {
            symbol: setting['promotion_coin_symbol']
        }
    });

    await PostPromotionTransaction.create({
        promotion_id: promotion.id,
        from_value: rewardAmount,
        from_coin_id: coin.id,
        from_user_id: fromUser.id,
        to_value: rewardAmount,
        to_coin_id: coin.id,
        to_user_id: toUser.id,
        type: PostPromotionTransaction.postPromotionCollectTransactionType,
    }, { transaction: tx });

    const toUserBalance = await Balance.getBalance(toUser.id, coin.id);
    toUserBalance.value = parseFloat(toUserBalance.value) + rewardAmount;
    await toUserBalance.save({ transaction: tx });

}

//promotion
export async function promotionCommentedTransfer(postId, fromUser, toUser, tx = null) {

    const promotion = await PostPromotion.findOne({
        where: {
            post_id: postId,
            is_paused: false,
            [Op.and]: [
                //Not expired
                sequelize.literal('current_date <= DATE_ADD(`post_promotion`.`created_at`, INTERVAL `duration` DAY)'),
            ]
        }
    });

    if (!promotion || fromUser.id === toUser.id) {
        return true;
    }

    const actionBudget = await promotion.getActionsBudgetLeft();

    if (actionBudget - rewardAmount < 0) {
        throw new Notifications('The whole budget has already been spent.');
    }

    const setting = await Setting.all();

    const isExist = await PostPromotionTransaction.count({
        where: {
            promotion_id: promotion.id,
            type: PostPromotionTransaction.postPromotionCommentTransactionType,
            to_user_id: toUser.id,
        }
    });

    if (isExist) {
        throw new Notifications('You have already received %s.', setting['promotion_coin_symbol']);
    }


    const coin = await Coin.findOne({
        where: {
            symbol: setting['promotion_coin_symbol']
        }
    });

    await PostPromotionTransaction.create({
        promotion_id: promotion.id,
        from_value: rewardAmount,
        from_coin_id: coin.id,
        from_user_id: fromUser.id,
        to_value: rewardAmount,
        to_coin_id: coin.id,
        to_user_id: toUser.id,
        type: PostPromotionTransaction.postPromotionCommentTransactionType,
    }, { transaction: tx });

    const toUserBalance = await Balance.getBalance(toUser.id, coin.id);
    toUserBalance.value = parseFloat(toUserBalance.value) + rewardAmount;
    await toUserBalance.save({ transaction: tx });

}

//promotion
export async function promotionUpVotedTransfer(postId, fromUser, toUser, tx = null) {

    const promotion = await PostPromotion.findOne({
        where: {
            post_id: postId,
            is_paused: false,
            [Op.and]: [
                //Not expired
                sequelize.literal('current_date <= DATE_ADD(`post_promotion`.`created_at`, INTERVAL `duration` DAY)'),
            ]
        }
    });

    if (!promotion || fromUser.id === toUser.id) {
        return true;
    }

    const actionBudget = await promotion.getActionsBudgetLeft();

    if (actionBudget - rewardAmount < 0) {
        throw new Notifications('The whole budget has already been spent.');
    }

    const setting = await Setting.all();


    const isExist = await PostPromotionTransaction.count({
        where: {
            promotion_id: promotion.id,
            type: PostPromotionTransaction.postPromotionUpvoteTransactionType,
            to_user_id: toUser.id,
        }
    });

    if (isExist) {
        throw new Notifications('You have already received %s.', setting['promotion_coin_symbol']);
    }


    const coin = await Coin.findOne({
        where: {
            symbol: setting['promotion_coin_symbol']
        }
    });

    await PostPromotionTransaction.create({
        promotion_id: promotion.id,
        from_value: rewardAmount,
        from_coin_id: coin.id,
        from_user_id: fromUser.id,
        to_value: rewardAmount,
        to_coin_id: coin.id,
        to_user_id: toUser.id,
        type: PostPromotionTransaction.postPromotionUpvoteTransactionType,
    }, { transaction: tx });

    const toUserBalance = await Balance.getBalance(toUser.id, coin.id);
    toUserBalance.value = parseFloat(toUserBalance.value) + rewardAmount;
    await toUserBalance.save({ transaction: tx });

}

//promotion
export async function promotionFollowTagTransfer(postId, fromUser, toUser, tx = null) {

    const promotion = await PostPromotion.findOne({
        where: {
            post_id: postId,
            is_paused: false,
            [Op.and]: [
                //Not expired
                sequelize.literal('current_date <= DATE_ADD(`post_promotion`.`created_at`, INTERVAL `duration` DAY)'),
            ]
        }
    });

    if (!promotion || fromUser.id === toUser.id) {
        return true;
    }

    const actionBudget = await promotion.getActionsBudgetLeft();

    if (actionBudget - rewardAmount < 0) {
        throw new Notifications('The whole budget has already been spent.');
    }

    const setting = await Setting.all();


    const isExist = await PostPromotionTransaction.count({
        where: {
            promotion_id: promotion.id,
            type: PostPromotionTransaction.postPromotionFollowTagTransactionType,
            to_user_id: toUser.id,
        }
    });

    if (isExist) {
        throw new Notifications('You have already received %s.', setting['promotion_coin_symbol']);
    }


    const coin = await Coin.findOne({
        where: {
            symbol: setting['promotion_coin_symbol']
        }
    });

    await PostPromotionTransaction.create({
        promotion_id: promotion.id,
        from_value: rewardAmount,
        from_coin_id: coin.id,
        from_user_id: fromUser.id,
        to_value: rewardAmount,
        to_coin_id: coin.id,
        to_user_id: toUser.id,
        type: PostPromotionTransaction.postPromotionFollowTagTransactionType,
    }, { transaction: tx });

    const toUserBalance = await Balance.getBalance(toUser.id, coin.id);
    toUserBalance.value = parseFloat(toUserBalance.value) + rewardAmount;
    await toUserBalance.save({ transaction: tx });

}

//promotion
export async function promotionProfileViewTransfer(postId, fromUser, toUser, tx = null) {

    const promotion = await PostPromotion.findOne({
        where: {
            post_id: postId,
            is_paused: false,
            [Op.and]: [
                //Not expired
                sequelize.literal('current_date <= DATE_ADD(`post_promotion`.`created_at`, INTERVAL `duration` DAY)'),
            ]
        }
    });

    if (!promotion || fromUser.id === toUser.id) {
        return true;
    }

    const actionBudget = await promotion.getActionsBudgetLeft();

    if (actionBudget - rewardAmount < 0) {
        throw new Notifications('The whole budget has already been spent.');
    }

    const setting = await Setting.all();


    const isExist = await PostPromotionTransaction.count({
        where: {
            promotion_id: promotion.id,
            type: PostPromotionTransaction.postPromotionProfileViewTransactionType,
            to_user_id: toUser.id,
        }
    });

    if (isExist) {
        throw new Notifications('You have already received %s.', setting['promotion_coin_symbol']);
    }


    const coin = await Coin.findOne({
        where: {
            symbol: setting['promotion_coin_symbol']
        }
    });

    await PostPromotionTransaction.create({
        promotion_id: promotion.id,
        from_value: rewardAmount,
        from_coin_id: coin.id,
        from_user_id: fromUser.id,
        to_value: rewardAmount,
        to_coin_id: coin.id,
        to_user_id: toUser.id,
        type: PostPromotionTransaction.postPromotionProfileViewTransactionType,
    }, { transaction: tx });

    const toUserBalance = await Balance.getBalance(toUser.id, coin.id);
    toUserBalance.value = parseFloat(toUserBalance.value) + rewardAmount;
    await toUserBalance.save({ transaction: tx });

}

//promotion
export async function promotionAcctionButtonTransfer(postId, fromUser, toUser, tx = null) {

    const promotion = await PostPromotion.findOne({
        where: {
            post_id: postId,
            is_paused: false,
            [Op.and]: [
                //Not expired
                sequelize.literal('current_date <= DATE_ADD(`post_promotion`.`created_at`, INTERVAL `duration` DAY)'),
            ]
        }
    });

    if (!promotion || fromUser.id === toUser.id) {
        return true;
    }

    const actionBudget = await promotion.getActionsBudgetLeft();

    if (actionBudget - rewardAmountActionButton < 0) {
        throw new Notifications('The whole budget has already been spent.');
    }

    const setting = await Setting.all();


    const isExist = await PostPromotionTransaction.count({
        where: {
            promotion_id: promotion.id,
            type: PostPromotionTransaction.postPromotionActionButtonTransactionType,
            to_user_id: toUser.id,
        }
    });

    if (isExist) {
        throw new Notifications('You have already received %s.', setting['promotion_coin_symbol']);
    }


    const coin = await Coin.findOne({
        where: {
            symbol: setting['promotion_coin_symbol']
        }
    });

    await PostPromotionTransaction.create({
        promotion_id: promotion.id,
        from_value: rewardAmountActionButton,
        from_coin_id: coin.id,
        from_user_id: fromUser.id,
        to_value: rewardAmountActionButton,
        to_coin_id: coin.id,
        to_user_id: toUser.id,
        type: PostPromotionTransaction.postPromotionActionButtonTransactionType,
    }, { transaction: tx });

    const toUserBalance = await Balance.getBalance(toUser.id, coin.id);
    toUserBalance.value = parseFloat(toUserBalance.value) + rewardAmountActionButton;
    await toUserBalance.save({ transaction: tx });

}

export async function challenge10minRewardTransfer(toUser, value, tx = null) {
    value = parseFloat(value);

    const PRBValue = value * 0.7;
    const PGBValue = value * 0.3;

    const PRBCoin = await Coin.findOne({
        where: {
            symbol: 'PRB'
        }
    });

    const PGBCoin = await Coin.findOne({
        where: {
            symbol: 'PGB'
        }
    });

    await RewardTransaction.create({
        from_value: PRBValue,
        from_coin_id: PRBCoin.id,
        to_value: PRBValue,
        to_coin_id: PRBCoin.id,
        to_user_id: toUser.id,
        type: reward10minChallengeTransactionType
    }, { transaction: tx });

    await RewardTransaction.create({
        from_value: PGBValue,
        from_coin_id: PGBCoin.id,
        to_value: PGBValue,
        to_coin_id: PGBCoin.id,
        to_user_id: toUser.id,
        type: reward10minChallengeTransactionType
    }, { transaction: tx });

    const PRBUserBalance = await Balance.getBalance(toUser.id, PRBCoin.id);
    PRBUserBalance.value = parseFloat(PRBUserBalance.value) + PRBValue;
    await PRBUserBalance.save({ transaction: tx });

    const PGBUserBalance = await Balance.getBalance(toUser.id, PGBCoin.id);
    PGBUserBalance.value = parseFloat(PGBUserBalance.value) + PGBValue;
    await PGBUserBalance.save({ transaction: tx });
}

export async function challengeHourlyRewardTransfer(toUser, value, tx = null) {
    value = parseFloat(value);

    const PRBValue = value * 0.7;
    const PGBValue = value * 0.3;

    const PRBCoin = await Coin.findOne({
        where: {
            symbol: 'PRB'
        }
    });

    const PGBCoin = await Coin.findOne({
        where: {
            symbol: 'PGB'
        }
    });

    await RewardTransaction.create({
        from_value: PRBValue,
        from_coin_id: PRBCoin.id,
        to_value: PRBValue,
        to_coin_id: PRBCoin.id,
        to_user_id: toUser.id,
        type: rewardHourlyChallengeTransactionType
    }, { transaction: tx });

    await RewardTransaction.create({
        from_value: PGBValue,
        from_coin_id: PGBCoin.id,
        to_value: PGBValue,
        to_coin_id: PGBCoin.id,
        to_user_id: toUser.id,
        type: rewardHourlyChallengeTransactionType
    }, { transaction: tx });

    const PRBUserBalance = await Balance.getBalance(toUser.id, PRBCoin.id);
    PRBUserBalance.value = parseFloat(PRBUserBalance.value) + PRBValue;
    await PRBUserBalance.save({ transaction: tx });

    const PGBUserBalance = await Balance.getBalance(toUser.id, PGBCoin.id);
    PGBUserBalance.value = parseFloat(PGBUserBalance.value) + PGBValue;
    await PGBUserBalance.save({ transaction: tx });
}

export async function challengeDailyRewardTransfer(toUser, value, tx = null) {
    value = parseFloat(value);

    const PRBValue = value * 0.7;
    const PGBValue = value * 0.3;

    const PRBCoin = await Coin.findOne({
        where: {
            symbol: 'PRB'
        }
    });

    const PGBCoin = await Coin.findOne({
        where: {
            symbol: 'PGB'
        }
    });

    await RewardTransaction.create({
        from_value: PRBValue,
        from_coin_id: PRBCoin.id,
        to_value: PRBValue,
        to_coin_id: PRBCoin.id,
        to_user_id: toUser.id,
        type: rewardDailyChallengeTransactionType
    }, { transaction: tx });

    await RewardTransaction.create({
        from_value: PGBValue,
        from_coin_id: PGBCoin.id,
        to_value: PGBValue,
        to_coin_id: PGBCoin.id,
        to_user_id: toUser.id,
        type: rewardDailyChallengeTransactionType
    }, { transaction: tx });

    const PRBUserBalance = await Balance.getBalance(toUser.id, PRBCoin.id);
    PRBUserBalance.value = parseFloat(PRBUserBalance.value) + PRBValue;
    await PRBUserBalance.save({ transaction: tx });

    const PGBUserBalance = await Balance.getBalance(toUser.id, PGBCoin.id);
    PGBUserBalance.value = parseFloat(PGBUserBalance.value) + PGBValue;
    await PGBUserBalance.save({ transaction: tx });
}
