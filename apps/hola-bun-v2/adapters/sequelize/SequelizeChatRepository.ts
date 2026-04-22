import { Sequelize, DataTypes, Model, Optional } from 'sequelize'
import { ChatRepositoryPort } from '../../../../packages/chat-domain/domain/ports/chat/ChatRepositoryPort'
import { ChatListItemEntity } from '../../../../packages/chat-domain/domain/entities/chat/ChatListItemEntity'
import { ChatChannelEntity } from '../../../../packages/chat-domain/domain/entities/chat/ChatChannelEntity'
import { ChatActivityEntity } from '../../../../packages/chat-domain/domain/entities/chat/ChatActivityEntity'
import { ChatMessageEntity } from '../../../../packages/chat-domain/domain/entities/chat/ChatMessageEntity'
import { ChatMemberEntity } from '../../../../packages/chat-domain/domain/entities/chat/ChatMemberEntity'
import ChatListQuery from './sql/ChatListQuery.sql' with { type: 'text' }

export class SequelizeChatRepository implements ChatRepositoryPort {
    private models: {
        channel?: any,
        member?: any,
        message?: any,
        activity?: any,
    } = {}

    constructor(private sequelize: Sequelize) {
        this.models.channel = sequelize.define('channel', {
            id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
            name: { type: DataTypes.STRING(100), allowNull: true },
            type: { type: DataTypes.ENUM('text', 'voice', 'announcement', 'private', 'group', 'channel'), defaultValue: 'text' },
            parent_id: { type: DataTypes.UUID, allowNull: true },
            active: { type: DataTypes.BOOLEAN, defaultValue: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        }, { sequelize, tableName: 'chat_channels', timestamps: false })

        this.models.member = sequelize.define('member', {
            id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
            channel_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
            user_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
            role: { type: DataTypes.ENUM('pending', 'banned', 'member', 'admin'), defaultValue: 'member' },
            last_read_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
            joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        }, { sequelize, tableName: 'chat_members', timestamps: false })

        this.models.message = sequelize.define('message', {
            id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
            channel_id: { type: DataTypes.UUID, allowNull: false },
            user_id: { type: DataTypes.UUID, allowNull: false },
            content: { type: DataTypes.JSONB, allowNull: false },
            parent_id: { type: DataTypes.UUID, allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        }, { sequelize, tableName: 'chat_messages', timestamps: false })

        this.models.activity = sequelize.define('activity', {
            id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
            channel_id: { type: DataTypes.UUID, allowNull: false },
            user_id: { type: DataTypes.UUID, allowNull: false },
            type: { type: DataTypes.ENUM('presence', 'text', 'audio', 'camera'), allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        }, { sequelize, tableName: 'chat_activity', timestamps: false })

        this.sequelize.sync({ alter: true }).catch(console.error)

        // Installe la fonction SQL get_chat_list
        this.sequelize.query(ChatListQuery).catch(console.error)
    }

    getUserChatList = async (params: { userId?: string; limit?: number; offset?: number }): Promise<ChatListItemEntity[]> => {
        const [result] = await this.sequelize.query(`
            SELECT get_chat_list(
                p_channel_id => null::uuid,
                p_user_id    => :userId::uuid,
                p_limit      => :limit::int,
                p_offset     => :offset::int
            )
        `, {
            replacements: {
                userId: params.userId ?? null,
                limit: params.limit ?? 10,
                offset: params.offset ?? 0,
            }
        })

        return (result[0] as any)?.get_chat_list ?? []
    }

    getChannelChatListItem = async (params: { channelId: string }): Promise<ChatListItemEntity[]> => {
        const [result] = await this.sequelize.query(`
            SELECT get_chat_list(
                p_user_id    => null::uuid,
                p_channel_id => :channelId::uuid,
                p_limit      => 1::int,
                p_offset      => 0::int
            )
        `, {
            replacements: { channelId: params.channelId }
        })

        return (result[0] as any)?.get_chat_list ?? []
    }

    createChannel = async (params: { name: string; type: string; user: string; guests: string[] }): Promise<ChatChannelEntity> => {
        const channel = await this.models.channel.create({
            name: params.name,
            type: params.type ?? 'private',
            active: true,
        })

        await this.models.member.bulkCreate([
            { channel_id: channel.get('id'), user_id: params.user, role: 'admin' },
            ...params.guests.map(guest => ({
                channel_id: channel.get('id'), user_id: guest, role: 'pending'
            }))
        ])

        return channel.toJSON() as ChatChannelEntity
    }

    inviteGuest = async (params: { userId: string; channelId: string; guestId: string }): Promise<ChatMemberEntity> => {
        const member = await this.models.member.create({
            channel_id: params.channelId,
            user_id: params.guestId,
            role: 'pending',
        })
        return member.toJSON() as ChatMemberEntity
    }

    joinChannel = async (params: { userId: string; channelId: string }): Promise<ChatMemberEntity> => {
        const member = await this.models.member.create({
            channel_id: params.channelId,
            user_id: params.userId,
            role: 'member',
        })
        return member.toJSON() as ChatMemberEntity
    }

    leaveChannel = async (params: { userId: string; channelId: string }): Promise<ChatMemberEntity> => {
        await this.models.member.update(
            { role: null },
            { where: { channel_id: params.channelId, user_id: params.userId } }
        )
        const member = await this.models.member.findOne({
            where: { channel_id: params.channelId, user_id: params.userId }
        })
        return member!.toJSON() as ChatMemberEntity
    }

    deleteChannel = async (params: { channelId: string }) => {
        await this.models.channel.update(
            { active: false },
            { where: { id: params.channelId } }
        )
    }

    updateChannel = async (params: { channelId: string; name: string }) => {
        await this.models.channel.update(
            { name: params.name },
            { where: { id: params.channelId } }
        )
    }

    upsertActivity = async (params: { channelId: string; senderId: string; type: string | null }): Promise<ChatActivityEntity> => {
        const [activity] = await this.models.activity.upsert({
            channel_id: params.channelId,
            sender_id: params.senderId,
            type: params.type,
            created_at: new Date(),
        })
        return activity.toJSON() as ChatActivityEntity
    }

    upsertMessage = async (params: { channelId: string; senderId: string; content: any[]; id?: string; parent?: string }): Promise<ChatMessageEntity> => {
        if (params.id) {
            const [message] = await this.models.message.upsert({
                id: params.id,
                channel_id: params.channelId,
                sender_id: params.senderId,
                content: params.content,
                parent_id: params.parent ?? null,
            })
            return message.toJSON() as ChatMessageEntity
        }

        const message = await this.models.message.create({
            channel_id: params.channelId,
            sender_id: params.senderId,
            content: params.content,
            parent_id: params.parent ?? null,
        })
        return message.toJSON() as ChatMessageEntity
    }

    checkExistingChannel = async (...members: string[]): Promise<ChatChannelEntity | null> => {
        const [result] = await this.sequelize.query(`
            SELECT c.id
            FROM chat_channels c
            WHERE c.active = true
              AND (
                SELECT COUNT(*)
                FROM chat_members m
                WHERE m.channel_id = c.id
                  AND m.role IN ('member', 'admin')
              ) = :count
              AND NOT EXISTS (
                SELECT 1
                FROM chat_members m
                WHERE m.channel_id = c.id
                  AND m.role IN ('member', 'admin')
                  AND m.user_id NOT IN (:members)
              )
              AND NOT EXISTS (
                SELECT 1 FROM (VALUES ${members.map((_, i) => `(:member${i}::uuid)`).join(", ")}) AS expected(uid)
                WHERE expected.uid NOT IN (
                    SELECT m.user_id
                    FROM chat_members m
                    WHERE m.channel_id = c.id
                      AND m.role IN ('member', 'admin')
                )
              )
            LIMIT 1
        `, {
            replacements: {
                count: members.length,
                members,
                ...Object.fromEntries(members.map((id, i) => [`member${i}`, id])),
            }
        });

        if (!result.length) return null;

        const channel = await this.models.channel.findByPk((result[0] as any).id);
        return channel ? channel.toJSON() as ChatChannelEntity : null;
    }
}