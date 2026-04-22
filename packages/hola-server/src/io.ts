import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";

export const io = new Server();
export const engine = new Engine();

io.bind(engine);

export const { websocket } = engine.handler();