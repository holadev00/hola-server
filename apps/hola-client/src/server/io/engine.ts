import { Server as Engine } from "@socket.io/bun-engine";
import { ALLOWED_ORIGINS } from "../origin";

export const engine = new Engine({
    path: "/socket.io",
    /*async allowRequest(req, server) {
        console.log(req.headers);
        if (req.headers["x-app-confirm"] !== "EzaNgai") {
            const whitelist = ALLOWED_ORIGINS;
            if (!whitelist.includes(req.headers.origin)) {
                throw new Error("Origin not allowed");
            }
        }
    },*/
    cors: {
        origin: [...ALLOWED_ORIGINS],
        methods: ["GET", "POST"],
        credentials: true,
    }
});
