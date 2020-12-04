import Resource from './Resource';
import {
    Comment,
    Promotion,
    Coin,
    Wallet,
    Team,
    FundingTransaction,
    PostPromotion,
    GoodsOrder,
    sequelize
} from "../models";
import CampaignResource from "./CampaignResource";
import PostPromotionResource from './PostPromotionResource';
import TeamResource from "./TeamResource";
import { pick, find } from 'lodash';
import { Op } from "sequelize";



export default class FeedResource extends Resource {

    async attachFlagsState(requester) {

        if (this.data.type === 'goods') {
            this.data.goods_order_id = await this._getGoodsOrder(this.data.id, requester);
        }

        return this.data;
    }

    async build(model, schema = [], invalidate, data) {

        const [tags, media, promotion, comments, invoice, user] = await Promise.all([
            this._getPostTagsArray(model),
            this._getMedia(model),
            this._getPromotion(model),
            this._getComments(model),
            this._invoicceCreate(model.invoices, data.user_id),
            this._userCreate(model.user),
        ])

        //For Android
        const fakePromotions = {
            items: [],
            pagination: {
                page: 0,
                perPage: 0,
                total: 0,
                pages: 0
            },
            totalSpent: 0,
            totalBudget: 0,
            hasRewardTypeCollect: false,
            hasRewardTypeTag: false,
            hasRewardTypeUpVote: false,
            hasRewardTypeShare: false,
        };

        const postData = {
            ...pick(model.dataValues, [
                'id', 'uuid', 'type', 'atts', 'created_at', 'is_friend', 'is_following', 'is_following_tag', 'is_my',
                'is_recommended', 'is_downloadable', 'sales','goods', ...schema]),
            commerce: model.commerce,
            place: model.place,
            category: model.category,
            user: user,
            tags: tags,
            comments: comments,
            comments_count: model.dataValues.comments_count || 0,
            favorites_count: model.dataValues.favorites_count || 0,
            up_votes_count: model.dataValues.up_votes_count || 0,
            up_votes_amount: parseFloat(model.dataValues.up_votes_amount) || 0,
            up_vote_date: model.dataValues.up_vote_date || null,
            like_count: model.dataValues.like_count || 0,
            media: media,
            promotions: fakePromotions,
            promotion: promotion,
            up_voted: !!model.dataValues.up_voted,
            favorites: !!model.dataValues.favorites,
            commented: !!model.dataValues.commented,
            liked: !!model.dataValues.liked,
            invoice: invoice,
            team: model.team
        };

        if (model.type === 'funding') {
            if (model.team_id) {
                const team = await Team.scope('withPosts').findById(model.team_id);
                const posts = team.posts;
                // const team = await model.getTeam();
                // const posts = await team.getPosts({ attributes: ['id', 'user_id'] });
                const usersRaised = await FundingTransaction.findAll({
                    attributes: ['post_id', [sequelize.fn('sum', sequelize.col('value')), 'total']],
                    where: {
                        post_id: {
                            [Op.in]: posts.map(p => p.id)
                        }
                    },
                    group: 'post_id'
                }).reduce((result, { dataValues: { post_id, total } }) => {
                    const user_id = find(posts, p => p.id === post_id).user_id;
                    if (!result[user_id]) {
                        result[user_id] = 0;
                    }
                    result[user_id] += parseFloat(total);

                    return result;
                }, {});

                postData.team = await TeamResource.create(team);
                postData.team_rank = usersRaised[model.user_id]
                    ? (Object.values(usersRaised).filter(v => v > usersRaised[model.user_id]).length + 1)
                    : null;
                postData.fundraise_as = 'team';
            }
            else {
                const campaign = await model.getCampaign();
                if (campaign) {
                    postData.atts.campaign = await CampaignResource.create(campaign);
                }
                postData.fundraise_as = 'individual';
            }
        }

        return postData;
    }

    async _getGoodsOrder(post_id, user) {
        const goodsOrder = await GoodsOrder.findOne({
            where: {
                status: ['waiting', 'return_requested'],
                buyer_id: user.id,
                post_id
            }
        });
        return goodsOrder ? goodsOrder.id : null;
    }


    _invoicceCreate(invoices, requested_user_id) {
        return invoices.filter(i => i.to_user_id == requested_user_id && i.type === 'goods').pop() || null
    }

