import type { RelationshipEventsPort } from "../../domain/ports/relationships/RelationshipEventsPort";

export class RedisRelationshipAdapter implements RelationshipEventsPort {
    constructor(private client: any, private publisher: any, private subscriber: any) { }

    async publishRelationshipChange(receiver: string, item: any) {
        await this.publisher.publish("relationship:events", JSON.stringify({ receiver, item }));
    }

    async listenRelationshipChange(handler: any) {
        await this.subscriber.subscribe("relationship:events", (event) => {
            const payload = JSON.parse(event);
            handler(payload);
        });
    }
}