import ResourceCollection from './ResourceCollection';
import TagFollowersResource from "./TagFollowersResource";

export default class TagResourceCollection extends ResourceCollection {

    itemResource = TagFollowersResource;

    async attachFlagsState (requester) {
        this.items = await Promise.all(this.items.map( async function ( item ) {
            return await item.attachFlagsState(requester);
        }));

        return this;
    }
}