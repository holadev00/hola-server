import { createClient } from "redis";

export const redisClient = createClient();
export const redisPublisher = createClient();
export const redisSubscriber = createClient();

await redisClient.connect();
await redisPublisher.connect();
await redisSubscriber.connect();