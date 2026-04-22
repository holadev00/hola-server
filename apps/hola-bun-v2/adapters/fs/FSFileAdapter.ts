import fs from "fs/promises";
import path from "path";
import type { FilesAdapterPort } from "../../domain/ports/files/FilesAdapterPort";

export class FSFilesAdapter implements FilesAdapterPort {
    constructor(private readonly baseDir: string) { }

    async write(name: string, data: ArrayBuffer): Promise<string> {
        await fs.mkdir(this.baseDir, { recursive: true });

        const ext = path.extname(name);
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const filepath = path.join(this.baseDir, filename);

        await fs.writeFile(filepath, Buffer.from(data));
        return filepath;
    }

    async read(filePath: string): Promise<Buffer> {
        return fs.readFile(filePath);
    }

    buildUrl(filePath: string): string {
        return `/files/${path.basename(filePath)}`;
    }
}