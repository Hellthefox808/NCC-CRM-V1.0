import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { getRedisStatus } from "@backend/lib/redis.server";
import { checkSupabaseAdminHealth } from "@backend/integrations/supabase/client.server";
import { checkPrismaHealth } from "@backend/lib/prisma.server";
import { checkMongoHealth } from "@backend/lib/mongodb.server";

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

        // Primary Database (Supabase PostgreSQL) readiness check
        const supabaseHealth = await checkSupabaseAdminHealth();

        // Prisma ORM Engine status check
        let prismaHealth;
        try {
          prismaHealth = await checkPrismaHealth();
        } catch {
          prismaHealth = {
            status: "DISCONNECTED" as const,
            connected: false,
            error: "Prisma check failed",
          };
        }

        // MongoDB Atlas secondary store check
        let mongoHealth;
        try {
          mongoHealth = await checkMongoHealth();
        } catch {
          mongoHealth = {
            status: "DISCONNECTED" as const,
            connected: false,
            error: "MongoDB check failed",
          };
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

        // Overall system readiness: Primary Supabase DB must be operational
        const isHealthy = supabaseHealth.connected;

        return json(
          {
            success: isHealthy,
            status: isHealthy ? "HEALTHY" : "DEGRADED",
            probe: probeType,
            service: "19 JHR BN NCC SBU Data Engine",
            version: "3.2.0",
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor((Date.now() - STARTED_AT) / 1000),
            checks: {
              database: {
                status: supabaseHealth.status,
                connected: supabaseHealth.connected,
                latencyMs: supabaseHealth.latencyMs ?? 0,
                ...(supabaseHealth.error
                  ? {
                      error:
                        process.env.NODE_ENV !== "production"
                          ? supabaseHealth.error
                          : "Primary database unreachable",
                    }
                  : {}),
              },
              prisma: {
                status: prismaHealth.status,
                connected: prismaHealth.connected,
                latencyMs: prismaHealth.latencyMs,
                ...(prismaHealth.error
                  ? {
                      error:
                        process.env.NODE_ENV !== "production"
                          ? prismaHealth.error
                          : "Prisma database unreachable",
                    }
                  : {}),
              },
              mongodb: {
                status: mongoHealth.status,
                connected: mongoHealth.connected,
                latencyMs: mongoHealth.latencyMs,
                dbName: mongoHealth.dbName,
                ...(mongoHealth.error
                  ? {
                      error:
                        process.env.NODE_ENV !== "production"
                          ? mongoHealth.error
                          : "MongoDB store unreachable",
                    }
                  : {}),
              },
              redis: {
                mode: redisStatus.mode,
                connected: redisStatus.connected,
                ...(redisStatus.error
                  ? {
                      error:
                        process.env.NODE_ENV !== "production"
                          ? redisStatus.error
                          : "Cache service degraded",
                    }
                  : {}),
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
