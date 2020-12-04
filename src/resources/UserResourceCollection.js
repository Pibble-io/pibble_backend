import ResourceCollection from './ResourceCollection'
import UserResource from "./UserResource";

export default class UserResourceCollection extends ResourceCollection {

    itemResource = UserResource;

    async attachInteractionStatus (requester) {
        this.items = await Promise.all(this.items.map( async function ( item ) {
            return await item.attachInteractionStatus(requester);
        }));

        return this;
    }
}