import { DataTypes, Op } from "sequelize";
import type { UsersRepositoryPort as AuthUsersRepositoryPort } from "../../domain/ports/auth/UsersRepositoryPort";
import type { UsersRepositoryPort } from "../../domain/ports/users/UsersRepositoryPort";

export class SequelizeUsersRepository implements UsersRepositoryPort, AuthUsersRepositoryPort {
    private models: any = {};

    constructor(sequelize: any) {
        this.models.User = sequelize.define('User', {
            id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
            displayname: { type: DataTypes.STRING, allowNull: true },
            username: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: false },
            password: { type: DataTypes.STRING, allowNull: true },
            avatar: { type: DataTypes.UUID, allowNull: true, references: { model: 'files', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
            private: { type: DataTypes.BOOLEAN, defaultValue: false },
            provider: { type: DataTypes.STRING, allowNull: true },
            provider_id: { type: DataTypes.STRING, allowNull: true },
        }, {
            tableName: 'users',
            underscored: true,
            timestamps: true,
            paranoid: true,
            indexes: [
                {
                    unique: true,
                    fields: ['username']
                },
                {
                    unique: true,
                    fields: ['email']
                }
            ]
        });

        sequelize.sync({ alter: true }).catch(console.error).then(() => console.log("Users table synced"));
    }

    async findById(id: string) {
        return await this.models.User.findByPk(id);
    }

    async findUserByIdentifier(identifier: string) {
        return await this.models.User.findOne({
            where: {
                [Op.or]: [
                    { username: identifier },
                    { email: identifier }
                ]
            }
        });
    }

    async createUser({ username, displayname, email, password, avatar }: { username: string; displayname: string; email: string; password: string; avatar?: string; }) {
        return await this.models.User.create({
            username,
            displayname,
            email,
            password,
            avatar
        });
    }

    async searchUsers(user: string, query: string): Promise<{ id: string; username: string; displayname: string; }[]> {
        return await this.models.User.findAll({
            attributes: { exclude: ["password"] },
            where: {
                [Op.or]: [
                    { displayname: { [Op.like]: `${query}%` } },
                    { username: { [Op.like]: `${query}%` } },
                ]
            }
        });
    }

    async update(id: string, payload: any) {
        return await this.models.User.update(payload, { where: { id } });
    }

    async delete(id: string) {
        return await this.models.User.destroy({ where: { id } });
    }

    async isPrivate(id: string) {
        const user = await this.findById(id);
        return user?.private ?? false;
    }
}
