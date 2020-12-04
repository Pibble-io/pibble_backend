import ResourceCollection from './ResourceCollection';
import DynamicChatRoomResource from "./DynamicChatRoomResource";

export default class ChatRoomResourceCollection extends ResourceCollection {

    itemResource = DynamicChatRoomResource;

    async attachInteractionStatus(requester, schema = {}) {
        this.items = await Promise.all(this.items.map(async function (item) {
            return await item.attachInteractionStatus(requester, schema);
        }));

        this.items.sort(function (a, b) {
            var keyA = a.unread_message_count,
                keyB = b.unread_message_count;
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            if (keyA === keyB) {
                if (a.last_message && b.last_message) {
                    var keyAA = new Date(a.last_message.created_at)
                    var keyBB = new Date(b.last_message.created_at)
                    if (keyAA < keyBB) return 1;
                    if (keyAA > keyBB) return -1;
                } else {
                    var keyAA = new Date(a.created_at)
                    var keyBB = new Date(b.created_at)
                    if (keyAA < keyBB) return 1;
                    if (keyAA > keyBB) return -1;
                }
            }
            return 0;
        });
        return this;
    }

}