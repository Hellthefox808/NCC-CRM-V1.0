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

        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const title = typeof body.title === "string" ? body.title : "";
        const targetMonth = typeof body.targetMonth === "string" ? body.targetMonth : "";
        if (!title || !targetMonth) {
          return json({ success: false, error: "Title and targetMonth are required." }, 400);
        }

        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("annual_plans")
            .insert({
              plan_year: Number(body.planYear) || 2026,
              title,
              category: (body.category as string) || "Training",
              target_month: targetMonth,
              status: (body.status as string) || "PLANNED",
              remarks: (body.remarks as string) || "",
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
