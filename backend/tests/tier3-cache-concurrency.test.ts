import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  getOrSetCache,
  invalidateCache,
  invalidateCachePrefix,
  getCacheStats,
  resetCacheStats,
  clearL1Cache,
  MAX_MEMORY_ITEMS,
} from "../lib/cache.server.ts";

describe("Tier 3: Cache Concurrency, Stampede Prevention & Sub-Millisecond Benchmark", () => {
  beforeEach(() => {
    clearL1Cache();
    resetCacheStats();
  });

  describe("1. Single-Flight In-Flight Promise Deduplication", () => {
    it("deduplicates 50 simultaneous concurrent requests on a cold cache to execute fetcher exactly once", async () => {
      let fetcherExecutionCount = 0;
      const coldKey = "test:concurrency:single-flight:" + Date.now();

      const fetcher = async () => {
        fetcherExecutionCount++;
        // Simulate async database latency
        await new Promise((resolve) => setTimeout(resolve, 40));
        return { data: "authoritative_db_payload", count: fetcherExecutionCount };
      };

      // Launch 50 simultaneous concurrent requests
      const concurrentRequests = Array.from({ length: 50 }, () =>
        getOrSetCache(coldKey, 60, fetcher),
      );

      const results = await Promise.all(concurrentRequests);

      // Verify fetcher executed ONLY ONCE
      assert.equal(fetcherExecutionCount, 1);

      // All 50 callers received the identical payload
      for (const res of results) {
        assert.equal(res.data, "authoritative_db_payload");
        assert.equal(res.count, 1);
      }
    });
  });

  describe("2. Sub-Millisecond Response Time Benchmark", () => {
    it("satisfies sub-millisecond (< 1.0ms) response times on L1 cache hits", async () => {
      const key = "benchmark:sub-ms:key";
      const sampleData = { battalion: "19 Jharkhand", cadets: 160, status: "READY" };

      // Warm the cache
      await getOrSetCache(key, 60, async () => sampleData);

      // Measure 100 cache hits
      const start = performance.now();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const val = await getOrSetCache(key, 60, async () => sampleData);
        assert.equal(val.battalion, "19 Jharkhand");
      }

      const totalTimeMs = performance.now() - start;
      const avgTimePerHitMs = totalTimeMs / iterations;

      // Assert average cache hit time is strictly sub-millisecond
      assert.ok(
        avgTimePerHitMs < 1.0,
        `Average cache hit took ${avgTimePerHitMs.toFixed(4)}ms (must be < 1.0ms)`,
      );
    });
  });

  describe("3. Telemetry Accuracy & Observability", () => {
    it("tracks hits, misses, size, and hit ratio accurately", async () => {
      const key1 = "telemetry:key1";
      const key2 = "telemetry:key2";

      // Miss 1
      await getOrSetCache(key1, 60, async () => "value1");
      // Miss 2
      await getOrSetCache(key2, 60, async () => "value2");
      // Hit 1
      await getOrSetCache(key1, 60, async () => "value1");
      // Hit 2
      await getOrSetCache(key1, 60, async () => "value1");

      const stats = getCacheStats();
      assert.equal(stats.l1Misses, 2);
      assert.equal(stats.l1Hits, 2);
      assert.equal(stats.l1Size, 2);
      assert.equal(stats.hitRatio, 50); // 50% hit ratio (2 hits / 4 total)
    });
  });

  describe("4. Prefix Invalidation & Memory Bounds", () => {
    it("purges all cached items matching key prefix", async () => {
      await getOrSetCache("ncc:cadet:101", 60, async () => ({ id: 101 }));
      await getOrSetCache("ncc:cadet:102", 60, async () => ({ id: 102 }));
      await getOrSetCache("ncc:officer:1", 60, async () => ({ id: 1 }));

      await invalidateCachePrefix("ncc:cadet:");

      let reloaded = false;
      await getOrSetCache("ncc:cadet:101", 60, async () => {
        reloaded = true;
        return { id: 101 };
      });

      assert.equal(reloaded, true);
    });

    it("enforces MAX_MEMORY_ITEMS = 5000 ceiling under rapid insertion", async () => {
      // Insert beyond capacity
      const itemsToInsert = 5200;
      for (let i = 0; i < itemsToInsert; i++) {
        await getOrSetCache(`bound:key:${i}`, 60, async () => `val_${i}`);
      }

      const stats = getCacheStats();
      assert.ok(stats.l1Size <= MAX_MEMORY_ITEMS);
    });
  });
});
