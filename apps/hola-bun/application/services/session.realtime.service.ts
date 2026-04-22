import type sessionCacheService from "./session.cache.service";

export default class {
    constructor(private cache: sessionCacheService) { }

    private updateUsers(existing: any, event: any) {
        const base = existing?.users ?? [];

        if (event.active) {
            return [
                ...base.filter((u: any) => u.id !== event.user),
                { id: event.user, timestamp: event.timestamp ?? Date.now() }
            ];
        }

        return base.filter((u: any) => u.id !== event.user);
    }

    async handleDatabaseEvent(event: any) {
        try {
            const existing = await this.cache.getClient(event.client);

            const users = this.updateUsers(existing, event);

            const payload = {
                ...existing,
                client: event.client,
                users
            };

            await this.cache.setClient(payload);
            this.cache.publish(payload);

        } catch (err) {
            console.error("❌ Redis sync error:", err);
        }
    }
}