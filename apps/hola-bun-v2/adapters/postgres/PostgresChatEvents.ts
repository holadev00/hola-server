import { PostgresEvents } from './PostgresEvents';

export class PostgresChatEvents {
    constructor(private events: PostgresEvents) { }

    onChatChange(callback: any) {
        return this.events.on('chat_change', callback);
    }

    onChatNewMessage(callback: any) {
        return this.events.on('chat_new_message', callback);
    }
}
