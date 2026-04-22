import { Sequelize } from 'sequelize';

export class SequelizeClient {
    constructor({ host, port, database, username, password, logging = false, dialect }: { host: string, port: string | number, database: string, username: string, password: string, logging?: boolean, dialect: string }) {
        if (!host) throw new Error('host is required');
        if (!port) throw new Error('port is required');
        if (!database) throw new Error('database is required');
        if (!username) throw new Error('username is required');
        if (!password) throw new Error('password is required');
        if (!dialect) throw new Error('dialect is required');

        const client = new Sequelize({
            host,
            port: Number(port),
            dialect,
            database,
            username,
            password,
            logging
        });

        try {
            client.authenticate().catch(console.error).then(console.log);
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }

        return client as Sequelize;
    }
}