import { SessionRepositoryPort } from "@amine-chat/auth-domain/domain/ports/auth/SessionRepositoryPort";
import { PostgresRepository } from "./PostgresRepository";

export class PostgresSessionRepository extends PostgresRepository implements SessionRepositoryPort {
    override async init() {
        await this.db.query(`CREATE TABLE IF NOT EXISTS sessions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID REFERENCES clients(id) ON DELETE CASCADE, user_id UUID REFERENCES users(id) ON DELETE CASCADE, active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT now(), updated_at TIMESTAMP DEFAULT now(), UNIQUE (client_id, user_id));`);
        await this.db.query(`CREATE INDEX IF NOT EXISTS sessions_client_id_idx ON sessions (client_id);`);
        await this.db.query(`CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);`);
        await this.db.query(`CREATE INDEX IF NOT EXISTS sessions_client_active_idx ON sessions (client_id, active);`);
        await this.db.query(`
            CREATE OR REPLACE FUNCTION get_active_sessions(p_client_id UUID)
            RETURNS JSON AS $$
            DECLARE
                result JSON;
            BEGIN
                SELECT json_build_object(
                    'client', p_client_id,
                    'users', COALESCE(
                        json_agg(
                            json_build_object(
                                'id', s.user_id,
                                'timestamp', s.updated_at
                            )
                        ) FILTER (WHERE s.user_id IS NOT NULL),
                        '[]'::json
                    )
                )
                INTO result
                FROM sessions s
                WHERE s.client_id = p_client_id
                  AND s.active = true;
            
                RETURN result;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await this.db.query(`
            CREATE OR REPLACE FUNCTION notify_active_sessions()
            RETURNS TRIGGER AS $$
            DECLARE
                payload JSON;
            BEGIN
                -- récupérer les sessions actives du client concerné
                payload := get_active_sessions(NEW.client_id);
            
                -- envoyer l'event (LISTEN / NOTIFY)
                PERFORM pg_notify(
                    'sessions_update',
                    payload::text
                );
            
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await this.db.query(`
            CREATE OR REPLACE TRIGGER sessions_update_trigger
            AFTER INSERT OR UPDATE ON sessions
            FOR EACH ROW
            EXECUTE FUNCTION notify_active_sessions();
        `);

        await this.db.query(`LISTEN sessions_update;`);
    }

    async listen(onEvent: any) {
        this.db.on("notification", (msg) => {
            if (msg.channel !== "sessions_update") return;
            const payload = JSON.parse(msg.payload);
            onEvent(payload);
        });
    }

    async getSessions(client: string) {
        const { rows: [{ get_active_sessions: result }] } = await this.db.query("SELECT get_active_sessions($1)", [client]);
        return result;
    }

    async addSession(client: string, user: string) {
        try {
            console.log(await this.db.query("INSERT INTO sessions (client_id, user_id) VALUES ($1, $2) ON CONFLICT (client_id, user_id) DO UPDATE SET active = true, updated_at = now() RETURNING *", [client, user]));
        } catch (error) {
            console.error(error);
        }
    }

    async removeSession(client: string, user: string) {
        await this.db.query("UPDATE sessions SET active = false, updated_at = now() WHERE client_id = $1 AND user_id = $2", [client, user]);
    }
}
