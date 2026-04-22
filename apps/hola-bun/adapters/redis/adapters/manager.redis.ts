export default class {
    constructor(private redis: any, private subscriber: any, private publisher: any) {
    }

    subscribeManagerStatus(callback) {
        this.subscriber.subscribe('manager:events', (message) => {
            const event = JSON.parse(message);
            callback(event);
        });
    }

    subscribeManagerStore(callback) {
        this.subscriber.subscribe('manager:events_', (message) => {
            const event = JSON.parse(message);
            callback(event);
        });
    }

    publishManagerStatus(user, store) {
        this.publisher.publish('manager:events', JSON.stringify({ user, store }));
    }

    publishManagerStore(user, manager) {
        this.publisher.publish('manager:events_', JSON.stringify({ user, manager }));
    }

    async setManagerStatus(user, manager) {
        const existing = await this.getUserManagerStatus(user);
        const newM = { ...existing, isManager: manager };
        await this.redis.hSet('manager:subapp', user, JSON.stringify(newM));
    }

    async getUserManagerStatus(user) {
        try {
            if (!user) return null;
            return JSON.parse(await this.redis.hGet('manager:subapp', user));
        } catch (error) {
            //console.log(error);
            return null;
        }
    }
}