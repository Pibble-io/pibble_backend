import Resource from './Resource';
import { pick } from 'lodash';
import { PostsTags, Tag, TagsFollowers } from '../models';
import { Op } from "sequelize";

export default class TagResource extends Resource {

    async attachFlagsState(requester) {
        this.data.posted = await PostsTags.count({ where: { tag_id: this.data.id } });
        
        if(requester && requester.user_id){
            this.data.isFollowing = !!await TagsFollowers.count({ where: { tag_id: this.data.id, user_id: requester.user_id || null } });
        }

        if (requester && requester.related) {
            const tags = await Tag.all({
                where: {
                    id: {
                        [Op.ne]: this.data.id
                    },
                    tag: {
                        [Op.like]: '%' + this.data.tag + '%'
                    }
                }
            }) || [];

            this.data.related = await Promise.all(tags.map(async ({ id, tag }) => {
                const posted = await PostsTags.count({ where: { tag_id: id } });
                const isFollowing = !!await TagsFollowers.count({ where: { tag_id: id, user_id: requester.user_id || null } });
                return {
                    id,
                    tag,
                    posted,
                    isFollowing
                }
            }));

        }

        return this;
    }

    async build(model, schema = []) {
        return {
            ...pick(model, ['id', 'tag', ...schema]),
        };
    }
}