import cron from 'node-cron';
import { Op } from 'sequelize';
import moment from 'moment';
import { Media, ExchangeRateHistory, User, Metric, Setting, Balance, Coin, Wallet, ExternalTransaction, Commerce, LeaderBoard, Post, sequelize } from './models';
import { s3RemoveTagging } from './utils/aws';
import { DepositMonitor, DepositCollector, DepositTroubleshooter } from './daemons/deposit';
import { WithdrawMonitor } from './daemons/withdraw';
import { getKryptoRates, getForexRates } from "./utils/exchange-rates";
import { find } from 'lodash';
import bitDNA from "./helpers/bit_dna";
import { challenge10minRewardTransfer, challengeHourlyRewardTransfer, challengeDailyRewardTransfer } from "./helpers/rewards-system";
import { commercePosting } from "./helpers/Transaction";

const challangeLoggerOpt = {
    errorEventName: 'error',
    logDirectory: 'challange-logs', // NOTE: folder must exist and be writable...
    fileNamePattern: 'challanges-<DATE>.log',
    dateFormat: 'YYYY.MM.DD'
};

// const challangeLogger = require('simple-node-logger').createRollingFileLogger(challangeLoggerOpt);

const checkDigitalGoodsSaleContractsStatus = cron.schedule('*/10 * * * * *', async () => {
    const commerces = await Commerce.findAll({
        where: {
            status: 'pending_contract_deploy'
        },
        include: [{
            as: 'post',
            model: Post,
            where: {
                is_published: 1
            },
            include: ['media']
        }]
    });

    await Promise.all(commerces.map(async (commerce) => {
        //Check SaleContract on bitDNA
        try {
            const contract = await bitDNA.getSaleContract(commerce.id, commerce.post.user_id);
            if (contract && contract.status === 'success' && contract.contract_address) {
                commerce.status = 'success';
                commerce.error_code = null;
                commerce.token_address = contract.contract_address;
                commerce.save();
            }
        } catch (error) {
            commerce.status = 'failed';
            commerce.error_code = 'error_bitdna_service';
            commerce.save();
            console.log('Commerce Cron: ', error);
            return false;
        }
    }));
});

const checkDigitalGoodsMedia = cron.schedule('*/1 * * * *', async () => {
    const commerces = await Commerce.findAll({
        where: {
            status: 'wait',
        },
        include: [{
            as: 'post',
            model: Post,
            where: {
                is_published: 1
            },
            include: ['media', 'user']
        }]
    });
    await Promise.all(commerces.map(async (commerce, order) => {
        commerce.status = 'in-progress';
        commerce.save();

        //Set all media as don`t checked
        await Promise.all(commerce.post.media.map(async (media, order) => {
            media.bit_dna_passed = null;
            media.save();
        }));

        //Get Wallet and Balance
        const coin = await Coin.findOne({ where: { symbol: "PIB" } });
        const balance = await Balance.getBalance(commerce.post.user_id, coin.id);
        balance.value = parseFloat(balance.value);
        const { PIB_PER_HASH_BITDNA: pibPerHashBitDna } = process.env;

        const mediaHases = commerce.post.media.map(media => { return { bit_dna_hash: media.bit_dna_hash, uuid: media.uuid } });
        const wallet = await Wallet.findOne({
            where: {
                user_id: commerce.post.user_id,
                coin_id: coin.id
            }
        });
        let checkResult;
        //Check on bitDNA
        try {
            checkResult = await bitDNA.checkHashes(mediaHases, wallet.address, balance.value, pibPerHashBitDna, commerce.post.user_id);
        } catch (error) {
            commerce.status = 'failed';
            commerce.error_code = 'error_bitdna_service';
            commerce.save();
            console.log('Commerce Cron: ', error);
            return false;
        }

        //Save result of checking for each image
        await Promise.all(checkResult.hashes.map(async (hashResult, order) => {
            const media = await Media.findOne({ where: { uuid: hashResult.uuid } });
            media.bit_dna_passed = hashResult.passed;
            media.save();
        }));
        if (!checkResult.result) {
            commerce.status = 'failed';
            commerce.error_code = checkResult.code;
            commerce.save();
            return false;
        }

        //Payment process
        // if (checkResult.newCount) {
        //     const value = parseFloat(pibPerHashBitDna) * checkResult.newCount;
        //     if (balance.value < value) {
        //         commerce.status = 'failed';
        //         commerce.error_code = 'error_pib_balance';
        //         commerce.save();
        //         return false;
        //     }
        //     //Create transaction from user to system with decrease user balance
        //     const transaction = await commercePosting(commerce.post.user, coin, value, commerce.post);
        //     if (!transaction) {
        //         commerce.status = 'failed';
        //         commerce.error_code = 'error_payment_process';
        //         commerce.save();
        //         console.log('Commerce Cron: ', error);
        //         return false;
        //     }
        // }

        //Create ImageSaleContract
        // if (!commerce.token_address) {
        //     const contractHashes = await Promise.all(checkResult.hashes.map(async (hashResult, order) => hashResult.hash));

        //     try {
        //         await bitDNA.createSaleContract(contractHashes, wallet.address, commerce.id, commerce.post.user_id);
        //     } catch (error) {
        //         commerce.status = 'failed';
        //         commerce.error_code = 'error_bitdna_service';
        //         commerce.save();
        //         console.log('Commerce Cron: ', error);
        //         return false;
        //     }

        //     commerce.status = 'pending_contract_deploy';
        //     commerce.error_code = null;
        //     commerce.save();
        // }

        commerce.status = 'success';
        commerce.error_code = null;
        commerce.save();
    }));
}, true);

