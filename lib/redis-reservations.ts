import {
  EXPIRING_RESERVATIONS_KEY,
  IDEMPOTENCY_KEY_PREFIX,
  IDEMPOTENCY_TTL_SECONDS,
  RESERVATION_RATE_LIMIT,
  RESERVATION_RATE_WINDOW_SECONDS,
} from "@/lib/constants";
import { getRedis } from "@/lib/redis";

export async function registerReservationExpiry(
  reservationId: string,
  expiresAt: Date,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.zadd(EXPIRING_RESERVATIONS_KEY, {
      score: expiresAt.getTime(),
      member: reservationId,
    });
  } catch (err) {
    console.error("[redis-reservations] register expiry", err);
  }
}

export async function unregisterReservationExpiry(
  reservationId: string,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.zrem(EXPIRING_RESERVATIONS_KEY, reservationId);
  } catch (err) {
    console.error("[redis-reservations] unregister expiry", err);
  }
}

export async function getExpiredReservationIds(
  now = Date.now(),
): Promise<string[]> {
  const redis = getRedis();
  if (!redis) return [];

  try {
    return redis.zrange(EXPIRING_RESERVATIONS_KEY, 0, now, { byScore: true });
  } catch (err) {
    console.error("[redis-reservations] get expired ids", err);
    return [];
  }
}

export async function getIdempotentReservationId(
  idempotencyKey: string,
): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    return redis.get<string>(`${IDEMPOTENCY_KEY_PREFIX}${idempotencyKey}`);
  } catch (err) {
    console.error("[redis-reservations] get idempotency", err);
    return null;
  }
}

export async function setIdempotentReservationId(
  idempotencyKey: string,
  reservationId: string,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(`${IDEMPOTENCY_KEY_PREFIX}${idempotencyKey}`, reservationId, {
      ex: IDEMPOTENCY_TTL_SECONDS,
      nx: true,
    });
  } catch (err) {
    console.error("[redis-reservations] set idempotency", err);
  }
}

export async function isReservationRateLimited(
  identifier: string,
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  const key = `rate:reservations:${identifier}`;

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, RESERVATION_RATE_WINDOW_SECONDS);
    }
    return count > RESERVATION_RATE_LIMIT;
  } catch (err) {
    console.error("[redis-reservations] rate limit", err);
    return false;
  }
}
