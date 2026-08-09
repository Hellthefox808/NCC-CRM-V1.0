import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/audit")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const url = new URL(request.url);
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));
        const action = url.searchParams.get("action");

        try {
          const admin = await getAdmin();
          let query = admin
            .from("audit_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

          if (action) query = query.eq("action", action);

          const { data, error } = await query;
          if (error) throw error;

          return json({
            success: true,
            data: { logs: data ?? [] },
          });
        } catch {
          return json({ success: false, error: "Failed to fetch audit logs" }, 500);
        }
      },
    },
  },
});
