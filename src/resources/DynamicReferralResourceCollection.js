import ResourceCollection from './ResourceCollection'
import DynamicReferralResource from "./DynamicReferralResource";

export default class DynamicReferralResourceCollection extends ResourceCollection {

    itemResource = DynamicReferralResource;

    async attachFlagsState (requester, schema) {
        this.items = await Promise.all(this.items.map( async function ( item ) {
            return await item.attachFlagsState(requester, schema);
        }));

        return this;
    }

}