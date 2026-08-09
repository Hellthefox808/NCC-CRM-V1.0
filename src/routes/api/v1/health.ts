import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

const STARTED_AT = Date.now();

export const Route = createFileRoute("/api/v1/health")({
  server: {
    handlers: {
      GET: async () => {
        let dbOk = true;
        try {
          const admin = await getAdmin();
          const { error } = await admin
            .from("cadet_enrollments")
            .select("id", { count: "exact", head: true });
          dbOk = !error;
        } catch {
          dbOk = false;
        }

        return json({
          success: true,
          status: dbOk ? "HEALTHY" : "DEGRADED",
          service: "19 JHR BN NCC SBU Data Engine",
          version: "3.0.0",
          timestamp: new Date().toISOString(),
          uptimeSeconds: Math.floor((Date.now() - STARTED_AT) / 1000),
          activeWebSocketClients: 0,
          memoryUsageMb: 0,
        });
      },
    },
  },
});
