import { cors } from "hono/cors";
import { ALLOWED_ORIGINS } from "./origin";
import { Hono } from "hono";

export const app = new Hono();
app.use('*', cors({
    origin: [...ALLOWED_ORIGINS],
    credentials: true,
    allowHeaders: [
        'Content-Type',
        'X-Issuer',
        'X-Audience',
    ],
}));

export default app;