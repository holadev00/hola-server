import { Server, Socket } from "socket.io";
import SocketController from "./SocketController";
import type { RelationshipService } from "../../services/RelationshipService";

export class SocketRelationshipController extends SocketController<RelationshipService> {
    constructor(
        io: Server,
        namespace: string,
        private readonly relationshipService: RelationshipService,
        middlewares: Array<(socket: Socket, next: (err?: Error) => void) => void> = []
    ) {
        super(io, namespace, relationshipService, middlewares);

        this.service.hydrate(payload => {
            io.to(`user-${payload.receiver}`).emit("relationship:change", payload);
        })
    }

    override controller = (socket: Socket) => {
        socket.data.session.user.onChange(({ value, getPrevious }) => {
            const prev = getPrevious();
            if (prev) socket.leave(`user-${prev.id}`);
            if (value) socket.join(`user-${value.id}`);
        }, { initial: true, immediate: true });

        type CB<T = void> = (res: { success: boolean; data?: T; message?: string }) => void;

        function handle<T>(cb: CB<T>, fn: () => Promise<T>) {
            fn()
                .then((data) => cb({ success: true, data }))
                .catch((err) => cb({ success: false, message: err instanceof Error ? err.message : "UNKNOWN_ERROR" }));
        }

        // ─── writes ───────────────────────────────────────────────────────────────

        socket.on("relationship:follow", ({ targetId }: { targetId: string }, cb: CB) =>
            handle(cb, () => {
                const userId = socket.data.session.user.get().id;
                return this.service.followOrRequest(userId, targetId);
            })
        );

        socket.on("relationship:unfollow", ({ targetId }: { targetId: string }, cb: CB) =>
            handle(cb, () => {
                const userId = socket.data.session.user.get().id;
                return this.service.unfollow(userId, targetId);
            })
        );

        socket.on("relationship:request:accept", ({ fromId }: { fromId: string }, cb: CB) =>
            handle(cb, () => this.service.acceptRequest(userId, fromId))
        );

        socket.on("relationship:request:decline", ({ fromId }: { fromId: string }, cb: CB) =>
            handle(cb, () => this.service.declineRequest(userId, fromId))
        );

        socket.on("relationship:request:cancel", ({ toId }: { toId: string }, cb: CB) =>
            handle(cb, () => this.service.cancelRequest(userId, toId))
        );

        socket.on("relationship:follower:remove", ({ followerId }: { followerId: string }, cb: CB) =>
            handle(cb, () => this.service.removeFollower(userId, followerId))
        );

        socket.on("relationship:block", ({ targetId }: { targetId: string }, cb: CB) =>
            handle(cb, () => this.relationshipService.block(userId, targetId))
        );

        socket.on("relationship:unblock", ({ targetId }: { targetId: string }, cb: CB) =>
            handle(cb, () => this.relationshipService.unblock(userId, targetId))
        );

        // ─── reads ────────────────────────────────────────────────────────────────

        socket.on("relationship:mutual", (targetId: string, cb: CB) =>
            handle(cb, () => {
                const userId = socket.data.session.user.get().id;
                return this.service.getMutual(userId, targetId);
            })
        );

        socket.on("relationship:friends", ({ limit = 20, offset = 0 }: { limit?: number; offset?: number }, cb: CB) =>
            handle(cb, () => this.service.getFriends(userId, { limit, offset }))
        );

        socket.on("relationship:followers", ({ limit = 20, offset = 0 }: { limit?: number; offset?: number }, cb: CB) =>
            handle(cb, () => this.service.getFollowers(userId, { limit, offset }))
        );

        socket.on("relationship:following", ({ limit = 20, offset = 0 }: { limit?: number; offset?: number }, cb: CB) =>
            handle(cb, () => this.service.getFollowing(userId, { limit, offset }))
        );

        socket.on("relationship:requests", ({ limit = 20, offset = 0 }: { limit?: number; offset?: number }, cb: CB) =>
            handle(cb, () => this.service.getPendingRequests(userId, { limit, offset }))
        );
    };
}