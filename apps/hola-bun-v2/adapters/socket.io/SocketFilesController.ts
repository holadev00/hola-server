
import { Socket } from "socket.io";
import SocketController from "./SocketController";
import type { FileService } from "../../services/FileService";

export default class SocketFilesController extends SocketController<FileService> {
    constructor(io: any, path: string, service: FileService, middlewares: any[]) {
        super(io, path, service, middlewares);
    }

    override controller = (socket: Socket) => {
        socket.on(
            "file:upload",
            async (
                payload: { name: string; type: string; data: ArrayBuffer },
                callback: (res: { success: boolean; id?: string; message?: string }) => void
            ) => {
                try {
                    console.log(payload);
                    const file = await this.service.upload(payload.name, payload.type, payload.data);
                    console.log(file);
                    callback({ success: true, id: file.id });
                } catch (err) {
                    console.error(err);
                    callback({ success: false, message: err instanceof Error ? err.message : "UPLOAD_FAILED" });
                }
            }
        );

        socket.on(
            "file:expose",
            async (
                payload: { id: string },
                callback: (res: { success: boolean; file?: { id: string; name: string; url: string }; message?: string }) => void
            ) => {
                try {
                    const file = await this.service.expose(payload.id);
                    callback({ success: true, file });
                } catch (err) {
                    callback({ success: false, message: err instanceof Error ? err.message : "EXPOSE_FAILED" });
                }
            }
        );

        /*socket.onAny((event, ...args) => console.log("onAny", { event, args }));
        socket.onAnyOutgoing((event, ...args) => console.log("onAnyOutgoing", { event, args }));

        socket.eventNames().forEach((event) => {
            console.log("event", socket.nsp.name, event);
        });*/
    };
}