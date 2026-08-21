/**
 * Unified Redis client wrapper for the 19 JHR BN NCC Command Centre.
 *
 * Supports dual-mode connection:
 * 1. Cloud Serverless Mode: Upstash Redis REST API (via UPSTASH_REDIS_REST_URL)
 * 2. Container / Local TCP Mode: Native Redis TCP connection (via REDIS_URL)
 * 3. In-Memory Fallback: Self-pruning in-memory store if Redis is unavailable
 */

interface RedisStatus {
  mode: "upstash" | "ioredis" | "memory";
  connected: boolean;
  error?: string;
}

// In-memory fallback cache
const memoryStore = new Map<string, { value: string; expiresAt?: number }>();

function pruneMemoryStore() {
  const now = Date.now();
  for (const [key, item] of memoryStore.entries()) {
    if (item.expiresAt && item.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
}

interface RedisLike {
  get(key: string): Promise<unknown>;
  set(
    key: string,
    value: string,
    opts?: { ex?: number } | string,
    ...args: unknown[]
  ): Promise<unknown>;
  incr(key: string): Promise<number | unknown>;
  expire(key: string, seconds: number): Promise<boolean | number | unknown>;
  del(key: string): Promise<unknown>;
  status?: string;
  connect?: () => Promise<void>;
}

// Dynamic client instances
let ioredisInstance: RedisLike | null = null;
let upstashInstance: RedisLike | null = null;

async function getUpstashClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  if (!upstashInstance) {
    try {
      const { Redis } = await import("@upstash/redis");
      upstashInstance = new Redis({ url, token });
    } catch {
      // Fallback HTTP handler if package is not bundled
      upstashInstance = {
        async get(key: string) {
          const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          return data.result;
        },
        async set(key: string, value: string, opts?: { ex?: number }) {
          const exParam = opts?.ex ? `?EX=${opts.ex}` : "";
          const res = await fetch(
            `${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}${exParam}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const data = await res.json();
          return data.result === "OK";
        },
        async incr(key: string) {
          const res = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          return data.result;
        },
        async expire(key: string, seconds: number) {
          const res = await fetch(`${url}/expire/${encodeURIComponent(key)}/${seconds}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          return data.result === 1;
        },
        async del(key: string) {
          const res = await fetch(`${url}/del/${encodeURIComponent(key)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          return data.result;
        },
      };
    }
  }
  return upstashInstance;
}

async function getIoRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  if (!ioredisInstance) {
    try {
      const { default: Redis } = await import("ioredis");
      ioredisInstance = new Redis(redisUrl, {
        maxRetriesPerRequest: 2,
        connectTimeout: 3000,
        lazyConnect: true,
      });
      await ioredisInstance.connect().catch(() => {});
    } catch {
      return null;
    }
  }
  return ioredisInstance;
}

/** Resolves current active Redis strategy. */
export async function getRedisStatus(): Promise<RedisStatus> {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { mode: "upstash", connected: true };
  }

  if (process.env.REDIS_URL) {
    try {
      const client = await getIoRedisClient();
      if (client && client.status === "ready") {
        return { mode: "ioredis", connected: true };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Redis connection error";
      return { mode: "memory", connected: false, error: errorMsg };
    }
  }

  return { mode: "memory", connected: true };
}

/** Reads a string value from Redis (or memory fallback). */
export async function redisGet(key: string): Promise<string | null> {
  try {
    const upstash = await getUpstashClient();
    if (upstash) {
      const val = await upstash.get(key);
      return val !== null && val !== undefined ? String(val) : null;
    }

    const ioClient = await getIoRedisClient();
    if (ioClient && ioClient.status === "ready") {
      return await ioClient.get(key);
    }
  } catch (err) {
    console.warn("[Redis Get Warning] Falling back to memory store:", err);
  }

  // Memory fallback
  pruneMemoryStore();
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

/** Sets a key-value pair in Redis (or memory fallback) with optional TTL in seconds. */
export async function redisSet(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
  try {
    const upstash = await getUpstashClient();
    if (upstash) {
      if (ttlSeconds && ttlSeconds > 0) {
        await upstash.set(key, value, { ex: ttlSeconds });
      } else {
        await upstash.set(key, value);
      }
      return true;
    }

    const ioClient = await getIoRedisClient();
    if (ioClient && ioClient.status === "ready") {
      if (ttlSeconds && ttlSeconds > 0) {
        await ioClient.set(key, value, "EX", ttlSeconds);
      } else {
        await ioClient.set(key, value);
      }
      return true;
    }
  } catch (err) {
    console.warn("[Redis Set Warning] Falling back to memory store:", err);
  }

  // Memory fallback
  pruneMemoryStore();
  const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : undefined;
  memoryStore.set(key, { value, expiresAt });
  return true;
}

/** Increments a key value atomically and sets TTL if key is new. */
export async function redisIncr(key: string, ttlSeconds?: number): Promise<number> {
  try {
    const upstash = await getUpstashClient();
    if (upstash) {
      const count = await upstash.incr(key);
      if (count === 1 && ttlSeconds && ttlSeconds > 0) {
        await upstash.expire(key, ttlSeconds);
      }
      return Number(count);
    }

    const ioClient = await getIoRedisClient();
    if (ioClient && ioClient.status === "ready") {
      const count = await ioClient.incr(key);
      if (count === 1 && ttlSeconds && ttlSeconds > 0) {
        await ioClient.expire(key, ttlSeconds);
      }
      return Number(count);
    }
  } catch (err) {
    console.warn("[Redis Incr Warning] Falling back to memory store:", err);
  }

  // Memory fallback
  pruneMemoryStore();
  const entry = memoryStore.get(key);
  let currentVal = entry ? parseInt(entry.value, 10) || 0 : 0;
  currentVal += 1;

  const expiresAt = entry?.expiresAt || (ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined);
  memoryStore.set(key, { value: String(currentVal), expiresAt });
  return currentVal;
}

/** Deletes a key from Redis (or memory fallback). */
export async function redisDel(key: string): Promise<boolean> {
  try {
    const upstash = await getUpstashClient();
    if (upstash) {
      await upstash.del(key);
      return true;
    }

    const ioClient = await getIoRedisClient();
    if (ioClient && ioClient.status === "ready") {
      await ioClient.del(key);
      return true;
    }
  } catch (err) {
    console.warn("[Redis Del Warning] Falling back to memory store:", err);
  }

  memoryStore.delete(key);
  return true;
}

/** Distributed rate limit counter helper using Redis or memory fallback. */
export async function redisRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const currentCount = await redisIncr(key, windowSeconds);

  if (currentCount > maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: windowSeconds,
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - currentCount,
    retryAfterSeconds: 0,
  };
}
