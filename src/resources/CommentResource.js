import Resource from './Resource';
import UserResource from "./UserResource";
import { pick } from 'lodash';
import {Favorites, UpVote} from "../models";

export default class CommentResource extends Resource {

    async attachFlagsState(requester) {
        this.data.up_voted = !!await UpVote.count({
            where: {
                user_id: requester.id,
                entity_id: this.data.id,
                entity_type: 'comment'
            }
        });

        this.data.user = await this.data.user.attachInteractionStatus(requester);
        return this.data;
    }

    async build(model, schema = []) {
        const user = await UserResource.create( await model.getUser());
        const { replies=[] } = model.dataValues;

        return {
            ...pick(model.dataValues, ['id', 'body', 'created_at', 'updated_at', ...schema]),
            user,
            replies: await Promise.all(replies.map(item => CommentResource.create(item, schema ))),
            up_votes_amount: await this.getPostUpVotesAmount(model),
        };
    }

    async getPostUpVotesAmount(model) {
        return await UpVote.sum('amount', {
            where: {
                entity_type: 'comment',
                entity_id: model.id
            }
        }) || 0;
    }
}