import ResourceCollection from './ResourceCollection'
import DynamicChatMemberResource from "./DynamicChatMemberResource";

export default class ChatMemberResourceCollection extends ResourceCollection {

    itemResource = DynamicChatMemberResource;

    async attachInteractionStatus (requester) {
        this.items = await Promise.all(this.items.map( async function ( item ) {
            return await item.attachInteractionStatus(requester);
        }));

        return this;
    }
}