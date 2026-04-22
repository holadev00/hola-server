import type { PostgresEvents } from "./PostgresEvents";

export class PostgresRelationshipEvents {
    constructor(private events: PostgresEvents) { }

    onRelationshipChange(callback: any) {
        return this.events.on('relationship_change', callback);
    }
}