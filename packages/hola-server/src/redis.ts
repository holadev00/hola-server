import { redis } from "bun";

const publisher = await redis.duplicate();
const subscriber = await redis.duplicate();

try {
    await publisher.connect();
    await subscriber.connect();
} catch (error) {
    console.log("redis disconnected")
}

export { publisher, subscriber };