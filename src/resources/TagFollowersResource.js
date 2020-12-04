import Resource from './Resource';
import { pick } from 'lodash';
import { PostsTags, Tag, TagsFollowers } from '../models';
import { Op } from "sequelize";

export default class TagFollowersResource extends Resource {

    async attachFlagsState(requester) {
        this.data.posted = await PostsTags.count({ where: { tag_id: this.data.tag_id } });
        const tag = await Tag.findOne({ where: { id: this.data.tag_id } })
        this.data.name = tag.tag;
        return this;
    }

    async build(model, schema = []) {
        return {
            ...pick(model, ['id', 'tag_id', ...schema]),
        };
    }
}