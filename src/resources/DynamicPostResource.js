import Resource from './Resource';
import DynamicUserResource from './DynamicUserResource';
import InvoiceResource from './InvoiceResource';
import DynamicTeamResource from './DynamicTeamResource';
import PostPromotionResource from './PostPromotionResource';
import CampaignResource from './CampaignResource';
import DynamicCommentResourceCollection from './DynamicCommentResourceCollection';
import { Invoice, UpVote, Comment, Favorites, GoodsOrder, FundingTransaction, Like, PostPromotion, Metric, sequelize } from '../models';
import { pick, find } from 'lodash';
import { Op } from 'sequelize';
import PromotionResourceCollection from './PromotionResourceCollection';
import InvoiceResourceCollection from './InvoiceResourceCollection';

export default class DynamicPostResource extends Resource {

    static async create(model, schema = [], invalidate = false, data = {}, tempData) {
        const instance = new this;
        instance.data = await instance.build(model, schema, invalidate, data, tempData);
        return instance;
    }

    async attachFlagsState(requester) {
        const where = {
            user_id: requester.id,
            entity_id: this.data.id,
            entity_type: 'post'
        };

        const keys = [];
        const promises = [];

        keys.push('up_voted');
        promises.push(UpVote.count({ where }));

        keys.push('favorites');
        promises.push(Favorites.count({ where }));

        keys.push('commented');
        promises.push(Comment.count({ where }));

        keys.push('liked');
        promises.push(Like.count({ where }));


        keys.push('invoice');
        promises.push(this.getInvoice(this.data.id, requester));


        if (this.data.type === 'goods') {
            keys.push('goods_order_id');
            promises.push(this.getGoodsOrder(this.data.id, requester));
        }

        if (await this.data.user) {
            promises.push(this.data.user.attachInteractionStatus(requester));
        }
        if (await this.data.comments) {
            promises.push(this.data.comments.attachFlagsState(requester));
        }

        if (this.data.type === 'funding' && this.data.team) {
            promises.push(this.data.team.attachFlagsState(requester));
        }

        const result = await Promise.all(promises);
        keys.forEach((key, index) => {
            this.data[key] = result[index];
        });

        this.data.up_voted = !!this.data.up_voted;
        this.data.favorites = !!this.data.favorites;
        this.data.commented = !!this.data.commented;
        this.data.liked = !!this.data.liked;

        return this.data;
    }

    async attachRoomInvoices(room_members_ids) {
        this.data.invoices = await this.getInvoices(this.data, room_members_ids);
    }

    async build(model, _schema = {}, invalidate, data, tempData) {
        if (!model) {
            return null;
        }
        const schema = _schema.Post || { fields: [], resources: [] };

        this.tempData = tempData ? tempData : {
            users: []
        };

        const postData = {
            ...pick(model.dataValues, ['id', 'uuid', 'type', 'atts', 'created_at', 'is_friend', 'is_following', 'is_following_tag', 'is_my',
                'is_recommended', 'is_downloadable', 'sales', ...schema.fields
            ]),
        };
        postData.prize = parseInt(model.dataValues.prize)
        postData.type = (postData.type === 'digital_goods') ? 'sale' : postData.type;

        const keys = [];
        const promises = [];

        if (!schema.fields.length || schema.fields.includes('commerce')) {
            keys.push('commerce');
            promises.push(model.getCommerce());
        }
        if (!schema.length || schema.includes('goods')) {
            postData.goods = await model.getGoods()
        }
        if (!schema.fields.length || schema.fields.includes('place')) {
            keys.push('place');
            promises.push(this.getPostPlace(model));
        }
        if (!schema.fields.length || schema.fields.includes('category')) {
            keys.push('category');
            promises.push(this.getPostCategory(model));
        }
        if (!schema.fields.length || schema.fields.includes('user')) {
            const userSchema = schema.resources.find(i => i.User) || [];
            keys.push('user');
            promises.push(this.getUser(model, userSchema));
        }
        if (!schema.fields.length || schema.fields.includes('tags')) {
            keys.push('tags');
            promises.push(this.getPostTagsArray(model));
        }
        if (!schema.fields.length || schema.fields.includes('comments')) {
            keys.push('comments');
            promises.push(this.getPostComments(model, schema.resources));
        }
        if (!schema.fields.length || schema.fields.includes('comments_count')) {
            keys.push('comments_count');
            promises.push(this.getPostCommentsCount(model));
        }
        if (!schema.fields.length || schema.fields.includes('favorites_count')) {
            keys.push('favorites_count');
            promises.push(this.getFavoritesCount(model));
        }
        if (!schema.fields.length || schema.fields.includes('up_votes_count')) {
            keys.push('up_votes_count');
            promises.push(this.getPostUpVotesCount(model));
        }
        if (!schema.fields.length || schema.fields.includes('up_votes_amount')) {
            keys.push('up_votes_amount');
            promises.push(this.getPostUpVotesAmount(model));
        }
        if (!schema.fields.length || schema.fields.includes('up_vote_date')) {
            keys.push('up_vote_date');
            promises.push(this.getUpVotesDate(model));
        }
        if (!schema.fields.length || schema.fields.includes('like_count')) {
            keys.push('like_count');
            promises.push(this.getPostLikesCount(model));
        }
        if (!schema.fields.length || schema.fields.includes('unique_users')) {
            keys.push('unique_users');
            promises.push(this.getUniqueUsers(model));
        }
        if (!schema.fields.length || schema.fields.includes('media')) {
            keys.push('media');
            promises.push(model.getMedia({
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
                    'original_width',
                    'original_height',
                    's3Key',
                    's3Key_thumbnail',
                    's3Key_original',
                    's3Key_poster',
                    'bit_dna_passed'
                ],
                order: [[sequelize.col('posts_media.order'), 'ASC']],
            }));
        }
        const result = await Promise.all(promises);
        keys.forEach((key, index) => {
            postData[key] = result[index];
        });

