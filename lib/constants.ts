export const RESERVATION_HOLD_MS = 10 * 60 * 1000;
export const RESERVATION_HOLD_SECONDS = RESERVATION_HOLD_MS / 1000;

export const PRODUCTS_CACHE_KEY = "cache:products";
export const PRODUCTS_CACHE_TTL_SECONDS = 30;

export const WAREHOUSES_CACHE_KEY = "cache:warehouses";
export const WAREHOUSES_CACHE_TTL_SECONDS = 300;

export const EXPIRING_RESERVATIONS_KEY = "reservations:expiring";
export const IDEMPOTENCY_KEY_PREFIX = "idempotency:";
export const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;

export const RESERVATION_RATE_LIMIT = 20;
export const RESERVATION_RATE_WINDOW_SECONDS = 60;