const taskClearMediaTempFlag = cron.schedule('*/10 * * * * *', async () => {
    const media = await Media.all({
        where: {
            processed: false,
            [Op.or]: [
                {
                    error: {
                        [Op.notIn]: ['MethodNotAllowed']
                    }
                },
                {
                    error: null
                }
            ]

        }
    });

    if (media) {
        media.map(async mediaItem => {
            try {
                await s3RemoveTagging(mediaItem.s3Key);
                if (mediaItem.s3Key_thumbnail) {
                    await s3RemoveTagging(mediaItem.s3Key_thumbnail);
                }
                if (mediaItem.s3Key_poster) {
                    await s3RemoveTagging(mediaItem.s3Key_poster);
                }
                await mediaItem.update({ processed: true, error: null });
            } catch (error) {
                if (error.code)
                    await mediaItem.update({ processed: false, error: error.code });
            }

        });
    }
}, true);

// Once an hour.
const getLatestExchangeRates = cron.schedule('0 * * * *', async () => {
    const [kryptoRates, forexRates] = await Promise.all([getKryptoRates(), getForexRates()]);
    let calculatedRates = [];

    try {
        const timestamp = moment();
        const pairs = {
            PIB_BTC: find(kryptoRates, { from_symbol: 'PIB', to_symbol: 'BTC' }).rate,
            BTC_USDT: find(kryptoRates, { from_symbol: 'BTC', to_symbol: 'USDT' }).rate,
            ETH_USDT: find(kryptoRates, { from_symbol: 'ETH', to_symbol: 'USDT' }).rate,
            USD_KRW: find(forexRates, { from_symbol: 'USD', to_symbol: 'KRW' }).rate,
            USD_AUD: find(forexRates, { from_symbol: 'USD', to_symbol: 'AUD' }).rate,
            USD_GBP: find(forexRates, { from_symbol: 'USD', to_symbol: 'GBP' }).rate,
            USD_CAD: find(forexRates, { from_symbol: 'USD', to_symbol: 'CAD' }).rate,
            USD_CNY: find(forexRates, { from_symbol: 'USD', to_symbol: 'CNY' }).rate,
            USD_EUR: find(forexRates, { from_symbol: 'USD', to_symbol: 'EUR' }).rate,
            USD_JPY: find(forexRates, { from_symbol: 'USD', to_symbol: 'JPY' }).rate,
            USD_USD: find(forexRates, { from_symbol: 'USD', to_symbol: 'USD' }).rate,
        };

        //PIBs to some currency
        calculatedRates.push({
            from_symbol: 'PIB',
            to_symbol: 'KRW',
            rate: pairs.PIB_BTC * pairs.BTC_USDT * pairs.USD_KRW,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'PIB',
            to_symbol: 'AUD',
            rate: pairs.PIB_BTC * pairs.BTC_USDT * pairs.USD_AUD,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'PIB',
            to_symbol: 'GBP',
            rate: pairs.PIB_BTC * pairs.BTC_USDT * pairs.USD_GBP,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'PIB',
            to_symbol: 'CAD',
            rate: pairs.PIB_BTC * pairs.BTC_USDT * pairs.USD_CAD,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'PIB',
            to_symbol: 'CNY',
            rate: pairs.PIB_BTC * pairs.BTC_USDT * pairs.USD_CNY,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'PIB',
            to_symbol: 'EUR',
            rate: pairs.PIB_BTC * pairs.BTC_USDT * pairs.USD_EUR,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'PIB',
            to_symbol: 'JPY',
            rate: pairs.PIB_BTC * pairs.BTC_USDT * pairs.USD_JPY,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'PIB',
            to_symbol: 'USD',
            rate: pairs.PIB_BTC * pairs.BTC_USDT,
            timestamp
        });

        //BTC to some currency
        calculatedRates.push({
            from_symbol: 'BTC',
            to_symbol: 'KRW',
            rate: pairs.BTC_USDT * pairs.USD_KRW,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'BTC',
            to_symbol: 'AUD',
            rate: pairs.BTC_USDT * pairs.USD_AUD,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'BTC',
            to_symbol: 'GBP',
            rate: pairs.BTC_USDT * pairs.USD_GBP,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'BTC',
            to_symbol: 'CAD',
            rate: pairs.BTC_USDT * pairs.USD_CAD,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'BTC',
            to_symbol: 'CNY',
            rate: pairs.BTC_USDT * pairs.USD_CNY,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'BTC',
            to_symbol: 'EUR',
            rate: pairs.BTC_USDT * pairs.USD_EUR,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'BTC',
            to_symbol: 'JPY',
            rate: pairs.BTC_USDT * pairs.USD_JPY,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'BTC',
            to_symbol: 'USD',
            rate: pairs.BTC_USDT,
            timestamp
        });
        //ETH to some currency
        calculatedRates.push({
            from_symbol: 'ETH',
            to_symbol: 'KRW',
            rate: pairs.ETH_USDT * pairs.USD_KRW,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'ETH',
            to_symbol: 'AUD',
            rate: pairs.ETH_USDT * pairs.USD_AUD,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'ETH',
            to_symbol: 'GBP',
            rate: pairs.ETH_USDT * pairs.USD_GBP,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'ETH',
            to_symbol: 'CAD',
            rate: pairs.ETH_USDT * pairs.USD_CAD,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'ETH',
            to_symbol: 'CNY',
            rate: pairs.ETH_USDT * pairs.USD_CNY,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'ETH',
            to_symbol: 'EUR',
            rate: pairs.ETH_USDT * pairs.USD_EUR,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'ETH',
            to_symbol: 'JPY',
            rate: pairs.ETH_USDT * pairs.USD_JPY,
            timestamp
        });

        calculatedRates.push({
            from_symbol: 'ETH',
            to_symbol: 'USD',
            rate: pairs.ETH_USDT,
            timestamp
        });
    }
    catch (e) {
        console.warn(e);
    }

    await ExchangeRateHistory.bulkCreate([...kryptoRates, ...forexRates, ...calculatedRates]);
}, true);

