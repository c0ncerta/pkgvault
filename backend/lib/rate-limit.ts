import { redis } from "@/lib/redis";

/**
 * Sliding window rate limiter backed by Redis.
 *
 * @param key   Unique key (e.g. `rate:post:${userId}`)
 * @param limit Max requests in the window
 * @param windowSec Window duration in seconds
 * @returns { allowed, remaining, retryAfterSec }
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<{
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}> {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const windowStart = now - windowMs;

  const pipeline = redis.pipeline();

  // Remove entries outside the window
  pipeline.zremrangebyscore(key, 0, windowStart);

  // Count current entries
  pipeline.zcard(key);

  // Add current request
  pipeline.zadd(key, now, `${now}:${Math.random().toString(36).slice(2, 8)}`);

  // Set expiry on the key
  pipeline.expire(key, windowSec + 1);

  const results = await pipeline.exec();

  // zcard result is at index 1
  const count = (results?.[1]?.[1] as number) ?? 0;

  if (count >= limit) {
    // Find oldest entry to calculate retry time
    const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
    const oldestTime = oldest.length >= 2 ? Number(oldest[1]) : now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((oldestTime + windowMs - now) / 1000),
    );

    return { allowed: false, remaining: 0, retryAfterSec };
  }

  return {
    allowed: true,
    remaining: limit - count - 1,
    retryAfterSec: 0,
  };
}
