import ResourceCollection from './ResourceCollection'
import UpVoteResource from "./UpVoteResource";

export default class UpVoteResourceCollection extends ResourceCollection {

    itemResource = UpVoteResource;

    async attachFlagsState (requester) {
        this.items = await Promise.all(this.items.map( async function ( item ) {
            return await item.attachFlagsState(requester);
        }));

        return this;
    }

}