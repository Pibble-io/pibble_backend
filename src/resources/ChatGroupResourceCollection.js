import ResourceCollection from './ResourceCollection';
import DynamicChatGroupResource from "./DynamicChatGroupResource";

export default class ChatGroupResourceCollection extends ResourceCollection {

    itemResource = DynamicChatGroupResource;

    async attachInteractionStatus(requester, schema = {}) {
        this.items = await Promise.all(this.items.map(async function (item) {
            return await item.attachInteractionStatus(requester, schema);
        }));
        return this;
    }

}