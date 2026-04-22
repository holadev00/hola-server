import { Sequelize, DataTypes } from "sequelize";
import type { RelationshipsRepositoryPort } from "../../domain/ports/relationships/RelationshipsRepositoryPort";
import type { MutualRelationshipEntity } from "../../domain/entities/realationships/MutualRelationshipEntity";
import type { RelationshipEntity } from "../../domain/entities/realationships/RelationshipEntity";
import type { RelationshipTypeEnitity } from "../../domain/entities/realationships/RelationshipTypeEnitity";

export class SequelizeRelationshipsRepository implements RelationshipsRepositoryPort {
  private model: any;

  constructor(private readonly sequelize: Sequelize) {
    this.model = sequelize.define("relationship", {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      from_id: { type: DataTypes.UUID, allowNull: false },
      to_id: { type: DataTypes.UUID, allowNull: false },
      type: { type: DataTypes.ENUM("follow", "request", "block"), allowNull: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    }, {
      tableName: "relationships",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["from_id", "to_id", "type"] },
        { fields: ["from_id", "type"] },
        { fields: ["to_id", "type"] },
      ],
    });

    this.sequelize.sync({ alter: true }).catch(console.error);
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  private mutualSelect(userId: string) {
    return `
      SELECT
        target.id AS user_id,

        EXISTS (
          SELECT 1 FROM relationships
          WHERE from_id = :userId AND to_id = target.id AND type = 'follow'
        ) AS is_following,

        EXISTS (
          SELECT 1 FROM relationships
          WHERE from_id = target.id AND to_id = :userId AND type = 'follow'
        ) AS is_followed_by,

        EXISTS (
          SELECT 1 FROM relationships r1
          JOIN relationships r2
            ON r1.from_id = r2.to_id AND r1.to_id = r2.from_id
           AND r1.type = 'follow' AND r2.type = 'follow'
          WHERE r1.from_id = :userId AND r1.to_id = target.id
        ) AS is_friend,

        EXISTS (
          SELECT 1 FROM relationships
          WHERE from_id = :userId AND to_id = target.id AND type = 'block'
        ) AS is_blocked,

        EXISTS (
          SELECT 1 FROM relationships
          WHERE from_id = target.id AND to_id = :userId AND type = 'block'
        ) AS is_blocked_by,

        EXISTS (
          SELECT 1 FROM relationships
          WHERE from_id = :userId AND to_id = target.id AND type = 'request'
        ) AS has_pending_request,

        EXISTS (
          SELECT 1 FROM relationships
          WHERE from_id = target.id AND to_id = :userId AND type = 'request'
        ) AS has_received_request
    `;
  }

  private mapRow(row: any): MutualRelationshipEntity {
    return {
      user_id: row.user_id,
      is_following: Boolean(row.is_following),
      is_followed_by: Boolean(row.is_followed_by),
      is_friend: Boolean(row.is_friend),
      is_blocked: Boolean(row.is_blocked),
      is_blocked_by: Boolean(row.is_blocked_by),
      has_pending_request: Boolean(row.has_pending_request),
      has_received_request: Boolean(row.has_received_request),
    };
  }

  upsert = async (from: string, to: string, type: RelationshipTypeEnitity): Promise<RelationshipEntity> => {
    const [rel] = await this.model.upsert(
      { from_id: from, to_id: to, type, created_at: new Date() },
      { returning: true }
    );
    return rel.toJSON() as RelationshipEntity;
  };

  remove = async (from: string, to: string): Promise<void> => {
    await this.model.update({ where: { from_id: from, to_id: to }, data: { type: null } });
  };

  getMutual = async (userId: string, targetId: string): Promise<MutualRelationshipEntity> => {
    const [rows] = await this.sequelize.query(`
      ${this.mutualSelect(userId)}
      FROM users target
      WHERE target.id = :targetId
    `, { replacements: { userId, targetId } });

    const row = (rows as any[])[0];
    if (!row) throw new Error(`USER_NOT_FOUND:${targetId}`);
    return this.mapRow(row);
  };

  getMutualList = async (userId: string, { limit, offset }: { limit: number; offset: number }): Promise<MutualRelationshipEntity[]> => {
    const [rows] = await this.sequelize.query(`
      ${this.mutualSelect(userId)}
      FROM users target
      WHERE target.id != :userId
        AND EXISTS (
          SELECT 1 FROM relationships
          WHERE (from_id = :userId AND to_id = target.id)
             OR (from_id = target.id AND to_id = :userId)
        )
      LIMIT :limit OFFSET :offset
    `, { replacements: { userId, limit, offset } });

    return (rows as any[]).map(this.mapRow);
  };

  getFriends = async (userId: string, { limit, offset }: { limit: number; offset: number }): Promise<MutualRelationshipEntity[]> => {
    const [rows] = await this.sequelize.query(`
      ${this.mutualSelect(userId)}
      FROM users target
      JOIN relationships r1 ON r1.from_id = :userId  AND r1.to_id = target.id AND r1.type = 'follow'
      JOIN relationships r2 ON r2.from_id = target.id AND r2.to_id = :userId  AND r2.type = 'follow'
      LIMIT :limit OFFSET :offset
    `, { replacements: { userId, limit, offset } });

    return (rows as any[]).map(this.mapRow);
  };

  getFollowers = async (userId: string, { limit, offset }: { limit: number; offset: number }): Promise<MutualRelationshipEntity[]> => {
    const [rows] = await this.sequelize.query(`
      ${this.mutualSelect(userId)}
      FROM users target
      JOIN relationships r ON r.from_id = target.id AND r.to_id = :userId AND r.type = 'follow'
      LIMIT :limit OFFSET :offset
    `, { replacements: { userId, limit, offset } });

    return (rows as any[]).map(this.mapRow);
  };

  getFollowing = async (userId: string, { limit, offset }: { limit: number; offset: number }): Promise<MutualRelationshipEntity[]> => {
    const [rows] = await this.sequelize.query(`
      ${this.mutualSelect(userId)}
      FROM users target
      JOIN relationships r ON r.from_id = :userId AND r.to_id = target.id AND r.type = 'follow'
      LIMIT :limit OFFSET :offset
    `, { replacements: { userId, limit, offset } });

    return (rows as any[]).map(this.mapRow);
  };

  getPendingRequests = async (userId: string, { limit, offset }: { limit: number; offset: number }): Promise<MutualRelationshipEntity[]> => {
    const [rows] = await this.sequelize.query(`
      ${this.mutualSelect(userId)}
      FROM users target
      JOIN relationships r ON r.from_id = target.id AND r.to_id = :userId AND r.type = 'request'
      LIMIT :limit OFFSET :offset
    `, { replacements: { userId, limit, offset } });

    return (rows as any[]).map(this.mapRow);
  };
}