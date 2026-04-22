import { createNotifyFunction } from "../realtime/notify.function";
import { createNotifyTrigger } from "../realtime/notify.trigger";

export default class {
    constructor(private connection: any) {
        connection.on("error", (err: any) => console.error(err));
    }

    async listen(onEvent: any) {
        createNotifyFunction(this.connection);
        createNotifyTrigger(this.connection, "users");

        this.connection.on("notification", (msg) => {
            if (msg.channel !== "users") return;
            const payload = JSON.parse(msg.payload);
            onEvent({
                user: payload.new.id ?? payload.old.id,
                manager: payload.new.manager ?? payload.old.manager
            });
        });
    }

    async findById(id: string) {
        const res = await this.connection.query("SELECT * FROM users WHERE id = $1", [id]);

        return res.rows[0];
    }

    async findByIdentifier({
        identifier
    }: {
        identifier: string
    }) {
        const res = await this.connection.query("SELECT * FROM users WHERE username = $1 OR email = $1 OR phone = $1", [identifier]);

        return res.rows[0];
    }

    async findByProviderId({
        provider,
        providerId
    }: {
        provider: string,
        providerId: string
    }) {
        const res = await this.connection.query("SELECT * FROM users WHERE provider = $1 AND providerId = $2", [provider, providerId]);

        return res.rows[0];
    }

    async getUserManagerStatus(id: string) {
        try {
            const user = await this.findById(id);
            const isManager = user?.manager;

            return isManager;
        } catch (error) {
            throw error;
        }
    }

    async createSocialUser({
        username,
        email,
        provider,
        providerId
    }: {
        username: string,
        email: string,
        provider: string,
        providerId: string
    }) {
        try {
            const res = await this.connection.query(
                `INSERT INTO users (username, email, provider, providerId)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (provider, providerId)
                 DO UPDATE SET
                 provider = EXCLUDED.provider,
                 providerId = EXCLUDED.providerId
                 RETURNING *`,
                [username, email, provider, providerId]
            );

            return res.rows[0].id;
        } catch (error) {
            console.error(error);
        }
    }
}