const depositMonitor = cron.schedule('*/6 * * * *', async () => {
    await DepositMonitor();
    await DepositCollector();
});

// Running Troubleshooter at 00:00
// const depositTroubleshooter = cron.schedule('0 0 * * *', async () => {
//     await DepositTroubleshooter();
// });

const withdrawMonitor = cron.schedule('*/10 * * * *', async () => {
    await WithdrawMonitor();
});

const tenMinutesChallenge = cron.schedule('*/10 * * * *', async () => {
    const rewardAmount = 1000;

    const challange_10min_setting = await Setting.findOne({
        where: {
            key: 'challange_10min'
        }
    });

    if (!challange_10min_setting || parseInt(challange_10min_setting.value) === 0) {
        // challangeLogger.info('10_MIN_CHALLANGE: OFF');
        return true;
    }

    try {
        const getUniqueUsers = () => {
            return `(
                SELECT count(distinct user_id) AS count FROM metrics AS metrics 
                WHERE 
                    metrics.post_id = post.id
                AND
                    metrics.created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
            )`;
        }

        const getTodaysWins = (condition) => {
            return `(
                SELECT count(*) AS count FROM leader_boards AS leader_board
                WHERE 
                    leader_board.post_id = post.id
                AND
                    challenge_type = '${LeaderBoard.challengeType10Min}'
                AND
                    DATE(created_at) = CURDATE()
            ) ${condition}`;
        }

        const post = await Post.findOne({
            include: [{
                model: User,
                as: 'user',
                required: true
            }],
            attributes: [
                ...Object.keys(Post.attributes),
                [sequelize.literal(getUniqueUsers()), 'unique_users'],
                [sequelize.literal('(DATE_SUB(NOW(), INTERVAL 10 MINUTE))'), 'time']
            ],
            where: {
                created_at: {
                    [Op.gt]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 10 MINUTE)')
                },
                [Op.and]: [
                    sequelize.literal(getTodaysWins(' = 0 '))
                ]
            },
            order: [
                [sequelize.literal('unique_users'), 'DESC'],
            ]
        });

        if (post && post.dataValues.unique_users > 0) {

            let tx = await sequelize.transaction();
            try {
                const leaderObject = {
                    challenge_type: LeaderBoard.challengeType10Min,
                    value: rewardAmount,
                    unique_users: post.dataValues.unique_users,
                    post_id: post.id,
                    user_id: post.user.id,
                    score: 0
                };
                await LeaderBoard.create(leaderObject, { transaction: tx });

                await challenge10minRewardTransfer(post.user, rewardAmount, tx);

                await tx.commit();

                // challangeLogger.info('10_MIN_CHALLANGE Winner: ', leaderObject);

            } catch (message) {
                // challangeLogger.error('10_MIN_CHALLANGE ', message);
                await tx.rollback();
            }
        } else {
            // challangeLogger.info('10_MIN_CHALLANGE ', 'no winners');
        }
    }
    catch (e) {
        // challangeLogger.error('10_MIN_CHALLANGE ', e);
    }

});

