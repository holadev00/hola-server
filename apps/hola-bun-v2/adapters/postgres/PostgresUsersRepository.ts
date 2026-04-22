import { PostgresRepository } from "./PostgresRepository";
import type { UsersRepositoryPort } from "@amine-chat/auth-domain/domain/ports/auth/UsersRepositoryPort";

export default class PostgresUsersRepository extends PostgresRepository implements UsersRepositoryPort {
    override async init() {
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                displayname VARCHAR(255),
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async findUserByIdentifier(identifier: string) {
        const { rows } = await this.db.query("SELECT * FROM users WHERE username = $1 OR email = $1", [identifier]);
        return rows?.[0];
    }

    async createUser({ username, displayname, email, password }) {
        const { rows } = await this.db.query("INSERT INTO users (username, displayname, email, password) VALUES ($1, $2, $3, $4) RETURNING *", [username, displayname, email, password]);
        return rows?.[0];
    }
}
