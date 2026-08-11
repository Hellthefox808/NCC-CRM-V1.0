import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

const STARTED_AT = Date.now();

export const Route = createFileRoute("/api/v1/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const probeType = url.searchParams.get("type") || "health";

        // Liveness probe — instant application process responsiveness check
        if (probeType === "liveness") {
          return json({
            status: "ALIVE",
            uptimeSeconds: Math.floor((Date.now() - STARTED_AT) / 1000),
            timestamp: new Date().toISOString(),
          });
        }

        // Database ping check for Readiness / Full Health
        let dbOk = true;
        let dbErrorDetail: string | null = null;

        try {
          const admin = await getAdmin();
          const { error } = await admin
            .from("cadet_enrollments")
            .select("id", { count: "exact", head: true });

          if (error) {
            dbOk = false;
            dbErrorDetail = error.message;
          }
        } catch (err) {
          dbOk = false;
          dbErrorDetail = err instanceof Error ? err.message : String(err);
        }

        if (dbErrorDetail) {
          console.error("[Health Probe Database Error]", dbErrorDetail);
        }

        const isHealthy = dbOk;

        return json(
          {
            success: isHealthy,
            status: isHealthy ? "HEALTHY" : "DEGRADED",
            probe: probeType,
            service: "19 JHR BN NCC SBU Data Engine",
            version: "3.0.0",
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor((Date.now() - STARTED_AT) / 1000),
            checks: {
              database: dbOk ? "CONNECTED" : "DISCONNECTED",
            },
          },
          isHealthy ? 200 : 503,
        );
      },
    },
  },
});