    _userCreate(user) {
        const profile = user && user.usersProfile;
        const avatar = profile && profile.avatar && profile.avatar.url;
        const wall_cover = profile && profile.wallCover && profile.wallCover.url;
        return {
            ...pick(user, ['id', 'uuid', 'username', 'level', 'type']),
            ...pick(profile, ['first_name', 'last_name', 'site_name', 'description']),
            country: user && user.country,
            balances: user && user.balance.map(b => { return { name: b.coin.name, symbol: b.coin.symbol, available: b.value } }),
            // wallets: await this._getWallets(user),
            avatar,
            wall_cover,
            interaction_status: {
                is_muted: !!user.dataValues.is_muted,
                is_follower: !!user.dataValues.is_follower,
                is_following: !!user.dataValues.is_following,
                is_friend: !!user.dataValues.is_friend,
                inbound_friend_requested: !!user.dataValues.inbound_friend_requested,
                outbound_friend_requested: !!user.dataValues.outbound_friend_requested,
            }
        };
    }

    _commentCreate(comment) {
        return {
            ...pick(comment, ['id', 'body', 'created_at', 'updated_at', 'parent_id']),
            user: { ...pick(comment.user, ['id', 'uuid', 'username']) }
        }
    }

    async _getComments(model) {
        const config = {
            where: {
                entity_type: 'post',
                entity_id: model.id
            },
            order: [
                ['id', 'asc']
            ],
            scope: ['withAuthor'],
            page: 1,
            paginate: 4,
        };
        const { docs, pages, total } = await Comment.paginate(config);
        const pagination = {
            page: config.page,
            per_page: config.paginate,
            pages,
            total
        };
        const comments = [];
        for (const id in docs) {
            const comment = this._commentCreate(docs[id]);
            if (comment.parent_id) {
                const parentComment = comments.find(c => c.id === comment.parent_id);
                if (parentComment) {
                    if (typeof parentComment.replies == 'undefined') {
                        parentComment.replies = [];
                    }
                    parentComment.replies.push(comment);
                }
            }
            else {
                comments.push(comment);
            }
        }
        return { items: comments, pagination };
    }

    async _getWallets(model) {
        return Wallet.findAll({
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

    async _getPostTagsArray(model) {
        const tags = await model.getTags({
            attributes: ['id', 'tag'],
            order: [[sequelize.col('posts_tags.order'), 'ASC']],
        });
        return tags.map(tag => tag.tag);
    }

    async _getMedia(model) {
        return model.getMedia({
            attributes: [
                'url',
                'thumbnail',
                'id',
                'uuid',
                'type',
                'processed',
                'mimetype',
                'width',
                'height',
                's3Key',
                's3Key_thumbnail',
                's3Key_original',
                's3Key_poster',
                'bit_dna_passed'
            ],
            order: [[sequelize.col('posts_media.order'), 'ASC']],
        })
    }

    // async _createPromotions(model) {
    //     const promotions = await Promotion.scope('withSpent').findAll({
    //         where: {
    //             entity_type: 'post',
    //             entity_id: model.id,
    //         }
    //     });
    //     return this._promotionTotals(promotions)
    // }

    async _getPromotion(model) {
        const promotion = await PostPromotion.findOne({
            where: {
                post_id: model.id,
            },
            paranoid: false
        });

        if (promotion) {
            const promotionResource = await PostPromotionResource.create(promotion);
            return promotionResource.attachFlagsState(promotion);
        } else {
            return null;
        }
    }

    _promotionTotals(promotions) {
        let total_spent = 0
        let total_budget = 0
        let has_reward_type_collect = false;
        let has_reward_type_tag = false;
        let has_reward_type_up_vote = false;
        let has_reward_type_share = false;
        promotions.map(newItem => {
            if (newItem.reward_type_collect && newItem.spent < newItem.budget) {
                has_reward_type_collect = true;
            }
            if (newItem.reward_type_tag && newItem.spent < newItem.budget) {
                has_reward_type_tag = true;
            }
            if (newItem.reward_type_up_vote && newItem.spent < newItem.budget) {
                has_reward_type_up_vote = true;
            }
            if (newItem.reward_type_share && newItem.spent < newItem.budget) {
                has_reward_type_share = true;
            }
            total_spent += parseFloat(newItem.dataValues.spent || 0)
            total_budget += newItem.budget
        });

        return { total_spent: total_spent, total_budget, has_reward_type_collect, has_reward_type_tag, has_reward_type_up_vote, has_reward_type_share };
    }
}