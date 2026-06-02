import { redis } from "@/lib/redis";

const slidingWindowScript = `
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])
local count = redis.call('ZCARD', KEYS[1])
if count >= tonumber(ARGV[5]) then
  local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
  local oldestTime = tonumber(oldest[2]) or tonumber(ARGV[2])
  local retryAfter = math.max(1, math.ceil((oldestTime + tonumber(ARGV[6]) - tonumber(ARGV[2])) / 1000))
  return {0, count, retryAfter}
end
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[3])
redis.call('EXPIRE', KEYS[1], ARGV[4])
return {1, count + 1, 0}
`;

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
  const member = `${now}:${Math.random().toString(36).slice(2, 10)}`;

  const result = (await redis.eval(
    slidingWindowScript,
    1,
    key,
    windowStart,
    now,
    member,
    windowSec + 1,
    limit,
    windowMs,
  )) as [number, number, number];

  const [allowedFlag, count, retryAfterSec] = result;
  if (allowedFlag !== 1) return { allowed: false, remaining: 0, retryAfterSec };

  return {
    allowed: true,
    remaining: Math.max(0, limit - count),
    retryAfterSec: 0,
  };
}
