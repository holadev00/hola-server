import { client } from "./client";

export const publisher = client.duplicate();

try {
    await publisher.connect();
} catch {
    console.error('redis disconnected')
}