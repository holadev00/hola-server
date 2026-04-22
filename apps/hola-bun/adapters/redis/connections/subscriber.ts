import { client } from "./client";

export const subscriber = client.duplicate();

try {
    await subscriber.connect();
} catch {
    console.log('redis disconnected')
}