        //Fake param for Android. Should be removed
        postData.promotions = {
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
        if (!schema.fields.length || schema.fields.includes('promotions')) {
            postData.promotion = await this.getPromotion(model);
            // const { total_spent, total_budget, has_reward_type_collect, has_reward_type_tag, has_reward_type_up_vote, has_reward_type_share } = await this.getPromotionsTotals(model);
            // postData.promotions.total_spent = total_spent;
            // postData.promotions.total_budget = total_budget;
            // postData.promotions.has_reward_type_collect = has_reward_type_collect;
            // postData.promotions.has_reward_type_tag = has_reward_type_tag;
            // postData.promotions.has_reward_type_up_vote = has_reward_type_up_vote;
            // postData.promotions.has_reward_type_share = has_reward_type_share;
        }
        //Include fields 'team' and 'campaign'
        if (!schema.fields.length || schema.fields.includes('funding')) {
            if (model.type === 'funding') {
                if (model.team_id) {
                    const team = await model.getTeam();
                    const posts = await team.getPosts({ attributes: ['id', 'user_id'] });
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

                    postData.team = await DynamicTeamResource.create(team);
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
        }


        return postData;
    }

    async getInvoices(model, user_ids) {
        const invoices = await Invoice.findAll({
            where: {
                post_id: model.id,
                to_user_id: user_ids
            }
        });

        const invoiceResourceCollection = await InvoiceResourceCollection.create(invoices);

        return await invoiceResourceCollection.items;
    }

    async getInvoice(post_id, user) {
        const invoice = await Invoice.findOne({ where: { to_user_id: user.id, post_id, type: 'digital_goods' } });
        return invoice && await InvoiceResource.create(invoice);
    }

    async getGoodsOrder(post_id, user) {
        const goodsOrder = await GoodsOrder.findOne({
            where: {
                status: ['waiting', 'return_requested'],
                buyer_id: user.id,
                post_id
            }
        });
        return goodsOrder ? goodsOrder.id : null;
    }

    async getFavoritesCount(model) {
        return await Favorites.count({
            where: {
                entity_type: 'post',
                entity_id: model.id
            }
        }) || 0;
    }

    async getPostLikesCount(model) {
        return await Like.count({
            where: {
                entity_type: 'post',
                entity_id: model.id
            }
        }) || 0;
    }

    async getPostUpVotesCount(model) {
        return await UpVote.count({
            where: {
                entity_type: 'post',
                entity_id: model.id
            }
        }) || 0;
    }

    async getPostUpVotesAmount(model) {
        return await UpVote.sum('amount', {
            where: {
                entity_type: 'post',
                entity_id: model.id
            }
        }) || 0;
    }

    async getUpVotesDate(model) {
        return await UpVote.max('created_at', {
            where: {
                entity_type: 'post',
                entity_id: model.id
            },
            groupBy: ['entity_type', 'entity_id',]
        }) || null;
    }

    async getPostCommentsCount(model) {
        return await Comment.count({
            where: {
                entity_type: 'post',
                entity_id: model.id
            }
        }) || 0;
    }

    async getPostCategory(model) {
        return await model.getCategory({ attributes: ['id', 'name'] });
    }

    async getPostTagsArray(model) {
        const tags = await model.getTags({
            attributes: ['id', 'tag'],
            order: [[sequelize.col('posts_tags.order'), 'ASC']],
        });
        return tags.map(tag => tag.tag);
    }

    async getPostPlace(model) {
        return await model.getPlace({
            attributes: [
                'id', 'place_id', 'short_name', 'description', 'lat', 'lng'
            ]
        }) || null;
    }

    async getPostComments(model, _schema = []) {
        const commentSchema = _schema.find(i => i.Comment) || [];
        const config = {
            where: {
                entity_type: 'post',
                entity_id: model.id
            },
            order: [
                ['id', 'asc']
            ],
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
            const comment = docs[id];

            if (comment.parent_id) {
                const parentComment = comments.find(c => c.id === comment.parent_id);
                if (parentComment) {
                    if (typeof parentComment.dataValues.replies == 'undefined') {
                        parentComment.dataValues.replies = [];
                    }
                    parentComment.dataValues.replies.push(comment);
                }
            }
            else {
                comments.push(comment);
            }
        }

        return await DynamicCommentResourceCollection.create(comments, pagination, commentSchema);
    }

    async getPromotion(model) {
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

    async getUniqueUsers(model) {
        const count = await Metric.count({
            where: {
                post_id: model.id
            },
            group: ['user_id'],
            raw: true
        });
        return count.length;
    }

    async getUser(model, userSchema) {
        const cachedUser = this.tempData.users.find(cachedUser => cachedUser.id === model.user_id);
        if (!cachedUser) {
            const user = await model.getUser({ paranoid: false });
            if (!user) {
                return null;
            }
            this.tempData.users.push(await DynamicUserResource.create(user, userSchema));
            return this.tempData.users[this.tempData.users.length - 1];
        } else {
            return cachedUser;
        }
    }
}