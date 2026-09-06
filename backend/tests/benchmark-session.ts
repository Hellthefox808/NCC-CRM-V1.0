import { performance } from "node:perf_hooks";
import { getOrSetCache, clearL1Cache, invalidateCache } from "../lib/cache.server.ts";

async function runBenchmark() {
  console.log("==================================================");
  console.log("⚡ SESSION RESOLUTION PERFORMANCE BENCHMARK ⚡");
  console.log("==================================================");

  const iterations = 1000;
  const token = "sess_benchmark_token_123456";
  const mockSession = {
    id: "uuid-1234-5678-90ab",
    token,
    email: "cadet.test@sbu.ac.in",
    display_name: "Test Cadet",
    role: "cadet",
    expires_at: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  };

  // Simulated DB query latency (e.g. 5ms average database network round-trip)
  const mockDbQuery = async () => {
    // Simulates database delay
    await new Promise((resolve) => setTimeout(resolve, 2));
    return mockSession;
  };

  // 1. UNCACHED BASELINE
  console.log(`\n1. Running ${iterations} UNCACHED session queries (Simulated DB)...`);
  const uncachedStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    await mockDbQuery();
  }
  const uncachedEnd = performance.now();
  const uncachedTotalMs = uncachedEnd - uncachedStart;
  const uncachedAvgMs = uncachedTotalMs / iterations;
  const uncachedOpsPerSec = (iterations / uncachedTotalMs) * 1000;

  console.log(`   Total time:    ${uncachedTotalMs.toFixed(2)} ms`);
  console.log(`   Avg latency:   ${uncachedAvgMs.toFixed(4)} ms / op`);
  console.log(`   Throughput:    ${uncachedOpsPerSec.toFixed(2)} ops/sec`);

  // 2. CACHED OPTIMIZATION (getOrSetCache)
  clearL1Cache();
  await invalidateCache(`ncc:session:${token}`);

  console.log(`\n2. Running ${iterations} CACHED session queries (getOrSetCache L1/L2)...`);
  const cachedStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    await getOrSetCache(`ncc:session:${token}`, 300, mockDbQuery);
  }
  const cachedEnd = performance.now();
  const cachedTotalMs = cachedEnd - cachedStart;
  const cachedAvgMs = cachedTotalMs / iterations;
  const cachedOpsPerSec = (iterations / cachedTotalMs) * 1000;

  console.log(`   Total time:    ${cachedTotalMs.toFixed(2)} ms`);
  console.log(`   Avg latency:   ${cachedAvgMs.toFixed(4)} ms / op`);
  console.log(`   Throughput:    ${cachedOpsPerSec.toFixed(2)} ops/sec`);

  // 3. COMPARISON METRICS
  const speedup = uncachedTotalMs / cachedTotalMs;
  const latencyReductionPct = ((uncachedAvgMs - cachedAvgMs) / uncachedAvgMs) * 100;

  console.log("\n==================================================");
  console.log("📊 BENCHMARK RESULTS SUMMARY 📊");
  console.log("==================================================");
  console.log(`Baseline Uncached Latency: ${uncachedAvgMs.toFixed(4)} ms`);
  console.log(`Optimized Cached Latency: ${cachedAvgMs.toFixed(4)} ms`);
  console.log(`Speedup Factor:           ${speedup.toFixed(2)}x faster`);
  console.log(`Latency Reduction:        ${latencyReductionPct.toFixed(2)}%`);
  console.log("==================================================");
}

runBenchmark().catch(console.error);
