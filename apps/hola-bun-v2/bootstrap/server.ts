import { Server as Engine } from "@socket.io/bun-engine";
import { serve } from "bun";
import { Server } from "socket.io";
import { join } from "path";
import type { AuthServicePort } from "../domain/ports/auth/AuthServicePort";

export function createServer(authService: AuthServicePort) {
    const io = new Server({
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
        maxHttpBufferSize: 2e8,
    });

    const engine = new Engine({});

    io.bind(engine);

    const { websocket } = engine.handler();

    const server = serve({
        port: 80,
        idleTimeout: 30,
        routes: {
            "/socket.io/": async function (req, server) {
                const url = new URL(req.url);
                const visitorToken: string | null = url.searchParams.get("VTKN");
                if (!visitorToken) return new Response("Bad request", { status: 400 });

                const token = req.cookies.get("token");

                const newToken = await authService.hydrateSession(visitorToken, token);
                if (!newToken) return new Response("Bad request", { status: 400 });

                req.cookies.set("token", newToken, { httpOnly: true, secure: true });

                return await engine.handleRequest(req, server);
            },

            "/": () => serveFile("index.html"),
        },

        async fetch(req) {
            const url = new URL(req.url);
            const filepath = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
            return serveFile(filepath);
        },

        websocket,
    });

    console.log(`🚀 Server running at ${server.url}`);

    return { io };
}

async function serveFile(filepath: string): Promise<Response> {
    const distPath = join(import.meta.dir, "../client/build", filepath);

    const file = Bun.file(distPath);
    const exists = await file.exists();

    if (!exists) {
        const fallback = Bun.file(join(import.meta.dir, "dist", "index.html"));
        const fallbackExists = await fallback.exists();
        if (!fallbackExists) return new Response("Not found", { status: 404 });
        return new Response(fallback, {
            headers: { "Content-Type": "text/html" },
        });
    }

    return new Response(file);
}