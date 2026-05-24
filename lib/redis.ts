import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

export function getRedis(): Redis | null {
  if (!isRedisConfigured()) return null;

  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return globalForRedis.redis;
}
