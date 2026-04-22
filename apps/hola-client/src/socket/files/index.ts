import path from "path";
import { Files } from "../../models/Files";
import fs from "fs";

export async function get(socket: any, id, cb: any) {
    if (!id) return cb({ error: "no id" });
    const file = await Files.findById(id);
    if (!file) return cb({ error: "file not found" });

    const fpath = path.resolve(__dirname, `../../../files/${file.path}`);
    if (!fpath) return cb({ error: "file not found" });
    if (!fs.existsSync(fpath)) return cb({ error: "file not found" });

    const buffer = await new Promise<Buffer>((resolve, reject) => {
        fs.readFile(fpath, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });

    cb({ sucess: true, buffer });
}