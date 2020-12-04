import Resource from './Resource';
import {
    Post,
    UsersFollowers,
    UsersFriends,
    User,
    Invoice,
    Balance,
    Coin,
    Wallet,
    Level,
    RewardTransaction,
    UsersFriendshipRequests,
    ChatMessageStatus,
    FeedSettings
} from '../models';
import { pick } from 'lodash';
import { Op } from 'sequelize';
import config from '../config';
import moment from 'moment';

const rewardAmount = parseFloat(config.REWARD_AMOUNT);
const rewardBaseLimit = parseInt(config.REWARD_BASE_COUNT_LIMIT_PER_DAY);
const rewardTransactionType = parseInt(config.REWARD_TRANSACTION_TYPE);
const rewardFreeTransactionType = parseInt(config.REWARD_FREE_TRANSACTION_TYPE);


export default class UserResource extends Resource {

    async attachInteractionStatus(requester) {
        const { id } = this.data;
        this.data.is_current_user = requester.id === id;
        if (requester.id === id) {
            return this;
        }
        this.data.interaction_status = {
            is_follower: await UsersFollowers.isFollower(requester.id, id),
            is_following: await UsersFollowers.isFollowing(requester.id, id),
            is_friend: await UsersFriends.isFriend(requester.id, id),
            is_muted: await FeedSettings.count({ where: { entity_type: 'user', entity_id: id, muted: 1, user_id: requester.id } }) >= 1,
            inbound_friend_requested: await UsersFriendshipRequests.count({
                where: {
                    user_id: requester.id,
                    outgoing_id: id
                }
            }) > 0,
            outbound_friend_requested: await UsersFriendshipRequests.count({
                where: {
                    user_id: id,
                    outgoing_id: requester.id
                }
            }) > 0
        };
        return this;
    }

    async build(model, schema = []) {
        const profile = await this.getProfile(model);
        const avatar = profile && await profile.getAvatar();
        const wall_cover = profile && await profile.getWallCover();

        const data = {
            stats: {
                followers_count: await UsersFollowers.getFollowersCount(model.id),
                followings_count: await UsersFollowers.getFollowingCount(model.id),
                friends_count: await UsersFriends.getFriendsCount(model.id),
                posts_count: await Post.getPostsCount(model.id)
            },
            report_level: await model.getReportLevel(),
            country: await model.getCountry(),
            balances: await this.getBalances(model),
            wallets: await this.getWallets(model),
            avatar: avatar ? avatar.url : null,
            wall_cover: wall_cover ? wall_cover.url : null,
            active_invoice_count: await this.getActiveInvoiceCount(model),
            unread_messages_count: await this.getUnreadMessageCount(model),
        };

        if (profile && schema.includes('place')) {
            data.place = await profile.getPlace({
                attributes: ['place_id', 'short_name', 'description', 'lat', 'lng']
            }) || null;
        }

        if (schema.includes('level_up_points')) {
            data.level_up_points = await this.getLevelUpPoints(model);
        }

        if (schema.includes('brush_rewards')) {
            data.brush_rewards = await this.getBrushRewards(model);
        }

        return {
            ...pick(model, ['id', 'uuid', 'username', 'level', 'type', 'restricted_wallet', 'restricted_post','is_banned', ...schema]),
            ...pick(profile, ['first_name', 'last_name', 'site_name', 'description', 'currency', 'referral']),
            ...data
        };
    }

    async getBalances(model) {
        return await Balance.findAll({
            attributes: ['value'],
            where: { user_id: model.id },
            include: [{
                model: Coin,
                where: {
                    // [Op.or]: {
                    //     public_status: true,
                    //     symbol: ['PIB','ETH']
                    // }
                }
            }]
        }).map(({ value: available, coin: { name, symbol } }) => ({ name, symbol, available }));
    }

    async getWallets(model) {
        return await Wallet.findAll({
            attributes: ['address'],
            where: {
                user_id: model.id
            },
            include: [{
                model: Coin,
                attributes: ['name', 'symbol'],
                where: {
                    public_status: false
                }
            }]
        }).map(({ address, coin: { name, symbol } }) => ({ name, symbol, address }));
    }

    async getProfile(model) {
        return await model.getUsersProfile();
    }

    async getLevelUpPoints(model) {
        return {
            available: model.level_points,
            necessary: (await Level.findOne({
                where: { id: { [Op.gt]: model.level } },
                order: [['points_earn', 'ASC']]
            })).points_earn || 0
        };
    }

    async getUnreadMessageCount(model) {
        const rooms = await model.getRooms({
            include: [
                {
                    model: ChatMessageStatus,
                    as: 'messages_status',
                    where: { status: 0, user_id: model.id }
                }
            ]
        });
        return rooms.reduce((sum, room) => { return sum + room.messages_status.length; }, 0);
    }

    async getActiveInvoiceCount(model) {
        return await Invoice.count({
            where: {
                to_user_id: model.id,
                status: 'requested',
                type: {
                    [Op.ne]: 'goods'
                }
            }
        });
    }

    async getBrushRewards(model) {
        const earn = await RewardTransaction.sum('to_value', {
            where: {
                to_user_id: model.id,
                created_at: {
                    [Op.gte]: moment().subtract(1, 'days')
                },
                type: {
                    [Op.in]: [rewardTransactionType, rewardFreeTransactionType]
                }
            }
        }) || 0;

        const limit = rewardBaseLimit * Math.floor(Math.sqrt(model.level)) * rewardAmount;

        return { earn, limit };
    }
}