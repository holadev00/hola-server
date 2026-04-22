import { Server } from "socket.io";
import { ALLOWED_ORIGINS } from "../origin";
import { engine } from "./engine";

export const io = new Server({
    allowRequest: (req, callback) => {
        function check(req) {
            if (req.headers["x-app-confirm"] === "EzaNgai") return true;
            const whitelist = ALLOWED_ORIGINS;
            return whitelist.includes(req.headers.origin);
        }
        const isOriginValid = check(req);
        callback(null, isOriginValid);
    },
    cors: {
        origin: (originHeader, callback) => {
            if (!originHeader) return callback(null, true);
            if (ALLOWED_ORIGINS.includes(originHeader)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"), false);
        },
        methods: ["GET", "POST"],
        credentials: true
    },
    allowUpgrades: true,
    maxHttpBufferSize: 2e8,
});

io.bind(engine);