import { createClient } from 'redis';

export const client = createClient();

try {
    await client.connect();
} catch (error) {
    console.error('redis disconnected')
}