export default class {
    constructor(private repository: any, private jwtAdapter: any, private redisAdapter: any, private obsAdapter: any) {
    }

    handleDatabaseEvent = async (event: { client: string, user: string, timestamp: string, active: boolean }) => {
        try {
            const [existing] = await this.redisAdapter.getClientCache(event.client);

            let users;
            if (event.active) users = [
                ...(existing?.users ?? [])?.filter((u) => u.id !== event.user),
                {
                    id: event.user,
                    timestamp: event?.timestamp ?? Date.now()
                },
            ]

            if (!event.active) users = (existing?.users ?? [])
                ?.filter((u) => u.id !== event.user);

            const newCachePayload = { ...existing, client: event.client, users };
            await this.redisAdapter.setClientCache(newCachePayload);
            this.redisAdapter.publishEvent(newCachePayload);
        } catch (err) {
            console.error("❌ Redis sync error:", err);
        }
    }

    hydrateClientSession = async (token: string, vtkn: string, save: Function) => {
        try {
            let client;
            if (!token) client = await this.repository.createClient();
            else {
                const payload = await this.jwtAdapter.decode(token);
                if (!payload) client = await this.repository.createClient();
                else {
                    const existingClient = await this.repository.getClient(payload?.client);
                    if (existingClient) client = payload.client;
                    else client = await this.repository.createClient();
                }
            }
            token = await this.jwtAdapter.sign({ client });

            save(token);
            this.redisAdapter.setVisitorCache(vtkn, token);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    hydrateSocketSession = async (store: any, vtkn: any, jwt: any, successCb: any, errorCb: any, unsubscribe: any) => {
        try {
            let payload;

            if (jwt) {
                payload = await this.jwtAdapter.decode(jwt);
            }

            else if (vtkn) {
                const token = await this.redisAdapter.getVisitorCache(vtkn);
                payload = await this.jwtAdapter.decode(token);
            }

            if (!payload?.client) {
                return errorCb(new Error("unauthorized"));
            }

            this.obsAdapter.setSession(store, { client: payload?.client });

            const [cachedClient] = await this.redisAdapter.getClientCache(payload?.client);
            if (cachedClient) {
                if (cachedClient.users) this.obsAdapter.setSession(store, { users: cachedClient.users });
            }

            const uns_ = store.onChange(({ value: { current, ...session } }) => {
                this.redisAdapter.setClientCache(session);
                this.redisAdapter.publishEvent(session);
            })

            unsubscribe(uns_);
            return successCb();
        } catch (error) {
            errorCb(new Error("unauthorized"));

        }
    }

    handleSessionEvent = async (getSessionsFromClient: any) => {
        this.redisAdapter.subscribeToEvents(async (event) => {
            const sessions = await getSessionsFromClient(event.client);
            for (const session of sessions) {
                this.obsAdapter.setSession(session, { users: event.users });
            }
        })
    }
}