import pg from "pg";

export class PostgresClient {
    client: any;

    constructor({
        host,
        port,
        user,
        password,
        database
    }) {
        this.client = new pg.Client({
            host,
            port,
            user,
            password,
            database
        });

        this.client.connect().catch(console.error);

        return this.client;
    }
}