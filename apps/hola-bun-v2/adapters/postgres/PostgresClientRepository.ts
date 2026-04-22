import { ClientRepositoryPort } from "@amine-chat/auth-domain/domain/ports/auth/ClientRepositoryPort";
import { PostgresRepository } from "./PostgresRepository";

export default class PostgresClientRepository extends PostgresRepository implements ClientRepositoryPort {
    override async init() {
        await this.db.query(`CREATE TABLE IF NOT EXISTS clients (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMP DEFAULT now(), updated_at TIMESTAMP DEFAULT now());`);
    }

    async createClient() {
        const { rows } = await this.db.query("INSERT INTO clients DEFAULT VALUES RETURNING id");
        return rows[0].id;
    }

    async getClient(client: string) {
        const { rows } = await this.db.query("SELECT * FROM clients WHERE id = $1", [client]);
        return rows?.[0];
    }
}
