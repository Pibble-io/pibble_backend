import ResourceCollection from './ResourceCollection'
import PostResource from "./PostResource";

export default class PostResourceCollection extends ResourceCollection {

    itemResource = PostResource;

    async attachFlagsState (requester) {
        this.items = await Promise.all(this.items.map( async function ( item ) {
            return await item.attachFlagsState(requester);
        }));

        return this;
    }

}