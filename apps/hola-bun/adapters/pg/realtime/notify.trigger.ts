function escapeIdentifier(str) {
    return '"' + str.replace(/"/g, '""') + '"';
}

export async function createNotifyTrigger(client, table) {
    const t = escapeIdentifier(table);
    const triggerName = `${table}_notify_trigger`;
    const trg = escapeIdentifier(triggerName);

    await client.query(`
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

    await client.query(`LISTEN ${table}`);
}