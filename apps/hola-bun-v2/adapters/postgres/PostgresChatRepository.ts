import EventEmitter from "eventemitter3";
import { PostgresChatInitializer } from "./PostgresChatInitializer";

export default class PostgresChatRepository {
    private eventEmitter = new EventEmitter();

    constructor(private connection: any) {
        new PostgresChatInitializer(connection);

        this.connection.query(`
            LISTEN chat_messages;
            LISTEN chat_activity;
            LISTEN chat_members;
        `);

        this.connection.on("notification", async (msg: any) => {
            const event = JSON.parse(msg.payload);
            const { type, new: newRow, old } = event;
            const baseRow = type === "DELETE" ? old : newRow;
            if (!baseRow) return;

            const payload = {
                ...baseRow,
                type,
                active: type === "DELETE" ? false : (baseRow.active ?? true),
                timestamp: newRow?.updated_at ?? newRow?.created_at ?? Date.now(),
            };

            if (msg.channel === "chat_messages") {
                payload.timestamp = newRow.created_at;
                await this.eventEmitter.emit("message", payload)

                const x = await this.getEveryMemberUnreadCount({ chat: payload.channel_id });
                await this.eventEmitter.emit("unread", x);

                return;
            };

            if (msg.channel === "chat_activity") {
                return this.eventEmitter.emit("activity", {
                    ...payload,
                    active: !!payload.status
                });
            }

            if (msg.channel === "chat_members") {
                payload.unreadCount = await this.getUnreadCount({
                    user: payload.user_id,
                    chat: payload.channel_id
                });
                this.eventEmitter.emit("member", payload);

                const x = await this.getEveryMemberUnreadCount({ chat: payload.channel_id });
                this.eventEmitter.emit("unread", x);

                return
            };
        });
    }

    public listenMessageChanges = (callback: any) => this.eventEmitter.on("message", callback);
    public listenActivityChanges = (callback: any) => this.eventEmitter.on("activity", callback);
    public listenMemberChanges = (callback: any) => this.eventEmitter.on("member", callback);
    public listenUnreadChanges = (callback: any) => this.eventEmitter.on("unread", callback);

    private async getEveryMemberUnreadCount({ chat }: { chat: any; }) {
        try {
            const { rows: [{ get_every_member_unread_count: result }] } = await this.connection.query("SELECT * FROM get_every_member_unread_count($1)", [chat]);
            return result;
        } catch (error) {
            console.error(error);
        }
    }

    private async getUnreadCount({ user, chat }: { user: any; chat: any; }) {
        try {
            const { rows: [{ get_unread_count: result }] } = await this.connection.query("SELECT * FROM get_unread_count($1, $2)", [user, chat]);
            return result;
        } catch (error) {
            console.error(error);
        }
    }

    public async createChat({ name = null, user }: { name?: string | null; user?: any; }) {
        try {
            const { rows: [channel] } = await this.connection.query("INSERT INTO chat_channels (name) VALUES ($1) RETURNING *", [name]);
            if (user) await this.joinChat({ user, chat: channel?.id, status: "active" });
            return channel;
        } catch (error) {
            console.error(error);
        }
    }

    public async joinChat({ user, chat, status = "pending" }: { user: any; chat: any; status?: string; }) {
        try {
            const { rows: [membership] } = await this.connection.query("INSERT INTO chat_members (user_id, channel_id, status) VALUES ($1, $2, $3) RETURNING *", [user, chat, status]);
            return membership;
        } catch (error) {
            console.error(error);
        }
    }

    public async getRecentlyActiveChannels({ user, offset = 0, limit = 10 }: { user: any; offset: number; limit: number; }) {
        try {
            const { rows } = await this.connection.query("SELECT * FROM get_user_channels($1) OFFSET $2 LIMIT $3", [user, offset, limit]);
            return rows;
        } catch (error) {
            console.error(error);
        }
    }

    public async getChatListItem(channel) {
        try {
            const { rows: [{ get_chat_list_item: result }] } = await this.connection.query("SELECT * FROM get_chat_list_item($1)", [channel]);
            return result;
        } catch (error) {
            console.error(error);
        }
    }

    public async getChatListItems(channels) {
        try {
            const { rows } = await this.connection.query(`
                SELECT get_chat_list_item(id) as item
                FROM unnest($1::uuid[]) as id
            `, [channels]);

            return rows.map((r: any) => r.item);
        } catch (error) {
            console.error(error);
        }
    }

    public async setChatMessage({ channel, user, content }: { channel: any; user: any; content: string; }) {
    }

    public async setChatActivity({
        channel, user, status,
    }: {
        channel: string;
        user: string;
        status: string;

    }) {
        const { rows: [activity] } = await this.connection.query(`
            INSERT INTO chat_activity (channel_id, user_id, status)
            VALUES ($1, $2, $3)
            ON CONFLICT (channel_id, user_id)
            DO UPDATE SET
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `, [channel, user, status]);

        return activity;
    }

    public async getChatList(user) {
        try {
            const { rows } = await this.connection.query("SELECT * FROM get_user_channels($1)", [user]);
            return rows;
        } catch (error) {
            console.error(error);
        }
    }

    public async getChatMessages({ channel, before = Date.now(), limit }: any) {
        try {
            const { rows: [{ get_chat_messages: result }] } = await this.connection.query(` SELECT * FROM get_chat_messages($1, $2, $3) `, [channel, before, limit]);

            return result || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    public async checkAuthorization({ channel, user }: { channel: any; user: any; }) {
        try {
            const { rows: [{ check_authorization: result }] } = await this.connection.query("SELECT * FROM check_authorization($1, $2)", [channel, user]);
            return result;
        } catch (error) {
            console.error(error);
        }
    }
}
