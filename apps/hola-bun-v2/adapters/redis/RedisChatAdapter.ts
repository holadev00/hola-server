import type { ChatListItemEntity } from "../../domain/entities/chat/ChatListItemEntity";
import type { ChatCachePort } from "../../domain/ports/chat/ChatCachePort";
import type { ChatEventsPort } from "../../domain/ports/chat/ChatEventsPort";

export class RedisChatAdapter implements ChatEventsPort, ChatCachePort {
    constructor(private redis: any, private listener?: any, private publisher?: any) { }

    async publishChatChange(item: any) {
        this.publisher.publish("chat:events", JSON.stringify(item));
    }

    async listenChatChange(handler: (payload: { userId: string; item: ChatListItemEntity; }) => void): Promise<void> {
        await this.listener.subscribe("chat:events", (event) => {
            const payload = JSON.parse(event);
            handler(payload);
        });
    }
}
