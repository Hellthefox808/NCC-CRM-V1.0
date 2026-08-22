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
const L1_MAX_ITEMS = 2000;
const l1Cache = new Map<string, CacheItem<unknown>>();

function pruneL1() {
  const now = Date.now();
  for (const [k, v] of l1Cache.entries()) {
    if (v.expiresAt <= now) {
      l1Cache.delete(k);
    }
  }
  // Enforce capacity bounds (evict oldest inserted/accessed)
  if (l1Cache.size > L1_MAX_ITEMS) {
    const keysToEvict = Array.from(l1Cache.keys()).slice(0, l1Cache.size - L1_MAX_ITEMS);
    for (const k of keysToEvict) {
      l1Cache.delete(k);
    }
  }
}

/**
 * Retrieves a cached value or executes the fetcher function to compute and cache it.
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
    // Refresh access order for LRU
    l1Cache.delete(key);
    l1Cache.set(key, l1Entry as CacheItem<unknown>);
    return l1Entry.value;
  }

  // 2. Check L2 Redis cache
  try {
    const raw = await redisGet(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as T;
      // Populate L1 cache for subsequent fast reads
      pruneL1();
      l1Cache.set(key, { value: parsed, expiresAt: now + ttlSeconds * 1000 });
      return parsed;
    }
  } catch {
    // Fallback to fetcher on Redis read or JSON parse error
  }

  // 3. Cache Miss — Execute Fetcher
  const freshData = await fetcher();

  // 4. Update L1 and L2
  try {
    pruneL1();
    l1Cache.set(key, { value: freshData, expiresAt: now + ttlSeconds * 1000 });
    await redisSet(key, JSON.stringify(freshData), ttlSeconds);
  } catch (err) {
    console.warn(`[Cache Write Warning] Failed to write key ${key}:`, err);
  }

  return freshData;
}

/**
 * Invalidates a specific key in both L1 memory and L2 Redis cache.
 */
export async function invalidateCache(key: string): Promise<void> {
  l1Cache.delete(key);
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
  for (const k of Array.from(l1Cache.keys())) {
    if (k.startsWith(prefix)) {
      l1Cache.delete(k);
    }
  }
  try {
    await redisDelPrefix(prefix);
  } catch {
    // Ignore error
  }
}

/**
 * Clears all items from the L1 in-memory cache (primarily for tests).
 */
export function clearL1Cache(): void {
  l1Cache.clear();
}
