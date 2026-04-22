import { Server, Socket } from "socket.io";
import SocketController from "./SocketController";
import type { ProfileService } from "../../services/ProfileService";
import type { UserUpdatePayloadEntity } from "../../domain/entities/users/UserUpdatePayloadEntity";

export class SocketProfileController extends SocketController<any> {
    constructor(
        io: Server,
        namespace: string,
        private readonly profileService: ProfileService,
        middlewares: Array<(socket: Socket, next: (err?: Error) => void) => void> = []
    ) {
        super(io, namespace, profileService, middlewares);
    }

    override controller = (socket: Socket) => {
        socket.on(
            "profile:get",
            async (
                _payload: unknown,
                callback: (res: { success: boolean; user?: unknown; message?: string }) => void
            ) => {
                try {
                    const user = await this.profileService.get(socket.data.user.id);
                    callback({ success: true, user });
                } catch (err) {
                    callback({ success: false, message: err instanceof Error ? err.message : "GET_FAILED" });
                }
            }
        );

        socket.on(
            "profile:update",
            async (
                payload: UserUpdatePayloadEntity,
                callback: (res: { success: boolean; user?: unknown; message?: string }) => void
            ) => {
                try {
                    const user = await this.profileService.update(socket.data.user.id, payload);
                    callback({ success: true, user });
                } catch (err) {
                    callback({ success: false, message: err instanceof Error ? err.message : "UPDATE_FAILED" });
                }
            }
        );

        socket.on(
            "profile:delete",
            async (
                _payload: unknown,
                callback: (res: { success: boolean; message?: string }) => void
            ) => {
                try {
                    await this.profileService.delete(socket.data.user.id);
                    callback({ success: true });
                } catch (err) {
                    callback({ success: false, message: err instanceof Error ? err.message : "DELETE_FAILED" });
                }
            }
        );
    };
}