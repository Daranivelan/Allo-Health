import {
  PRODUCTS_CACHE_KEY,
  PRODUCTS_CACHE_TTL_SECONDS,
  WAREHOUSES_CACHE_KEY,
  WAREHOUSES_CACHE_TTL_SECONDS,
} from "@/lib/constants";
import { getRedis } from "@/lib/redis";

export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    return await redis.get<T>(key);
  } catch (err) {
    console.error(`[redis-cache] get ${key}`, err);
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.error(`[redis-cache] set ${key}`, err);
  }
}

export async function invalidateProductsCache(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(PRODUCTS_CACHE_KEY);
  } catch (err) {
    console.error("[redis-cache] invalidate products", err);
  }
}

export async function getCachedProducts<T>(): Promise<T | null> {
  return getCached<T>(PRODUCTS_CACHE_KEY);
}

export async function setCachedProducts<T>(products: T): Promise<void> {
  await setCached(PRODUCTS_CACHE_KEY, products, PRODUCTS_CACHE_TTL_SECONDS);
}

export async function getCachedWarehouses<T>(): Promise<T | null> {
  return getCached<T>(WAREHOUSES_CACHE_KEY);
}

export async function setCachedWarehouses<T>(warehouses: T): Promise<void> {
  await setCached(WAREHOUSES_CACHE_KEY, warehouses, WAREHOUSES_CACHE_TTL_SECONDS);
}
