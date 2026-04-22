export default class {
    constructor(private redis: any, private subscriber: any, private publisher: any) {
        this.redis.json.get("kento").then((json) => {
            if (!json) this.redis.json.set(
                "kento",
                "$",
                { visitor: {}, session: {} }
            );
        });
    }

    publishEvent(payload: any) {
        this.publisher.publish("session:event", JSON.stringify(payload));
    }

    subscribeToEvents(callback: any) {
        this.subscriber.subscribe("session:event", (message) => {
            const event = JSON.parse(message);
            callback(event);
        });
    }

    // --- VISITOR ---
    async setVisitorCache(vtkn: string, token: string) {
        await this.redis.json.set(
            "kento",
            "$.visitor." + vtkn,
            token
        );
    }

    async getVisitorCache(vtkn: string) {
        return await this.redis.json.get(
            "kento",
            {
                path: "$.visitor." + vtkn
            }
        );
    }

    // --- SESSION ---
    async setClientCache(session: any) {
        await this.redis.json.set(
            "kento",
            "$.session." + session.client,
            session
        );
    }

    async deleteClientCache(clientId: string) {
        await this.redis.json.del(
            "kento",
            "$.session." + clientId
        );
    }

    async getClientCache(client: string) {
        return await this.redis.json.get(
            "kento",
            {
                path: "$.session." + client
            }
        );
    }
}
