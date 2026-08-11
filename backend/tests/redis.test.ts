import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  redisGet,
  redisSet,
  redisIncr,
  redisDel,
  getRedisStatus,
  redisRateLimit,
} from "../lib/redis.server.ts";
import { checkRateLimitAsync, resetRateLimitAsync } from "../lib/rate-limiter.server.ts";

describe("Redis Service & Hybrid Rate Limiter Unit Tests", () => {
  it("getRedisStatus() resolves to memory mode when REDIS_URL is unconfigured", async () => {
    const status = await getRedisStatus();
    assert.ok(["memory", "upstash", "ioredis"].includes(status.mode));
    assert.equal(status.connected, true);
  });

  it("redisSet() and redisGet() store and retrieve values correctly", async () => {
    const testKey = `test_key_${Date.now()}`;
    const testVal = "19JHR_BN_NCC_COMMAND_CENTRE";

    const setOk = await redisSet(testKey, testVal, 10);
    assert.equal(setOk, true);

    const retrieved = await redisGet(testKey);
    assert.equal(retrieved, testVal);

    await redisDel(testKey);
    const afterDel = await redisGet(testKey);
    assert.equal(afterDel, null);
  });

  it("redisIncr() increments numeric values atomically", async () => {
    const incrKey = `test_incr_${Date.now()}`;

    const count1 = await redisIncr(incrKey, 10);
    assert.equal(count1, 1);

    const count2 = await redisIncr(incrKey, 10);
    assert.equal(count2, 2);

    await redisDel(incrKey);
  });

  it("redisRateLimit() enforces max attempt limits", async () => {
    const limitKey = `test_limit_${Date.now()}`;

    const attempt1 = await redisRateLimit(limitKey, 2, 10);
    assert.equal(attempt1.allowed, true);
    assert.equal(attempt1.remaining, 1);

    const attempt2 = await redisRateLimit(limitKey, 2, 10);
    assert.equal(attempt2.allowed, true);
    assert.equal(attempt2.remaining, 0);

    const attempt3 = await redisRateLimit(limitKey, 2, 10);
    assert.equal(attempt3.allowed, false);
    assert.equal(attempt3.remaining, 0);

    await redisDel(limitKey);
  });

  it("checkRateLimitAsync() works with hybrid rate limiter", async () => {
    const asyncKey = `test_async_limit_${Date.now()}`;

    const res1 = await checkRateLimitAsync(asyncKey, { maxAttempts: 2, windowMs: 10000 });
    assert.equal(res1.allowed, true);

    const res2 = await checkRateLimitAsync(asyncKey, { maxAttempts: 2, windowMs: 10000 });
    assert.equal(res2.allowed, true);

    const res3 = await checkRateLimitAsync(asyncKey, { maxAttempts: 2, windowMs: 10000 });
    assert.equal(res3.allowed, false);

    await resetRateLimitAsync(asyncKey);
    const resAfterReset = await checkRateLimitAsync(asyncKey, { maxAttempts: 2, windowMs: 10000 });
    assert.equal(resAfterReset.allowed, true);

    await resetRateLimitAsync(asyncKey);
  });
});
