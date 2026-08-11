import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

const STARTED_AT = Date.now();

export const Route = createFileRoute("/api/v1/metrics")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        try {
          const admin = await getAdmin();
          const [enrollments, sessions] = await Promise.all([
            admin.from("cadet_enrollments").select("id", { count: "exact", head: true }),
            admin.from("app_sessions").select("id", { count: "exact", head: true }),
          ]);

          const mem = process.memoryUsage();
          const memoryUsageMb = Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100;

          return json({
            success: true,
            data: {
              uptimeSeconds: Math.floor((Date.now() - STARTED_AT) / 1000),
              activeEnrollmentsCount: enrollments.count ?? 0,
              activeSessionsCount: sessions.count ?? 0,
              memoryUsageMb,
              heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
              rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
            },
          });
        } catch {
          return json({ success: false, error: "Database unavailable" }, 500);
        }
      },
    },
  },
});
