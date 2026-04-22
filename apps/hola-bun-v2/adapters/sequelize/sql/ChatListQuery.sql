CREATE OR REPLACE FUNCTION get_chat_list(
    p_user_id    uuid    DEFAULT NULL,
    p_channel_id uuid    DEFAULT NULL,
    p_limit      int     DEFAULT 10,
    p_offset     int     DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
BEGIN
    WITH
    target_channels AS (
        SELECT
            c.id,
            c.name,
            c.type,
            c.active,
            cm.user_id,
            cm.role,
            cm.last_read_at,
            cm.joined_at
        FROM chat_channels c
        INNER JOIN chat_members cm ON cm.channel_id = c.id
        WHERE
            c.active = true
            AND (p_user_id    IS NULL OR cm.user_id  = p_user_id)
            AND (p_channel_id IS NULL OR c.id        = p_channel_id)
    ),

    -- Dernier message par channel
    last_messages AS (
        SELECT DISTINCT ON (channel_id)
            channel_id,
            id,
            content,
            user_id,
            created_at
        FROM chat_messages
        WHERE channel_id IN (SELECT id FROM target_channels)
        ORDER BY channel_id, created_at DESC
    ),

    -- Activités récentes par channel (10 max)
    recent_activities AS (
        SELECT
            channel_id,
            json_agg(
                json_build_object(
                    'id',         a.id,
                    'senderId',   a.user_id,
                    'type',       a.type,
                    'createdAt',  a.created_at
                )
                ORDER BY a.created_at DESC
            ) AS activities
        FROM (
            SELECT *,
                ROW_NUMBER() OVER (PARTITION BY channel_id ORDER BY created_at DESC) AS rn
            FROM chat_activity
            WHERE channel_id IN (SELECT id FROM target_channels)
            AND type IS NOT NULL
        ) a
        WHERE rn <= 10
        GROUP BY channel_id
    ),

    -- Membres avec unread par channel
    members_with_unread AS (
        SELECT
            cm.channel_id,
            json_agg(
                json_build_object(
                    'userId',      cm.user_id,
                    'role',        cm.role,
                    'lastReadAt',  cm.last_read_at,
                    'joinedAt',    cm.joined_at,
                    'unreadCount', (
                        SELECT COUNT(*)::int
                        FROM chat_messages msg
                        WHERE msg.channel_id = cm.channel_id
                        AND (
                            cm.last_read_at IS NULL
                            OR msg.created_at > cm.last_read_at
                        )
                    )
                )
            ) AS members
        FROM chat_members cm
        WHERE cm.channel_id IN (SELECT id FROM target_channels)
        GROUP BY cm.channel_id
    ),

    -- Assemblage final
    chat_items AS (
        SELECT
            tc.id                AS channel_id,
            tc.name              AS channel_name,
            tc.type              AS channel_type,
            tc.active            AS channel_active,
            tc.role              AS member_role,
            tc.last_read_at,
            COALESCE(mwu.members, '[]') AS members,

            CASE WHEN lm.id IS NOT NULL THEN
                json_build_object(
                    'id',        lm.id,
                    'content',   lm.content,
                    'senderId',  lm.user_id,
                    'createdAt', lm.created_at
                )
            END                  AS last_message,

            (
                SELECT COUNT(*)::int
                FROM chat_messages msg
                WHERE msg.channel_id = tc.id
                AND (
                    tc.last_read_at IS NULL
                    OR msg.created_at > tc.last_read_at
                )
            )                    AS unread_count,

            COALESCE(ra.activities, '[]') AS current_activities,

            -- Pour le tri
            GREATEST(
                lm.created_at,
                (ra.activities->0->>'createdAt')::timestamptz
            )                    AS last_activity_at

        FROM target_channels tc
        LEFT JOIN last_messages      lm  ON lm.channel_id  = tc.id
        LEFT JOIN recent_activities  ra  ON ra.channel_id  = tc.id
        LEFT JOIN members_with_unread mwu ON mwu.channel_id = tc.id
    )

    SELECT jsonb_agg(
        jsonb_build_object(
            'channelId',         ci.channel_id,
            'channelName',       ci.channel_name,
            'channelType',       ci.channel_type,
            'channelActive',     ci.channel_active,
            'members',           ci.members,
            'lastMessage',       ci.last_message,
            'currentActivities', ci.current_activities
        )
        ORDER BY ci.last_activity_at DESC NULLS LAST
    )
    INTO result
    FROM (
        SELECT * FROM chat_items
        LIMIT  p_limit
        OFFSET p_offset
    ) ci;

    RETURN COALESCE(result, '[]'::jsonb);

END;
$$;