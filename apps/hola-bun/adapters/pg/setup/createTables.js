import { createUsersTable } from "../schema/users.sql.js";
import { createClientsTable } from "../schema/clients.sql.js";
import { createSessionsTable } from "../schema/sessions.sql.js";

export async function createTables(client) {
    await client.query(createUsersTable);
    await client.query(createClientsTable);
    await client.query(createSessionsTable);
}