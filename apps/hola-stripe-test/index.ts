import { Server as Engine } from "@socket.io/bun-engine";
import { serve } from "bun";
import { Server } from "socket.io";
import StripeAdapter from "./StripeAdapter";
import { StripeUseCase } from "./StripeUseCase";

const io = new Server();
const engine = new Engine();

io.bind(engine);

const stripeUseCase = new StripeUseCase({
    adapter: new StripeAdapter(
        process.env.STRIPE_SECRET_KEY!,
        process.env.STRIPE_PUBLISHABLE_KEY!
    )
})

io.on("connection", (socket) => {
    console.log("Connected to server");
    socket.on(`STRIPE/pbsh`, (cb) => {
        const key = stripeUseCase.fetchPublishableKey();
        cb(key);
    });

    socket.on(`STRIPE/cs`, async ({ currency, amount, quantity, venue, locale }, cb) => {
        const {
            checkoutSessionClientSecret,
            checkoutSessionId
        } = await stripeUseCase.createSession({
            origin: socket.handshake.headers.origin!,
            currency,
            amount,
            quantity,
            venue,
            locale
        });

        cb({ checkoutSessionClientSecret, checkoutSessionId });
    });
});

const { websocket } = engine.handler();

serve({
    port: 80,
    idleTimeout: 30,

    routes: {
        "/socket.io/*": (req, server) => {
            return engine.handleRequest(req, server);
        }
    },

    fetch(req) {
        return new Response("Hello World!");
    },

    websocket
});