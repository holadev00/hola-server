import { DataTypes, Sequelize } from "sequelize";
import type { ClientRepositoryPort } from "@amine-chat/auth-domain/domain/ports/auth/ClientRepositoryPort";

export class SequelizeClientRepository implements ClientRepositoryPort {
    private models: any = {};

    constructor(sequelize: Sequelize) {
        this.models.Client = sequelize.define('Client', {
            id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        }, {
            underscored: true,
            timestamps: true,
            paranoid: true,
            tableName: 'clients',
        });

        sequelize.sync({ alter: true }).catch(console.error);
    }

    async createClient() {
        const client = await this.models.Client.create();
        return client.id;
    }

    async getClient(client: string) {
        try {
            const clientRow = await this.models.Client.findOne({ where: { id: client } });
            return {
                id: clientRow.id
            };
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}
