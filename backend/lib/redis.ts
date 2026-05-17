import Redis from "ioredis";

const redisUrl = process.env['REDIS_URL'];
if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is not set");
}

// Singleton pattern to avoid multiple connections in dev (HMR)
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

if (process.env['NODE_ENV'] !== "production") {
  globalForRedis.redis = redis;
}
