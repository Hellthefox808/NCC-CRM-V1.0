/**
 * In-memory sliding window rate limiter for the NCC portal.
 *
 * Provides brute-force protection for login, OTP, and other
 * abuse-sensitive endpoints without requiring an external store.
 *
 * IMPORTANT: This works per-process. In a multi-instance deployment,
 * upgrade to a shared store (Redis / Supabase row) for global limits.
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitOptions {
  /** Maximum number of attempts allowed within the window. */
  maxAttempts: number;
  /** Time window in milliseconds. */
  windowMs: number;
}

interface RateLimitResult {
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
 * Checks and records an attempt against the sliding window for `key`.
 *
 * Returns `{ allowed: true }` if the attempt is within limits,
 * or `{ allowed: false, retryAfterMs }` if the rate limit is exceeded.
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

/** Resets the rate limit counter for a specific key (e.g., after successful login). */
export function resetRateLimit(key: string): void {
  store.delete(key);
}
