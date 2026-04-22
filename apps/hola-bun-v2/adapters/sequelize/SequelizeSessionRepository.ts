import { Sequelize, DataTypes } from "sequelize";

export class SequelizeSessionRepository implements SessionRepositoryPort {
    private model: any;

    constructor(private readonly sequelize: Sequelize) {
        this.model = sequelize.define("Session", {
            id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
            client_id: { type: DataTypes.UUID, allowNull: false, references: { model: "clients", key: "id" }, onDelete: "CASCADE" },
            user_id: { type: DataTypes.UUID, allowNull: true, references: { model: "users", key: "id" }, onDelete: "CASCADE" },
            active: { type: DataTypes.BOOLEAN, defaultValue: true },
        }, {
            tableName: "sessions",
            underscored: true,
            timestamps: true,
            indexes: [
                { fields: ["client_id"] },
                { fields: ["user_id"] },
                { fields: ["client_id", "active"] },
                { unique: true, fields: ["client_id", "user_id"] },
            ],
        });

        this.sequelize.sync({ alter: true })
            .then(() => this.initFunctions())
            .catch(console.error);
    }

    private async initFunctions() {
        await this.sequelize.query(`
      CREATE OR REPLACE FUNCTION get_active_sessions(p_client_id UUID)
      RETURNS JSON AS $$
      DECLARE result JSON;
      BEGIN
        SELECT json_build_object(
          'client', p_client_id,
          'users', COALESCE(
            json_agg(
              json_build_object('id', s.user_id, 'timestamp', s.updated_at)
            ) FILTER (WHERE s.user_id IS NOT NULL),
            '[]'::json
          )
        )
        INTO result
        FROM sessions s
        WHERE s.client_id = p_client_id AND s.active = true;
        RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `);
    }

    async getSessions(clientId: string) {
        const [rows] = await this.sequelize.query(
            "SELECT get_active_sessions(:clientId) AS result",
            { replacements: { clientId } }
        );
        return (rows[0] as any)?.result ?? null;
    }

    async addSession(clientId: string, userId: string) {
        await this.sequelize.query(`
      INSERT INTO sessions (client_id, user_id)
      VALUES (:clientId, :userId)
      ON CONFLICT (client_id, user_id)
      DO UPDATE SET active = true, updated_at = now()
    `, { replacements: { clientId, userId } });
    }

    async removeSession(clientId: string, userId: string) {
        await this.sequelize.query(`
      UPDATE sessions SET active = false, updated_at = now()
      WHERE client_id = :clientId AND user_id = :userId
    `, { replacements: { clientId, userId } });
    }
}