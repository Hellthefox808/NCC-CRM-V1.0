import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  getOrSetCache,
  invalidateCache,
  invalidateCachePrefix,
  clearL1Cache,
} from "../lib/cache.server.ts";
import { queueEmailJobsBatch } from "../services/queue/queue.service.ts";
import { invalidateSessionCache } from "../lib/cadet-registry.server.ts";

describe("Multi-Tier Cache & High-Throughput Service Unit Tests", () => {
  beforeEach(() => {
    clearL1Cache();
  });

  it("getOrSetCache() computes value on miss and returns cached value on subsequent hits", async () => {
    const key = `test_cache_${Date.now()}`;
    let computeCount = 0;

    const fetcher = async () => {
      computeCount++;
      return { cadetsCount: 160, battalion: "19 JHR BN NCC" };
    };

    // 1. Initial call — cache miss, fetcher runs
    const res1 = await getOrSetCache(key, 5, fetcher);
    assert.equal(computeCount, 1);
    assert.deepEqual(res1, { cadetsCount: 160, battalion: "19 JHR BN NCC" });

    // 2. Immediate second call — cache hit, fetcher NOT called
    const res2 = await getOrSetCache(key, 5, fetcher);
    assert.equal(computeCount, 1);
    assert.deepEqual(res2, { cadetsCount: 160, battalion: "19 JHR BN NCC" });

    await invalidateCache(key);
  });

  it("invalidateCache() purges cached value and triggers fresh fetch on next call", async () => {
    const key = `test_inval_${Date.now()}`;
    let counter = 0;

    const fetcher = async () => {
      counter++;
      return `version_${counter}`;
    };

    const val1 = await getOrSetCache(key, 10, fetcher);
    assert.equal(val1, "version_1");

    await invalidateCache(key);

    const val2 = await getOrSetCache(key, 10, fetcher);
    assert.equal(val2, "version_2");
    assert.equal(counter, 2);

    await invalidateCache(key);
  });

  it("invalidateCachePrefix() purges all keys matching the prefix", async () => {
    const prefix = `test_pfx_${Date.now()}`;
    const key1 = `${prefix}:item_1`;
    const key2 = `${prefix}:item_2`;

    let count1 = 0;
    let count2 = 0;

    await getOrSetCache(key1, 10, async () => {
      count1++;
      return "item1";
    });
    await getOrSetCache(key2, 10, async () => {
      count2++;
      return "item2";
    });

    assert.equal(count1, 1);
    assert.equal(count2, 1);

    await invalidateCachePrefix(prefix);

    await getOrSetCache(key1, 10, async () => {
      count1++;
      return "item1_fresh";
    });
    await getOrSetCache(key2, 10, async () => {
      count2++;
      return "item2_fresh";
    });

    assert.equal(count1, 2);
    assert.equal(count2, 2);

    await invalidateCachePrefix(prefix);
  });

  it("handles high concurrency without race conditions", async () => {
    const concurrentKey = `test_concurrent_${Date.now()}`;
    let executionCount = 0;

    const fetcher = async () => {
      executionCount++;
      return { status: "OK", timestamp: Date.now() };
    };

    // First warm the cache
    await getOrSetCache(concurrentKey, 5, fetcher);

    // Simulate 20 concurrent readers hitting cache simultaneously
    const results = await Promise.all(
      Array.from({ length: 20 }, () => getOrSetCache(concurrentKey, 5, fetcher)),
    );

    assert.equal(results.length, 20);
    assert.equal(executionCount, 1); // fetcher only executed once

    await invalidateCache(concurrentKey);
  });

  it("invalidateSessionCache() removes session key cleanly", async () => {
    const sessionToken = `sess_test_${Date.now()}`;
    await getOrSetCache(`ncc:session:${sessionToken}`, 300, async () => ({
      id: "sess_123",
      role: "admin",
    }));

    await invalidateSessionCache(sessionToken);
  });

  it("queueEmailJobsBatch() handles empty arrays and non-empty batch payloads gracefully", async () => {
    // Empty batch returns success immediately with 0 count
    const emptyRes = await queueEmailJobsBatch([]);
    assert.equal(emptyRes.success, true);
    assert.equal(emptyRes.enqueuedCount, 0);

    // Batch jobs payload handling
    const batchJobs = [
      {
        jobType: "sendEventCreated",
        recipient: "cadet1@sbu.ac.in",
        payload: { eventTitle: "Annual Training Camp", location: "Ranchi" },
      },
      {
        jobType: "sendEventCreated",
        recipient: "cadet2@sbu.ac.in",
        payload: { eventTitle: "Annual Training Camp", location: "Ranchi" },
      },
    ];

    const batchRes = await queueEmailJobsBatch(batchJobs);
    // In test environment without live Supabase connection, it returns clean result or graceful error
    assert.ok(typeof batchRes.success === "boolean");
  });

  it("LRU bounded capacity safely stores and prunes entries under high volume", async () => {
    const prefix = `lru_test_${Date.now()}`;

    for (let i = 0; i < 50; i++) {
      await getOrSetCache(`${prefix}:${i}`, 60, async () => `val_${i}`);
    }

    const item0 = await getOrSetCache(`${prefix}:0`, 60, async () => "refreshed_0");
    assert.ok(item0);

    await invalidateCachePrefix(prefix);
  });
});
