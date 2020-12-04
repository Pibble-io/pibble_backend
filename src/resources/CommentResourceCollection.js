import ResourceCollection from './ResourceCollection'
import CommentResource from "./CommentResource";

export default class CommentResourceCollection extends ResourceCollection {

    itemResource = CommentResource;

    async attachFlagsState(requester, commentSchema = {}) {
        this.items = await Promise.all(this.items.map(async function (item) {
            return await item.attachFlagsState(requester, commentSchema);
        }));

        return this;
    }

}