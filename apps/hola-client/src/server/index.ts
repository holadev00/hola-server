import type { Serve } from "bun";
import { engine } from "./io/engine";
import { app } from "./app";
import index from "../../dist/index.html";
import { attachSession, signClientIdJWT } from "../session";
import { Visitor } from "../models/Visitor";
import EventEmitter from "eventemitter3";
import { serveStatic } from "hono/bun";
import fs from "fs";
import path from "path";
import mime from 'mime-types';

const { websocket } = engine.handler();

const distDir = path.join(__dirname, "../../dist");

export const server: Serve.Options<any> = {
    port: 80,
    idleTimeout: 30,

    development: {
        //hmr: true,
        //console: true,
    },

    routes: {
        "/socket.io/*any": async function (req, server) {
            return attachSession(req, server);
        },
        '/sse': async function (req, server) {
            return serverSideStream(req);
        },
        "/initiate-visitor": async function (req, server) {
            const visitor = await Visitor.create({});
            const token = await signClientIdJWT(visitor?._id!?.toString());

            const res = new Response(JSON.stringify({ token }));
            res.headers.set('Access-Control-Allow-Origin', '*');
            res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            res.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
            res.headers.set('Content-Type', 'application/json');
            return res;
        },
        "/*": async function (req) {
            const url = new URL(req.url);

            // sécurité basique
            if (url.pathname.includes("..")) {
                return new Response("Forbidden", { status: 403 });
            }

            // mapping direct du path
            let filePath = path.join(distDir, '.'+url.pathname);

            if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
                filePath = path.join(filePath, "index.html");
            }

            // fallback SPA
            if (!fs.existsSync(filePath)) {
                filePath = path.join(distDir, "index.html");
            }

            return new Response(Bun.file(filePath));
        }
    },

    fetch(req, server) {
        const url = new URL(req.url);
        console.log(url.pathname);

        if (url.pathname === "/sse" || url.pathname === "/sse/") return serverSideStream(req);
        if (url.pathname === "/socket.io/") return attachSession(req, server);
        return app.fetch(req, server);
    },

    websocket
}

const sseEvents = new EventEmitter();

type SSEPayload<T = unknown> = {
    topic: string;
    key?: string;
    value: T;
    headers?: Record<string, string>;
};

let offset = 0;

export const sse = <T>(payload: SSEPayload<T>) => {
    const message = {
        key: payload.key,
        value: payload.value,
        headers: payload.headers ?? {},
        timestamp: Date.now(),
    };

    sseEvents.emit(
        payload.topic,
        {
            id: offset++,
            event: payload.topic,
            data: JSON.stringify(message),
        }
    );
};

/*sse({
    topic: "session",
    value: { id: "6973f67552c9d67bbd51190b", date: Date.now() },
});*/

async function serverSideStream(req: Request) {
    const { searchParams } = new URL(req.url);
    const topics = searchParams.get("topics")?.split(",") ?? [];

    const listeners = new Map<string, (msg: any) => void>();

    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(`retry: 3000\n\n`);

            for (const topic of topics) {
                const listener = (msg: any) => {
                    controller.enqueue(
                        `id: ${msg.id}\n` +
                        `event: ${msg.event}\n` +
                        `data: ${msg.data}\n\n`
                    );
                };

                listeners.set(topic, listener);
                sseEvents.on(topic, listener);
            }
        },

        cancel() {
            for (const [topic, listener] of listeners) {
                sseEvents.off(topic, listener);
            }
        },
    });

    return new Response(stream, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    });
}
