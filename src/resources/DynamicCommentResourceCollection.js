import ResourceCollection from './ResourceCollection'
import DynamicCommentResource from "./DynamicCommentResource";

export default class DynamicCommentResourceCollection extends ResourceCollection {

    itemResource = DynamicCommentResource;

    async attachFlagsState(requester, schema = {}) {
        this.items = await Promise.all(this.items.map(async function (item) {
            return await item.attachFlagsState(requester, schema);
        }));

        return this;
    }

}