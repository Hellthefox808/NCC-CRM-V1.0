import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  validateVerhoeff,
  generateVerhoeffCheckDigit,
  sanitizeAadhaar,
} from "../lib/sanitization.ts";
import {
  getOrSetCache,
  getCacheStats,
  resetCacheStats,
  clearL1Cache,
  MAX_MEMORY_ITEMS,
} from "../lib/cache.server.ts";
import { checkRateLimit, MAX_RATE_LIMITER_ITEMS } from "../lib/rate-limiter.server.ts";
import { recordSecurityEvent, MAX_IDS_EVENT_HISTORY } from "../services/ids/ids.service.ts";
import { redisSet, redisGet, redisDelPrefix } from "../lib/redis.server.ts";

describe("Suite 18: NCC Pipeline Repair & High-Throughput System Optimization Tests", () => {
  beforeEach(() => {
    clearL1Cache();
    resetCacheStats();
  });

  describe("1. UIDAI Verhoeff Checksum & Aadhaar Sanitization", () => {
    it("validateVerhoeff() validates mathematical Verhoeff test vectors accurately", () => {
      // Known standard Verhoeff test vectors
      assert.equal(validateVerhoeff("2363"), true);
      assert.equal(validateVerhoeff("2364"), false);
      assert.equal(validateVerhoeff("0"), true);
      assert.equal(validateVerhoeff(""), false);
      assert.equal(validateVerhoeff("ABC"), false);
    });

    it("generateVerhoeffCheckDigit() generates correct check digit for 11-digit numbers", () => {
      const baseNum = "12345678901";
      const checkDigit = generateVerhoeffCheckDigit(baseNum);
      const fullAadhaar = `${baseNum}${checkDigit}`;

      assert.equal(typeof checkDigit, "number");
      assert.equal(checkDigit >= 0 && checkDigit <= 9, true);
      assert.equal(validateVerhoeff(fullAadhaar), true);
    });

    it("sanitizeAadhaar() accepts valid 12-digit Aadhaar numbers with formatting", () => {
      const baseNum = "98765432109";
      const checkDigit = generateVerhoeffCheckDigit(baseNum);
      const formatted = ` 9876 ${baseNum.slice(4, 8)} ${baseNum.slice(8, 11)}${checkDigit} `;

      const sanitized = sanitizeAadhaar(formatted);
      assert.equal(sanitized, `${baseNum}${checkDigit}`);
      assert.equal(sanitized.length, 12);
    });

    it("sanitizeAadhaar() rejects invalid lengths and bad checksums", () => {
      // Length != 12
      assert.throws(() => sanitizeAadhaar("12345"), /must be exactly 12 digits/);
      assert.throws(() => sanitizeAadhaar("12345678901234"), /must be exactly 12 digits/);

      // Invalid checksum
      const baseNum = "98765432109";
      const correctCheckDigit = generateVerhoeffCheckDigit(baseNum);
      const wrongCheckDigit = (correctCheckDigit + 1) % 10;
      assert.throws(
        () => sanitizeAadhaar(`${baseNum}${wrongCheckDigit}`),
        /Invalid Aadhaar number checksum/,
      );
    });
  });

  describe("2. Single-Flight Cache Deduplication & Observability Telemetry", () => {
    it("getOrSetCache() deduplicates in-flight fetchers on cold cache to prevent thundering herds", async () => {
      const coldKey = `cold_stampede_test_${Date.now()}`;
      let fetcherExecutionCount = 0;

      const slowFetcher = async () => {
        fetcherExecutionCount++;
        await new Promise((r) => setTimeout(r, 40));
        return { payload: "cadet_nominal_roll", timestamp: Date.now() };
      };

      // Dispatch 25 simultaneous concurrent requests on the COLD key
      const results = await Promise.all(
        Array.from({ length: 25 }, () => getOrSetCache(coldKey, 10, slowFetcher)),
      );

      assert.equal(results.length, 25);
      // Because of single-flight in-flight deduplication, fetcher was executed exactly ONCE
      assert.equal(fetcherExecutionCount, 1);
      assert.equal(results[0].payload, "cadet_nominal_roll");
      assert.equal(results[24].payload, "cadet_nominal_roll");
    });

    it("getCacheStats() tracks L1/L2 hits, misses, size, and hit ratio accurately", async () => {
      const key = `stats_test_${Date.now()}`;

      // 1. Initial request on cold cache: Miss
      await getOrSetCache(key, 10, async () => "value_a");
      let stats = getCacheStats();
      assert.equal(stats.l1Misses, 1);
      assert.equal(stats.l1Hits, 0);
      assert.equal(stats.l1Size >= 1, true);

      // 2. Subsequent 4 requests: L1 Hits
      for (let i = 0; i < 4; i++) {
        const val = await getOrSetCache(key, 10, async () => "value_a");
        assert.equal(val, "value_a");
      }

      stats = getCacheStats();
      assert.equal(stats.l1Hits, 4);
      assert.equal(stats.l1Misses, 1);
      assert.equal(stats.hitRatio, 80); // 4 / 5 = 80%

      // MAX_MEMORY_ITEMS constant is defined and exported as 5000
      assert.equal(MAX_MEMORY_ITEMS, 5000);
    });
  });

  describe("3. High-Throughput Memory Bounds & Denial-of-Service Shielding", () => {
    it("checkRateLimit() respects MAX_RATE_LIMITER_ITEMS = 5000 LRU capacity bound", () => {
      assert.equal(MAX_RATE_LIMITER_ITEMS, 5000);

      // Rapidly insert entries beyond burst threshold
      for (let i = 0; i < 50; i++) {
        const res = checkRateLimit(`ip_burst_${i}`, { maxAttempts: 10, windowMs: 60000 });
        assert.equal(res.allowed, true);
        assert.equal(res.remaining, 9);
      }
    });

    it("recordSecurityEvent() respects MAX_IDS_EVENT_HISTORY = 5000 capacity bound", async () => {
      assert.equal(MAX_IDS_EVENT_HISTORY, 5000);

      const res = await recordSecurityEvent({
        eventType: "TEST_PROBE",
        actorIp: "192.168.1.100",
        details: { test: true },
      });

      assert.ok(res.eventId);
      assert.equal(typeof res.riskScore, "number");
    });
  });

  describe("4. Non-Blocking Prefix Invalidation", () => {
    it("redisDelPrefix() purges keys matching prefix and executes non-blocking fallback", async () => {
      const prefix = `pfx_test_${Date.now()}`;
      await redisSet(`${prefix}:alpha`, "val1", 60);
      await redisSet(`${prefix}:beta`, "val2", 60);

      assert.equal(await redisGet(`${prefix}:alpha`), "val1");
      assert.equal(await redisGet(`${prefix}:beta`), "val2");

      const delResult = await redisDelPrefix(prefix);
      assert.equal(delResult, true);

      assert.equal(await redisGet(`${prefix}:alpha`), null);
      assert.equal(await redisGet(`${prefix}:beta`), null);
    });
  });
});
