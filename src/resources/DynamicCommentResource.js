import Resource from './Resource';
import DynamicUserResource from "./DynamicUserResource";
import { pick } from 'lodash';
import {Favorites, UpVote} from "../models";

export default class DynamicCommentResource extends Resource {

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

    async build(model,  _schema = {}) {
        const schema = _schema.Comment || { fields: [], resources: [] };
        const userSchema = schema.resources.find(i => i.User) || [];
        const user = await DynamicUserResource.create( await model.getUser(), userSchema);
        const { replies=[] } = model.dataValues;

        return {
            ...pick(model.dataValues, ['id', 'body', 'created_at', 'updated_at', ...schema]),
            user,
            replies: await Promise.all(replies.map(item => DynamicCommentResource.create(item, _schema ))),
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