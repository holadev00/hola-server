import { Sequelize, DataTypes, Model } from "sequelize";
import type { FilesRepositoryPort } from "../../domain/ports/files/FilesRepositoryPort";
import type { FileEntity } from "../../domain/entities/files/FilesEntity";

export class SequelizeFilesRepository implements FilesRepositoryPort {
    private models: any = {};

    constructor(private readonly sequelize: Sequelize) {
        this.models.File = sequelize.define("File",
            {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                name: { type: DataTypes.STRING, allowNull: false },
                type: { type: DataTypes.STRING, allowNull: false },
                path: { type: DataTypes.STRING, allowNull: false },
                createdAt: { type: DataTypes.DATE, allowNull: false },
            },
            {
                tableName: "files",
                timestamps: true,
                underscored: true,
                paranoid: true
            }
        );

        this.sequelize.sync({ alter: true }).catch(console.error).then(() => console.log("Files table synced"));
    }

    async save(file: Omit<FileEntity, "id" | "createdAt">): Promise<FileEntity> {
        const record = await this.models.File.create(file as object);
        return record.toJSON() as FileEntity;
    }

    async findById(id: string): Promise<FileEntity | null> {
        const record = await this.models.File.findByPk(id);
        return record ? (record.toJSON() as FileEntity) : null;
    }
}