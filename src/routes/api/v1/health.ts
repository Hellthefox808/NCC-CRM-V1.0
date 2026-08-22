import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { getRedisStatus } from "@backend/lib/redis.server";

const STARTED_AT = Date.now();

export const Route = createFileRoute("/api/v1/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const probeType = url.searchParams.get("type") || "health";
        const noCacheHeaders = {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        };

        // Liveness probe — instant application process responsiveness check
        if (probeType === "liveness") {
          return json(
            {
              status: "ALIVE",
              uptimeSeconds: Math.floor((Date.now() - STARTED_AT) / 1000),
              timestamp: new Date().toISOString(),
            },
            200,
            noCacheHeaders,
          );
        }

        // Database ping check for Readiness / Full Health
        let dbOk = true;
        let dbLatencyMs = 0;
        let dbErrorDetail: string | null = null;
        const dbStart = Date.now();

        try {
          const admin = await getAdmin();
          const { error } = await admin
            .from("cadet_enrollments")
            .select("id", { count: "exact", head: true });

          dbLatencyMs = Date.now() - dbStart;

          if (error) {
            dbOk = false;
            dbErrorDetail = error.message;
          }
        } catch (err) {
          dbOk = false;
          dbLatencyMs = Date.now() - dbStart;
          dbErrorDetail = err instanceof Error ? err.message : String(err);
        }

        if (dbErrorDetail) {
          console.error("[Health Probe Database Error]", dbErrorDetail);
        }

        // Redis cache status probe
        let redisStatus: { mode: string; connected: boolean; error?: string } = {
          mode: "unknown",
          connected: false,
        };
        try {
          redisStatus = await getRedisStatus();
        } catch (err) {
          redisStatus = {
            mode: "memory",
            connected: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }

        const mem = process.memoryUsage();
        const memoryUsageMb = Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100;
        const rssMb = Math.round((mem.rss / 1024 / 1024) * 100) / 100;

        const isHealthy = dbOk;

        return json(
          {
            success: isHealthy,
            status: isHealthy ? "HEALTHY" : "DEGRADED",
            probe: probeType,
            service: "19 JHR BN NCC SBU Data Engine",
            version: "3.1.0",
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor((Date.now() - STARTED_AT) / 1000),
            checks: {
              database: {
                status: dbOk ? "CONNECTED" : "DISCONNECTED",
                latencyMs: dbLatencyMs,
                ...(dbErrorDetail ? { error: dbErrorDetail } : {}),
              },
              redis: {
                mode: redisStatus.mode,
                connected: redisStatus.connected,
                ...(redisStatus.error ? { error: redisStatus.error } : {}),
              },
              memory: {
                heapUsedMb: memoryUsageMb,
                rssMb,
              },
            },
          },
          isHealthy ? 200 : 503,
          noCacheHeaders,
        );
      },
    },
  },
});