const hourlyChallenge = cron.schedule('0 * * * *', async () => {

    const rewardAmount = 10000;

    const challange_hourly_setting = await Setting.findOne({
        where: {
            key: 'challange_hourly'
        }
    });

    if (!challange_hourly_setting || parseInt(challange_hourly_setting.value) === 0) {
        // challangeLogger.info('HOURLY_CHALLANGE: OFF');
        return true;
    }

    try {
        const getUniqueUsers = () => {
            return `(
                SELECT count(distinct user_id) AS count FROM metrics AS metrics 
                WHERE 
                    metrics.post_id = post.id
                AND
                    metrics.created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            )`;
        }

        const getTodaysWins = (condition) => {
            return `(
                SELECT count(*) AS count FROM leader_boards AS leader_board
                WHERE 
                    leader_board.post_id = post.id
                AND
                    challenge_type = '${LeaderBoard.challengeTypeHourly}'
                AND
                    DATE(created_at) = CURDATE()
            ) ${condition}`;
        }

        const post = await Post.findOne({
            include: [{
                model: User,
                as: 'user',
                required: true
            }],
            attributes: [
                ...Object.keys(Post.attributes),
                [sequelize.literal(getUniqueUsers()), 'unique_users'],
                [sequelize.literal('(DATE_SUB(NOW(), INTERVAL 1 HOUR))'), 'time']
            ],
            where: {
                created_at: {
                    [Op.gt]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 1 HOUR)')
                },
                [Op.and]: [
                    sequelize.literal(getTodaysWins(' = 0 '))
                ]
            },
            order: [
                [sequelize.literal('unique_users'), 'DESC'],
            ]
        });

        if (post && post.dataValues.unique_users > 0) {

            let tx = await sequelize.transaction();
            try {
                const leaderObject = {
                    challenge_type: LeaderBoard.challengeTypeHourly,
                    value: rewardAmount,
                    unique_users: post.dataValues.unique_users,
                    post_id: post.id,
                    user_id: post.user.id,
                    score: 0
                };
                await LeaderBoard.create(leaderObject, { transaction: tx });

                await challengeHourlyRewardTransfer(post.user, rewardAmount, tx);

                await tx.commit();

                // challangeLogger.info('HOURLY_CHALLANGE Winner: ', leaderObject);

            } catch (message) {
                await tx.rollback();
                // challangeLogger.error('HOURLY_CHALLANGE ', message);
            }
        } else {
            // challangeLogger.info('HOURLY_CHALLANGE ', 'no winners');
        }
    }
    catch (e) {
        // challangeLogger.error('HOURLY_CHALLANGE ', e);
    }

});
const DailyChallenge = cron.schedule('0 0 * * *', async () => {

    const challange_daily_setting = await Setting.findOne({
        where: {
            key: 'challange_daily'
        }
    });

    if (!challange_daily_setting || parseInt(challange_daily_setting.value) === 0) {
        // challangeLogger.info('DAILY_CHALLANGE: OFF');
        return true;
    }

    const getUniqueUsers = () => {
        return `(
            SELECT count(distinct user_id) AS count FROM metrics AS metrics 
            WHERE 
                metrics.post_id = post.id
            AND
                metrics.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
            AND 
                metrics.created_at < CURRENT_TIMESTAMP()
        )`;
    }

    const getTodaysWins = (condition) => {
        return `(
            SELECT count(*) AS count FROM leader_boards AS leader_board
            WHERE 
                leader_board.user_id = post.user_id
            AND
                challenge_type = '${LeaderBoard.challengeTypeDaily}'
            AND
                DATE(created_at) = CURDATE()
        ) ${condition}`;
    }

    const getNextWinner = async (winners_ids) => {
        return Post.findOne({
            include: [{
                model: User,
                as: 'user',
                required: true
            }],
            attributes: [
                ...Object.keys(Post.attributes),
                [sequelize.literal(getUniqueUsers()), 'unique_users'],
                [sequelize.literal('(DATE_SUB(NOW(), INTERVAL 1 DAY))'), 'time']
            ],
            where: {
                created_at: {
                    [Op.and]: [
                        { [Op.gt]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 1 DAY)') },
                        { [Op.lt]: sequelize.literal('CURRENT_TIMESTAMP()') }
                    ]
                },
                [Op.and]: [
                    sequelize.literal(getTodaysWins(' = 0 ')),
                    sequelize.literal(getUniqueUsers() + '>0'),
                ],
                user_id: {
                    [Op.notIn]: winners_ids
                }
            },
            order: [
                [sequelize.literal('unique_users'), 'DESC'],
            ],
        });
    }

    //get 3 winners
    const winners = [];
    for (let i = 1; i <= 3; i++) {
        let winner = await getNextWinner(winners.map(post => post.user_id));
        if (!winner) {
            break;
        } else {
            winners.push(winner);
        }
    }

    //calculate prize for 1st place
    if (winners[0] && winners[0].dataValues.unique_users > 0) {
        const getUniqueMetricByType = (type, post_id) => {
            return `(
                SELECT count(distinct user_id) AS count FROM metrics AS metrics 
                WHERE 
                    metrics.post_id = ${post_id}
                AND
                    metrics.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
                AND 
                    metrics.created_at < CURRENT_TIMESTAMP()
                AND 
                    metrics.type = '${type}'
            )`;
        }
        const getUniqueUsersLevelSum = (post_id) => {
            return `(
                SELECT count(distinct user_id) AS count, COALESCE(SUM(user_level_weight),0) as level_weights FROM metrics AS metrics 
                WHERE 
                    metrics.post_id = ${post_id}
                AND
                    metrics.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
                AND 
                    metrics.created_at < CURRENT_TIMESTAMP()
            )`;
        }
        const getUniqueUpVotedUserData = (post_id) => {
            return `(
                SELECT count(distinct user_id) AS count, COALESCE(SUM(upvote_user_level_weight),0) as user_level_weights, COALESCE(SUM(upvote_amount_weight),0) as amount_weight FROM metrics AS metrics 
                WHERE 
                    metrics.post_id = ${post_id}
                AND
                    metrics.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
                AND 
                    metrics.created_at < CURRENT_TIMESTAMP()
                AND 
                    metrics.type = 'up_vote'
            )`;
        }

        const post_id = winners[0].id;
        const uniqueUpVote = await sequelize.query(getUniqueMetricByType(Metric.metricUpVoteType, post_id), { plain: true, type: sequelize.QueryTypes.SELECT });
        const uniqueComment = await sequelize.query(getUniqueMetricByType(Metric.metricCommentType, post_id), { plain: true, type: sequelize.QueryTypes.SELECT });
        const uniqueFollowing = await sequelize.query(getUniqueMetricByType(Metric.metricFollowingType, post_id), { plain: true, type: sequelize.QueryTypes.SELECT });
        const uniqueVideoView = await sequelize.query(getUniqueMetricByType(Metric.metricVideoViewType, post_id), { plain: true, type: sequelize.QueryTypes.SELECT });
        const uniqueUsers = winners[0].dataValues.unique_users;
        const uniqueUserLevelSum = await sequelize.query(getUniqueUsersLevelSum(post_id), { plain: true, type: sequelize.QueryTypes.SELECT });
        const uniqueUpVotedUserData = await sequelize.query(getUniqueUpVotedUserData(post_id), { plain: true, type: sequelize.QueryTypes.SELECT });

        const score = parseInt(uniqueUpVote.count) + parseInt(uniqueComment.count) + (parseInt(uniqueFollowing.count) + parseInt(uniqueVideoView.count) + parseInt(uniqueUsers)) * 2 + parseInt(uniqueUserLevelSum.level_weights) + parseInt(uniqueUpVotedUserData.user_level_weights) + parseInt(uniqueUpVotedUserData.amount_weight);

        let rewardAmount = 300000;
        switch (true) {
            case score >= 400:
                rewardAmount = 400000
                break;
            case score >= 500:
                rewardAmount = 500000
                break;
            case score >= 600:
                rewardAmount = 600000
                break;
            case score >= 700:
                rewardAmount = 700000
                break;
            case score >= 800:
                rewardAmount = 800000
                break;
            case score >= 900:
                rewardAmount = 900000
                break;
            case score >= 1000:
                rewardAmount = 1000000
                break;
            default:
                rewardAmount = 300000;
        }

        let tx = await sequelize.transaction();
        try {
            const leaderObject1st = {
                challenge_type: LeaderBoard.challengeTypeDaily,
                value: rewardAmount,
                unique_users: uniqueUsers,
                post_id: post_id,
                user_id: winners[0].user.id,
                score
            };
            await LeaderBoard.create(leaderObject1st, { transaction: tx });

            await challengeDailyRewardTransfer(winners[0].user, rewardAmount, tx);

            await tx.commit();

            // challangeLogger.info('DAILY_CHALLANGE winner 1st: ', leaderObject1st);

        } catch (message) {
            await tx.rollback();
            // challangeLogger.error('DAILY_CHALLANGE 1st', message);
        }

    }

    //calculate prize for 2nd place
    if (winners[1] && winners[1].dataValues.unique_users > 0) {
        rewardAmount = 100000;
        let tx = await sequelize.transaction();
        try {
            const leaderObject2nd = {
                challenge_type: LeaderBoard.challengeTypeDaily,
                value: rewardAmount,
                unique_users: uniqueUsers,
                post_id: post_id,
                user_id: winners[1].user.id,
                score: 0
            };
            await LeaderBoard.create(leaderObject2nd, { transaction: tx });

            await challengeDailyRewardTransfer(winners[1].user, rewardAmount, tx);

            // challangeLogger.info('DAILY_CHALLANGE winner 2nd: ', leaderObject2nd);

            await tx.commit();

        } catch (message) {
            await tx.rollback();
            // challangeLogger.error('DAILY_CHALLANGE 2nd', message);
        }
    }

    if (winners[2] && winners[2].dataValues.unique_users > 0) {
        rewardAmount = 50000;
        let tx = await sequelize.transaction();
        try {

            const leaderObject3rd = {
                challenge_type: LeaderBoard.challengeTypeDaily,
                value: rewardAmount,
                unique_users: uniqueUsers,
                post_id: post_id,
                user_id: winners[2].user.id,
                score: 0
            };

            await LeaderBoard.create(leaderObject3rd, { transaction: tx });

            await challengeDailyRewardTransfer(winners[2].user, rewardAmount, tx);

            // challangeLogger.info('DAILY_CHALLANGE winner 3rd: ', leaderObject3rd);

            await tx.commit();

        } catch (message) {
            await tx.rollback();
            // challangeLogger.error('DAILY_CHALLANGE 3rd', message);
        }
    }

}, true, {
        timezone: "Asia/Seoul"
    });


module.exports = {
    checkDigitalGoodsMedia,
    checkDigitalGoodsSaleContractsStatus,
    taskClearMediaTempFlag,
    getLatestExchangeRates,
    depositMonitor,
    // depositTroubleshooter,
    withdrawMonitor,
    tenMinutesChallenge,
    hourlyChallenge,
    DailyChallenge
};