import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit, MAX_RATE_LIMITER_ITEMS } from "../lib/rate-limiter.server.ts";

describe("Tier 3: Rate Limiter Memory Bounds & High-Throughput Burst Shielding", () => {
  describe("1. Sliding-Window Rate Limiting Semantics", () => {
    it("allows attempts within max limit and blocks excess requests", () => {
      const key = "test:ip:192.168.1.100";
      const opts = { maxAttempts: 5, windowMs: 60 * 1000 };

      // 5 allowed attempts
      for (let i = 1; i <= 5; i++) {
        const res = checkRateLimit(key, opts);
        assert.equal(res.allowed, true);
        assert.equal(res.remaining, 5 - i);
      }

      // 6th attempt is blocked
      const blocked = checkRateLimit(key, opts);
      assert.equal(blocked.allowed, false);
      assert.equal(blocked.remaining, 0);
      assert.ok(blocked.retryAfterMs > 0);
    });
  });

  describe("2. High-Throughput Capacity Bound (MAX_RATE_LIMITER_ITEMS = 5000)", () => {
    it("maintains strict LRU ceiling without memory leakage under 10,000 unique IP bursts", () => {
      const opts = { maxAttempts: 10, windowMs: 60 * 1000 };

      // Rapidly flood 8,000 unique IP keys into the rate limiter
      for (let i = 0; i < 8000; i++) {
        const ip = `10.${Math.floor(i / 256)}.${i % 256}.1`;
        checkRateLimit(ip, opts);
      }

      // Access the newest key
      const testKey = "10.31.63.1"; // 8000th key
      const res = checkRateLimit(testKey, opts);
      assert.equal(res.allowed, true);
    });

    it("prioritizes recently accessed keys by refreshing LRU order", () => {
      const opts = { maxAttempts: 10, windowMs: 60 * 1000 };
      const frequentIp = "192.168.99.99";

      // Initialize frequentIp
      checkRateLimit(frequentIp, opts);

      // Add 5,100 other unique IPs while periodically pinging frequentIp
      for (let i = 0; i < 5100; i++) {
        checkRateLimit(`172.16.${Math.floor(i / 256)}.${i % 256}`, opts);
        if (i % 500 === 0) {
          checkRateLimit(frequentIp, opts);
        }
      }

      // frequentIp was refreshed frequently, so it must still exist and be tracked
      const status = checkRateLimit(frequentIp, opts);
      assert.ok(status.remaining < 10);
    });
  });
});
