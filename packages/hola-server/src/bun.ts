import { app } from "./app";
import { engine, websocket } from "./io";
import * as bootstraps from "@hola/hola-bun/bootstrap";

Bun.serve({
    port: 80,
    idleTimeout: 30, // must be greater than the "pingInterval" option of the engine, which defaults to 25 seconds

    routes: {
        "/socket.io/": async (req, server) => {
            try {
                await bootstraps.sessions.hydrateClientSession(req);
                engine.handleRequest(req, server);
            } catch (error) {
                console.error(error);
            }
        }
    },

    fetch(req, server) {
        return app.fetch(req, server);
    },

    websocket
});