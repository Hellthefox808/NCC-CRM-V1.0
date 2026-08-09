import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/annual-plans")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const year = url.searchParams.get("year") || "2026";

        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("annual_plans")
            .select("*")
            .eq("plan_year", parseInt(year, 10))
            .order("created_at", { ascending: true });

          if (error) throw error;

          return json({
            success: true,
            data: { plans: data ?? [] },
          });
        } catch {
          return json({ success: false, error: "Failed to fetch annual plans" }, 500);
        }
      },

      POST: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const body = (await request.json().catch(() => ({}))) as Record<string, any>;
        if (!body.title || !body.targetMonth) {
          return json({ success: false, error: "Title and targetMonth are required." }, 400);
        }

        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("annual_plans")
            .insert({
              plan_year: Number(body.planYear) || 2026,
              title: body.title,
              category: body.category || "Training",
              target_month: body.targetMonth,
              status: body.status || "PLANNED",
              remarks: body.remarks || "",
            })
            .select("*")
            .single();

          if (error) throw error;

          return json({ success: true, data: { plan: data } }, 201);
        } catch {
          return json({ success: false, error: "Failed to create annual plan entry" }, 500);
        }
      },
    },
  },
});
