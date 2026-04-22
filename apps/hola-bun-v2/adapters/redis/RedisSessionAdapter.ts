import type { SessionCacheAdapterPort } from "../../domain/ports/auth/SessionCacheAdapterPort";

export class RedisSessionAdapter implements SessionCacheAdapterPort {
    constructor(private client: any) { }

    async getSessionToken(visitorToken: string): Promise<string | null> {
        const token = this.client.hGet("token", visitorToken);
        return token;
    }

    async setSessionToken(visitorToken: string, token: string): Promise<void> {
        return this.client.hSet("token", visitorToken, token, { NX: true, EX: 7200 });
    }
}
