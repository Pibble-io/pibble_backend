import ResourceCollection from './ResourceCollection';
import PlaceResource from "./PlaceResource";

export default class PlaceResourceCollection extends ResourceCollection {

    itemResource = PlaceResource;

    async attachFlagsState (requester) {
        this.items = await Promise.all(this.items.map( async function ( item ) {
            return await item.attachFlagsState(requester);
        }));

        return this;
    }
}