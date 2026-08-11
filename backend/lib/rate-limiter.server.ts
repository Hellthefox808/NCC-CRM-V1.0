/**
 * Hybrid Rate Limiter for the 19 JHR BN NCC Portal.
 *
 * Supports both:
 * 1. Synchronous sliding window in-memory rate limiting (zero latency overhead)
 * 2. Asynchronous distributed rate limiting via Redis (TCP or Upstash REST)
 */

import { redisRateLimit, redisDel } from "./redis.server";

interface RateLimitEntry {
  timestamps: number[];
}

export interface RateLimitOptions {
  /** Maximum number of attempts allowed within the window. */
  maxAttempts: number;
  /** Time window in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

const store = new Map<string, RateLimitEntry>();

/** Prune expired entries every 5 minutes to prevent unbounded memory growth. */
const PRUNE_INTERVAL_MS = 5 * 60 * 1000;
let lastPrune = Date.now();

function pruneIfNeeded(windowMs: number) {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

/**
 * Checks and records an attempt against the sliding window for `key` in memory.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const { maxAttempts, windowMs } = options;
  const now = Date.now();

  pruneIfNeeded(windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => t > now - windowMs);

  if (entry.timestamps.length >= maxAttempts) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, retryAfterMs),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxAttempts - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/**
 * Distributed rate limiter using Redis if available, with in-memory fallback.
 */
export async function checkRateLimitAsync(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const windowSeconds = Math.ceil(options.windowMs / 1000) || 1;

  try {
    const redisResult = await redisRateLimit(key, options.maxAttempts, windowSeconds);
    return {
      allowed: redisResult.allowed,
      remaining: redisResult.remaining,
      retryAfterMs: redisResult.retryAfterSeconds * 1000,
    };
  } catch (err) {
    console.warn("[RateLimiter Async Warning] Falling back to in-memory limiter:", err);
    return checkRateLimit(key, options);
  }
}

/** Resets the rate limit counter for a specific key (e.g., after successful login). */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/** Asynchronously resets the rate limit counter in Redis and in memory. */
export async function resetRateLimitAsync(key: string): Promise<void> {
  store.delete(key);
  await redisDel(key).catch(() => {});
}
