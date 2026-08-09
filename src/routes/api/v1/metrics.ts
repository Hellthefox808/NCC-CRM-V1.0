import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

const STARTED_AT = Date.now();

export const Route = createFileRoute("/api/v1/metrics")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const admin = await getAdmin();
          const [enrollments, sessions] = await Promise.all([
            admin.from("cadet_enrollments").select("id", { count: "exact", head: true }),
            admin.from("app_sessions").select("id", { count: "exact", head: true }),
          ]);

          return json({
            success: true,
            data: {
              uptimeSeconds: Math.floor((Date.now() - STARTED_AT) / 1000),
              activeWebSocketClients: 0,
              totalRequests: 0,
              cacheHitRatioPercent: 0,
              averageLatencyMs: 0,
              activeEnrollmentsCount: enrollments.count ?? 0,
              activeSessionsCount: sessions.count ?? 0,
              memoryUsageMb: 0,
            },
          });
        } catch {
          return json({ success: false, error: "Database unavailable" }, 500);
        }
      },
    },
  },
});
