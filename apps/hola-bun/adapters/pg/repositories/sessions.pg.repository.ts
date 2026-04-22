export default class {
    constructor(private connection: any) {
    }

    async getSession({ client }: any) {
        const res = await this.connection.query("SELECT * FROM sessions WHERE client_id = $1", [client]);
        const sessions = res.rows;

        return {
            client,
            users: sessions.map((s) => ({
                id: s.user_id,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
            })),
        };
    }

    async createClient() {
        const res = await this.connection.query("INSERT INTO clients DEFAULT VALUES RETURNING id");
        return res.rows[0].id;
    }

    async getClient(client: any) {
        const res = await this.connection.query("SELECT * FROM clients WHERE id = $1", [client]);
        return res.rows[0];
    }

    async upsertSession({ client, user, active }: any) {
        const res = await this.connection.query(`
            INSERT INTO sessions (client_id, user_id, active)
            VALUES ($1, $2, $3)
            ON CONFLICT (client_id, user_id)
            DO UPDATE SET
                active = $3,
                updated_at = now()
            RETURNING *;
        `, [client, user, active]);

        return res.rows[0];
    }
}
