import Resource from './Resource';
import UserResource from './UserResource';
import InvoiceResource from './InvoiceResource';
import TeamResource from './TeamResource';
import CampaignResource from './CampaignResource';
import PostPromotionResource from './PostPromotionResource';
import CommentResourceCollection from './CommentResourceCollection';
import { Invoice, UpVote, Comment, Favorites, FundingTransaction, Like, PostPromotion, GoodsOrder, sequelize } from '../models';
import { pick, find } from 'lodash';
import { Op } from 'sequelize';
import InvoiceResourceCollection from './InvoiceResourceCollection';

export default class PostResource extends Resource {

    async attachFlagsState(requester) {
        const where = {
            user_id: requester.id,
            entity_id: this.data.id,
            entity_type: 'post'
        };

        this.data.up_voted = !!await UpVote.count({ where });
        this.data.favorites = !!await Favorites.count({ where });
        this.data.commented = !!await Comment.count({ where });
        this.data.liked = !!await Like.count({ where });

        this.data.invoice = await this.getInvoice(this.data.id, requester);

        if (await this.data.user) {
            await this.data.user.attachInteractionStatus(requester);
        }
        if (await this.data.comments) {
            await this.data.comments.attachFlagsState(requester);
        }

        if (this.data.type === 'goods') {
            this.data.goods_order_id = await this.getGoodsOrder(this.data.id, requester);
        }

        if (this.data.type === 'funding' && this.data.team) {
            await this.data.team.attachFlagsState(requester);
        }

        return this.data;
    }

    async attachRoomInvoices(room_members_ids) {
        this.data.invoices = await this.getInvoices(this.data, room_members_ids);
    }

    async build(model, schema = []) {

        const postData = {
            ...pick(model.dataValues, ['id', 'uuid', 'type', 'atts', 'created_at', 'is_friend', 'is_following', 'is_my', 'is_recommended', 'is_downloadable', 'sales', ...schema]),
        };

        postData.type = (postData.type === 'digital_goods') ? 'sale' : postData.type;

        if (!schema.length || schema.includes('commerce')) {
            postData.commerce = await model.getCommerce()
        }
        if (!schema.length || schema.includes('goods')) {
            postData.goods = await model.getGoods()
        }
        if (!schema.length || schema.includes('place')) {
            postData.place = await this.getPostPlace(model)
        }
        if (!schema.length || schema.includes('category')) {
            postData.category = await this.getPostCategory(model)
        }
        if (!schema.length || schema.includes('user')) {
            postData.user = await UserResource.create(await model.getUser());
        }
        if (!schema.length || schema.includes('tags')) {
            postData.tags = await this.getPostTagsArray(model);
        }
        if (!schema.length || schema.includes('promotions')) {
            postData.promotion = await this.getPromotion(model);
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
        }
        if (!schema.length || schema.includes('comments')) {
            postData.comments = await this.getPostComments(model);
        }
        if (!schema.length || schema.includes('comments_count')) {
            postData.comments_count = await this.getPostCommentsCount(model);
        }
        if (!schema.length || schema.includes('favorites_count')) {
            postData.favorites_count = await this.getFavoritesCount(model);
        }
        if (!schema.length || schema.includes('up_votes_count')) {
            postData.up_votes_count = await this.getPostUpVotesCount(model);
        }
        if (!schema.length || schema.includes('up_votes_amount')) {
            postData.up_votes_amount = await this.getPostUpVotesAmount(model);
        }
        if (!schema.length || schema.includes('up_vote_date')) {
            postData.up_vote_date = await this.getUpVotesDate(model);
        }
        if (!schema.length || schema.includes('like_count')) {
            postData.like_count = await this.getPostLikesCount(model);
        }
        if (!schema.length || schema.includes('media')) {
            postData.media = await model.getMedia({
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
            })
        }


        //Include fields 'team' and 'campaign'
        if (!schema.length || schema.includes('funding')) {
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

    async getPostComments(model) {
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

        return await CommentResourceCollection.create(comments, pagination);
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

}