import ResourceCollection from './ResourceCollection'
import FeedResource from "./FeedResource";

export default class FeedResourceCollection extends ResourceCollection {

    itemResource = FeedResource;

    async attachFlagsState (requester) {
        this.items = await Promise.all(this.items.map( async function ( item ) {
            return await item.attachFlagsState(requester);
        }));

        return this;
    }

}