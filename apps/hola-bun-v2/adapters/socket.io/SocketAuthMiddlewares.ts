import { CookieMap } from "bun";
import { observable } from "@legendapp/state";
import type { AuthServicePort } from "../../domain/ports/AuthServicePort";

export class SocketAuthMiddlewares {
    constructor(private service: AuthServicePort) {
        this.authenticateMw = this.authenticateMw.bind(this);
        this.enforceAuthMw = this.enforceAuthMw.bind(this);
    }

    authenticateMw = async (socket, next) => {
        const cookies = new CookieMap(socket.handshake.headers.cookie || "");
        const token = cookies.get("token") as string | undefined;
        const visitorToken = socket.handshake.query.VTKN as string | undefined;
        if (!token && !visitorToken) return next(new Error('unauthorized'));

        const client = await this.service.authenticateToken(visitorToken!, token);
        if (!client) return next(new Error('unauthorized'));

        socket.data.session = observable({
            client: client.id,
            user: null
        });

        socket.data.session.onChange(({ value: session }) => console.log("session changed", session), { initial: true, immediate: true });

        interface SessionPayloadEnitity {
            client: string;
            users: {
                id: string;
                timestamp: number;
            }[];
        }

        await this.service.syncSessions(client?.id, (payload: SessionPayloadEnitity) => {
            if (!payload?.users?.length) {
                socket.leave(`user.${socket.data.session.user}`);
                socket.data.session.user.set(null);
                return;
            }

            const latestUser = payload.users.reduce((l, c) => c.timestamp > l.timestamp ? c : l);
            socket.data.session.user.set(latestUser.id?.toString() ?? null);
            socket.join(`user.${socket.data.session.user}`);
            return;
        });

        next();
    }

    enforceAuthMw = async (socket, next) => {
        next();
        const originalEmit = socket.emit.bind(socket);

        socket.emit = (event, ...args) => {
            if (!socket.data.session.user.get()) return;
            return originalEmit(event, ...args);
        };

        socket.use((packet, next) => {
            if (!socket.data.session.user.get()) return next(new Error('unauthorized'));
            next();
        })
    }
}