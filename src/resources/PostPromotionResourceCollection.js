import ResourceCollection from './ResourceCollection';
import PostPromotionResource from "./PostPromotionResource";

export default class PostPromotionResourceCollection extends ResourceCollection {

    itemResource = PostPromotionResource;

    async attachFlagsState (requester, schema = {}) {
        this.items = await Promise.all(this.items.map( async function ( item ) {
            return await item.attachFlagsState(requester, schema);
        }));

        return this;
    }
}