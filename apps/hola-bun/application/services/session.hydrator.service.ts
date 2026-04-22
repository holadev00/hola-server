import type sessionAuthService from "./session.auth.service";
import type sessionCacheService from "./session.cache.service";

export default class {
    constructor(
        private auth: sessionAuthService,
        private cache: sessionCacheService,
        private obs: any
    ) { }

    async hydrateHttp(token: string, vtkn: string, save: Function) {
        try {
            const client = await this.auth.getOrCreateClient(token);
            const newToken = await this.auth.generateToken(client);

            save(newToken);
            await this.cache.setVisitor(vtkn, newToken);
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async hydrateSocket(store: any, vtkn: any, jwt: any, success: any, error: any, unsubscribe: any) {
        try {
            let payload;

            if (jwt) payload = await this.auth.decode(jwt);
            else if (vtkn) {
                const token = await this.cache.getVisitor(vtkn);
                payload = await this.auth.decode(token);
            }

            if (!payload?.client) return error(new Error("unauthorized"));

            this.obs.setSession(store, { client: payload.client });

            const cached = await this.cache.getClient(payload.client);
            if (cached?.users) {
                this.obs.setSession(store, { users: cached.users });
            }

            const uns = store.onChange(({ value: { current, ...session } }) => {
                this.cache.setClient(session);
                this.cache.publish(session);
            });

            unsubscribe(uns);

            return success();
        } catch {
            error(new Error("unauthorized"));
        }
    }

    async hydrateSocketUsers(session: any, users: any) {
        this.obs.setSession(session, { users });
    }
}