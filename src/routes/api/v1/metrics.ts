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
          const [
            enrollmentsRes,
            enrolledRes,
            pendingRes,
            sdRes,
            swRes,
            eventsRes,
            notificationsRes,
            sessionsRes,
          ] = await Promise.all([
            admin.from("cadet_enrollments").select("id", { count: "exact", head: true }),
            admin
              .from("cadet_enrollments")
              .select("id", { count: "exact", head: true })
              .in("status", ["Enrolled", "Selected"]),
            admin
              .from("cadet_enrollments")
              .select("id", { count: "exact", head: true })
              .in("status", ["Submitted", "Physical Scheduled", "PENDING_ANO_REVIEW"]),
            admin
              .from("cadet_enrollments")
              .select("id", { count: "exact", head: true })
              .eq("gender", "SD"),
            admin
              .from("cadet_enrollments")
              .select("id", { count: "exact", head: true })
              .eq("gender", "SW"),
            admin.from("calendar_events").select("id", { count: "exact", head: true }),
            admin.from("notifications").select("id", { count: "exact", head: true }),
            admin.from("app_sessions").select("id", { count: "exact", head: true }),
          ]);

          const mem = process.memoryUsage();
          const memoryUsageMb = Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100;

          return json({
            success: true,
            data: {
              uptimeSeconds: Math.floor((Date.now() - STARTED_AT) / 1000),
              activeEnrollmentsCount: enrollmentsRes.count ?? 0,
              totalApplications: enrollmentsRes.count ?? 0,
              enrolledCount: enrolledRes.count ?? 0,
              pendingCount: pendingRes.count ?? 0,
              sdCount: sdRes.count ?? 0,
              swCount: swRes.count ?? 0,
              activeEventsCount: eventsRes.count ?? 0,
              notificationsCount: notificationsRes.count ?? 0,
              activeSessionsCount: sessionsRes.count ?? 0,
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
