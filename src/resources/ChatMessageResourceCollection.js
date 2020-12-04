import ResourceCollection from './ResourceCollection'
import DynamicChatMessageResource from "./DynamicChatMessageResource";

export default class ChatMessageResourceCollection extends ResourceCollection {

    itemResource = DynamicChatMessageResource;

    async attachInteractionStatus(requester, schema = {}) {
        this.items = await Promise.all(this.items.map(async (item) => {
            return await item.attachInteractionStatus(requester, schema);
        }));

        return this;
    }

}