import ResourceCollection from './ResourceCollection';
import TeamResource from "./TeamResource";

export default class TeamResourceCollection extends ResourceCollection {

    itemResource = TeamResource;

    async attachFlagsState (requester) {
        this.items = await Promise.all(this.items.map( async function ( item ) {
            return await item.attachFlagsState(requester);
        }));

        return this;
    }

}