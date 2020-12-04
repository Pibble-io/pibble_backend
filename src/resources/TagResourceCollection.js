import ResourceCollection from './ResourceCollection';
import TagResource from "./TagResource";

export default class TagResourceCollection extends ResourceCollection {

    itemResource = TagResource;

    async attachFlagsState (requester) {
        this.items = await Promise.all(this.items.map( async function ( item ) {
            return await item.attachFlagsState(requester);
        }));

        return this;
    }
}