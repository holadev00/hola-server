export async function createNotifyFunction(client) {
    await client.query(`
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
}