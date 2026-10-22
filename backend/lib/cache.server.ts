/**
 * Multi-tier caching layer for the 19 JHR BN NCC Platform.
 *
 * Tier 1: In-Memory Bounded LRU Cache (sub-millisecond fast-path)
 * Tier 2: Redis Distributed Cache (cross-instance shared cache)
 *
 * Provides automatic serialization, stampede protection, TTL expiration,
 * and key/prefix invalidation.
 */

import { redisGet, redisSet, redisDel, redisDelPrefix } from "./redis.server.ts";

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

// Bounded in-memory L1 cache with LRU eviction
export const MAX_MEMORY_ITEMS = 5000;
const L1_MAX_ITEMS = MAX_MEMORY_ITEMS;
const l1Cache = new Map<string, CacheItem<unknown>>();

// Single-flight in-flight promise deduplication map to prevent cache stampedes
const inFlightPromises = new Map<string, Promise<unknown>>();

// Telemetry metrics
let l1Hits = 0;
let l1Misses = 0;
let l2Hits = 0;
let l2Misses = 0;
let l1Evictions = 0;

function pruneL1() {
  const now = Date.now();
  for (const [k, v] of l1Cache.entries()) {
    if (v.expiresAt <= now) {
      l1Cache.delete(k);
    }
  }
  // Enforce capacity bounds (evict oldest inserted/accessed so adding one key stays within L1_MAX_ITEMS)
  if (l1Cache.size >= L1_MAX_ITEMS) {
    const excess = l1Cache.size - L1_MAX_ITEMS + 1;
    const keysToEvict = Array.from(l1Cache.keys()).slice(0, excess);
    l1Evictions += keysToEvict.length;
    for (const k of keysToEvict) {
      l1Cache.delete(k);
    }
  }
}

/**
 * Retrieves a cached value or executes the fetcher function to compute and cache it.
 *
 * Employs single-flight in-flight deduplication so concurrent requests for a cold key
 * share a single fetcher execution without cache stampede.
 *
 * @param key Unique cache key (e.g., "ncc:calendar:published")
 * @param ttlSeconds Expiration duration in seconds
 * @param fetcher Async function providing the authoritative data on cache miss
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const now = Date.now();

  // 1. Check L1 in-memory cache
  const l1Entry = l1Cache.get(key) as CacheItem<T> | undefined;
  if (l1Entry && l1Entry.expiresAt > now) {
    l1Hits++;
    // Refresh access order for LRU
    l1Cache.delete(key);
    l1Cache.set(key, l1Entry as CacheItem<unknown>);
    return l1Entry.value;
  }
  l1Misses++;

  // 2. Check if an in-flight operation is already running for this key (Single-flight deduplication)
  const existingInFlight = inFlightPromises.get(key);
  if (existingInFlight) {
    return (await existingInFlight) as T;
  }

  // 3. Register in-flight promise SYNCHRONOUSLY before any async yield to prevent cache stampedes
  const executionPromise = (async () => {
    try {
      // Check L2 Redis cache
      try {
        const raw = await redisGet(key);
        if (raw !== null) {
          l2Hits++;
          const parsed = JSON.parse(raw) as T;
          // Populate L1 cache for subsequent fast reads
          pruneL1();
          l1Cache.set(key, { value: parsed, expiresAt: Date.now() + ttlSeconds * 1000 });
          return parsed;
        }
        l2Misses++;
      } catch {
        l2Misses++;
        // Fallback to fetcher on Redis read or JSON parse error
      }

      // 4. Cache Miss — Execute Fetcher
      const freshData = await fetcher();

      // Update L1 and L2
      try {
        pruneL1();
        l1Cache.set(key, { value: freshData, expiresAt: Date.now() + ttlSeconds * 1000 });
        await redisSet(key, JSON.stringify(freshData), ttlSeconds);
      } catch (err) {
        console.warn(`[Cache Write Warning] Failed to write key ${key}:`, err);
      }

      return freshData;
    } finally {
      inFlightPromises.delete(key);
    }
  })();

  inFlightPromises.set(key, executionPromise);
  return (await executionPromise) as T;
}

/**
 * Invalidates a specific key in both L1 memory and L2 Redis cache.
 */
export async function invalidateCache(key: string): Promise<void> {
  l1Cache.delete(key);
  inFlightPromises.delete(key);
  try {
    await redisDel(key);
  } catch {
    // Ignore error
  }
}

/**
 * Invalidates all keys matching a given prefix in both L1 memory and L2 Redis cache.
 */
export async function invalidateCachePrefix(prefix: string): Promise<void> {
  for (const k of l1Cache.keys()) {
    if (k.startsWith(prefix)) {
      l1Cache.delete(k);
    }
  }
  for (const k of inFlightPromises.keys()) {
    if (k.startsWith(prefix)) {
      inFlightPromises.delete(k);
    }
  }
  try {
    await redisDelPrefix(prefix);
  } catch {
    // Ignore error
  }
}

/**
 * Returns telemetry and operational health metrics for the multi-tier cache.
 */
export function getCacheStats() {
  const totalRequests = l1Hits + l1Misses;
  const hitRatio = totalRequests > 0 ? (l1Hits + l2Hits) / totalRequests : 0;
  return {
    l1Hits,
    l1Misses,
    l2Hits,
    l2Misses,
    l1Size: l1Cache.size,
    l1Evictions,
    hitRatio: Math.round(hitRatio * 10000) / 100,
  };
}

/**
 * Resets cache statistics counters (primarily for tests).
 */
export function resetCacheStats(): void {
  l1Hits = 0;
  l1Misses = 0;
  l2Hits = 0;
  l2Misses = 0;
  l1Evictions = 0;
}

/**
 * Clears all items from the L1 in-memory cache and in-flight promises (primarily for tests).
 */
export function clearL1Cache(): void {
  l1Cache.clear();
  inFlightPromises.clear();
}
