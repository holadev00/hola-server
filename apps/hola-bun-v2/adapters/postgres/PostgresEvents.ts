export class PostgresEvents {
    private handlers = new Map<string, Set<(payload: any) => void>>();

    constructor(private client: any) {
        this.initChatChanges().catch(console.error);
        this.initRelationshipChanges().catch(console.error);
        this.initSessionChanges().catch(console.error);

        this.client.on("notification", ({ channel, payload }: any) => {
            const set = this.handlers.get(channel);
            if (!set?.size) return;
            try {
                const parsed = JSON.parse(payload || "{}");
                set.forEach((fn) => fn(parsed));
            } catch {
                console.error(`[pg:notify] payload invalide sur "${channel}"`, payload);
            }
        });

        this.client.on("error", (err: any) => {
            console.error("[pg:notify] erreur client", err);
        });
    }

    on = (channel: string, handler: (payload: any) => void): () => void => {
        if (!this.handlers.has(channel)) {
            this.handlers.set(channel, new Set());
            this.client.query(`LISTEN "${channel}"`).catch(console.error);
        }

        this.handlers.get(channel)!.add(handler);

        return () => {
            const set = this.handlers.get(channel);
            set?.delete(handler);
            if (set?.size === 0) {
                this.handlers.delete(channel);
                this.client.query(`UNLISTEN "${channel}"`).catch(console.error);
            }
        };
    };

    initChatChanges = async () => {
        await this.client.query(`
        CREATE OR REPLACE FUNCTION chat_notify_change()
        RETURNS trigger AS $$
        DECLARE _channel_id uuid;
        BEGIN
          _channel_id := COALESCE(NEW.channel_id, OLD.channel_id);
          PERFORM pg_notify('chat_change', json_build_object(
            'table',     TG_TABLE_NAME,
            'op',        TG_OP,
            'channelId', _channel_id
          )::text);
          RETURN COALESCE(NEW, OLD);
        END;
        $$ LANGUAGE plpgsql;
  
        CREATE OR REPLACE TRIGGER trg_chat_members_notify
        AFTER INSERT OR UPDATE OR DELETE ON chat_members
        FOR EACH ROW EXECUTE FUNCTION chat_notify_change();
  
        CREATE OR REPLACE TRIGGER trg_chat_messages_notify
        AFTER INSERT OR UPDATE OR DELETE ON chat_messages
        FOR EACH ROW EXECUTE FUNCTION chat_notify_change();
  
        CREATE OR REPLACE TRIGGER trg_chat_activity_notify
        AFTER INSERT OR UPDATE OR DELETE ON chat_activity
        FOR EACH ROW EXECUTE FUNCTION chat_notify_change();
      `);

        await this.client.query(`LISTEN "chat_change"`);
    };

    initRelationshipChanges = async () => {
        await this.client.query(`
        CREATE OR REPLACE FUNCTION relationship_notify_change()
        RETURNS trigger AS $$
        BEGIN
          PERFORM pg_notify('relationship_change', json_build_object(
            'op',     TG_OP,
            'type',   COALESCE(NEW.type,    OLD.type),
            'fromId', COALESCE(NEW.from_id, OLD.from_id),
            'toId',   COALESCE(NEW.to_id,   OLD.to_id)
          )::text);
          RETURN COALESCE(NEW, OLD);
        END;
        $$ LANGUAGE plpgsql;
  
        CREATE OR REPLACE TRIGGER trg_relationships_notify
        AFTER INSERT OR UPDATE OR DELETE ON relationships
        FOR EACH ROW EXECUTE FUNCTION relationship_notify_change();
      `);

        await this.client.query(`LISTEN "relationship_change"`);
    };

    initSessionChanges = async () => {
        await this.client.query(`
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
  
        CREATE OR REPLACE FUNCTION notify_active_sessions()
        RETURNS TRIGGER AS $$
        DECLARE payload JSON;
        BEGIN
          payload := get_active_sessions(NEW.client_id);
          PERFORM pg_notify('sessions_update', payload::text);
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
  
        CREATE OR REPLACE TRIGGER sessions_update_trigger
        AFTER INSERT OR UPDATE ON sessions
        FOR EACH ROW EXECUTE FUNCTION notify_active_sessions();
      `);

        await this.client.query(`LISTEN "sessions_update"`);
    };
}