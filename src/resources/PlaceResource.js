import Resource from './Resource';
import { pick } from 'lodash';
import { Post } from '../models';

export default class PlaceResource extends Resource {

    async attachFlagsState(requester) {
        this.data.posted = await Post.count({where: {place_id: this.data.id}});
        return this;
    }

    async build(model, schema = []) {
        return {
            ...pick(model, ['id', 'place_id', 'short_name', 'description', 'lat', 'lng', ...schema]),
        };
    }
}

