import { escapeIdentifier } from "pg";

export class PostgresChatInitializer {
    constructor(private connection: any) {
        this.init()
            //.then(console.log)
            .catch(console.error);
    }

    async init() {
        if (!this.connection._connected) await this.connection.connect();
        await this.initChatChannels();
        await this.initChatMembers();
        await this.initChatMessages();
        await this.initChatActivity();

        await this.initNotifyTableTrigger();
        await this.initChatTableTrigger("chat_members");
        await this.initChatTableTrigger("chat_messages");
        await this.initChatTableTrigger("chat_activity");

        await this.initGetUserChannels();
        await this.initGetChatListItem();
        await this.initGetUnreadCount();
        await this.initGetEveryMemberUnreadCount();
        await this.initGetChatMessages();
        await this.initCheckAuthorization();
    }

    async initChatChannels() {
        try {
            await this.connection.query(`
                CREATE TABLE IF NOT EXISTS chat_channels (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255),
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);
        } catch (error) {
            console.error(error);
        }
    }

    async initChatMembers() {
        try {
            await this.connection.query(`
                CREATE TABLE IF NOT EXISTS chat_members (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    status VARCHAR(255),
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    last_read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);
        } catch (error) {
            console.error(error);
        }
    }

    async initChatMessages() {
        try {
            await this.connection.query(`
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    content JSONB NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);
        } catch (error) {
            console.error(error);
        }
    }

    async initChatActivity() {
        try {
            await this.connection.query(`
                CREATE TABLE IF NOT EXISTS chat_activity (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    status VARCHAR(255),
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);
        } catch (error) {
            console.error(error);
        }
    }

    async initNotifyTableTrigger() {
        try {
            await this.connection.query(`
                CREATE OR REPLACE FUNCTION notify_table_change()
                RETURNS TRIGGER AS $$
                DECLARE
                    payload JSON;
                BEGIN
                    payload = json_build_object(
                        'type', TG_OP,
                        'table', TG_TABLE_NAME,
                        'old', row_to_json(OLD),
                        'new', row_to_json(NEW),
                        'timestamp', now()
                    );
            
                    PERFORM pg_notify(TG_TABLE_NAME, payload::text);
            
                    RETURN COALESCE(NEW, OLD);
                END;
                $$ LANGUAGE plpgsql;
              `);
        } catch (error) {
            console.error(error);
        }
    }

    async initChatTableTrigger(table: string) {
        try {
            const t = escapeIdentifier(table);
            const triggerName = `${table}_notify_trigger`;
            const trg = escapeIdentifier(triggerName);

            await this.connection.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (
                    SELECT 1 FROM pg_trigger WHERE tgname = '${triggerName}'
                    ) THEN
                    CREATE TRIGGER ${trg}
                    AFTER INSERT OR UPDATE OR DELETE ON ${t}
                    FOR EACH ROW
                    EXECUTE FUNCTION notify_table_change();
                    END IF;
                END;
                $$;
            `);
        } catch (error) {
            console.error(error);
        }
    }

    async initGetUserChannels() {
        await this.connection.query(`
            CREATE OR REPLACE FUNCTION get_user_channels(p_user_id UUID)
            RETURNS TABLE (
                id UUID,
                "timestamp" TIMESTAMP
            )
            AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    c.id AS id,
                    GREATEST(
                        c.created_at,
                        COALESCE(MAX(m.created_at), c.created_at),
                        COALESCE(MAX(a.created_at), c.created_at)
                    ) AS timestamp
                FROM chat_members cm
                JOIN chat_channels c ON c.id = cm.channel_id
                LEFT JOIN chat_messages m ON m.channel_id = c.id
                LEFT JOIN chat_activity a ON a.channel_id = c.id
                WHERE cm.user_id = p_user_id
                GROUP BY c.id, c.created_at
                ORDER BY timestamp DESC;
            END;
            $$ LANGUAGE plpgsql;
        `);
    }

    async initGetChatListItem() {
        await this.connection.query(`
            CREATE OR REPLACE FUNCTION get_chat_list_item(p_channel_id UUID)
            RETURNS JSON AS $$
            DECLARE
                result JSON;
            BEGIN
                SELECT json_build_object(
                    'id', c.id,
                    'name', c.name,

                    -- 👥 Members
                    'members', (
                        SELECT COALESCE(json_agg(json_build_object(
                            'source', cm.user_id,
                            'status', cm.status
                        )), '[]'::json)
                        FROM chat_members cm
                        WHERE cm.channel_id = c.id
                    ),

                    -- 💬 Last message
                    'lastMessage', (
                        SELECT json_build_object(
                            'id', m.id,
                            'source', m.user_id,
                            'content', m.content,
                            'timestamp', m.created_at
                        )
                        FROM chat_messages m
                        WHERE m.channel_id = c.id
                        ORDER BY m.created_at DESC
                        LIMIT 1
                    ),

                    -- ⚡ Current activities (récentes)
                    'currentActivities', (
                        SELECT COALESCE(json_agg(json_build_object(
                            'source', a.user_id,
                            'status', a.status,
                            'timestamp', a.created_at
                        )), '[]'::json)
                        FROM chat_activity a
                        WHERE a.channel_id = c.id
                        AND a.status IS NOT NULL
                    )
                )
                INTO result
                FROM chat_channels c
                WHERE c.id = p_channel_id;

                RETURN result;
            END;
            $$ LANGUAGE plpgsql;
        `);
    }

    async initGetUnreadCount() {
        await this.connection.query(`
            CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID, p_channel_id UUID)
            RETURNS INT AS $$
            SELECT COUNT(*)
            FROM chat_messages m
            JOIN chat_members cm 
                ON cm.channel_id = m.channel_id
            WHERE cm.user_id = p_user_id
                AND m.channel_id = p_channel_id
                AND m.created_at > cm.last_read_at;
            $$ LANGUAGE sql;
        `);
    }

    async initGetEveryMemberUnreadCount() {
        await this.connection.query(`
            CREATE OR REPLACE FUNCTION get_every_member_unread_count(p_channel_id UUID)
            RETURNS JSONB AS $$
                SELECT jsonb_build_object(
                    'channel_id', p_channel_id,
                    'members', COALESCE(jsonb_agg(member), '[]'::jsonb)
                )
                FROM (
                    SELECT 
                        cm.user_id,
                        jsonb_build_object(
                            'user_id', cm.user_id,
                            'unread_count', COUNT(m.id)
                        ) AS member
                    FROM chat_members cm
                    LEFT JOIN chat_messages m
                        ON m.channel_id = cm.channel_id
                        AND m.created_at > cm.last_read_at
                    WHERE cm.channel_id = p_channel_id
                    GROUP BY cm.user_id
                ) sub;
            $$ LANGUAGE sql;
        `);
    }

    async initGetChatMessages() {
        await this.connection.query(`
            CREATE OR REPLACE FUNCTION get_chat_messages(
                p_channel_id UUID,
                p_before BIGINT,
                p_limit INT
            )
            RETURNS JSON AS $$
                SELECT COALESCE(
                    json_agg(
                        json_build_object(
                            'id', m.id,
                            'source', m.user_id,
                            'content', m.content,
                            'timestamp', m.created_at,
                            'updated', m.updated_at
                        )
                        ORDER BY m.created_at DESC
                    ),
                    '[]'::json
                )
                FROM (
                    SELECT *
                    FROM chat_messages
                    WHERE channel_id = p_channel_id
                    AND created_at < to_timestamp(p_before / 1000.0)
                    ORDER BY created_at DESC
                    LIMIT p_limit
                ) m;
            $$ LANGUAGE sql;
        `);
    }

    async initCheckAuthorization() {
        await this.connection.query(`
            CREATE OR REPLACE FUNCTION check_authorization(p_channel UUID, p_user UUID)
            RETURNS BOOLEAN AS $$
            DECLARE
                member_status VARCHAR;
            BEGIN
                SELECT status INTO member_status
                FROM chat_members
                WHERE channel_id = p_channel
                AND user_id = p_user;

                IF member_status IS NULL THEN
                    RETURN FALSE;
                END IF;

                IF member_status = 'banned' THEN
                    RETURN FALSE;
                END IF;

                RETURN TRUE;
            END;
            $$ LANGUAGE plpgsql;
`);
    }
}
