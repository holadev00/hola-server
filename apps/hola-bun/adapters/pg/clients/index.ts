import pg from "pg";

export const sql = new pg.Client({
    host: process.env.HOLA_POSTGRES_HOST,
    port: process.env.HOLA_POSTGRES_PORT,
    user: process.env.HOLA_POSTGRES_USER,
    password: process.env.HOLA_POSTGRES_PASSWORD,
    database: process.env.HOLA_POSTGRES_DB,
});