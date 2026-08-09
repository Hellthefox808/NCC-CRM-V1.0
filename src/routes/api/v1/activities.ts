import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/activities")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const category = url.searchParams.get("category");
        const status = url.searchParams.get("status");

        try {
          const admin = await getAdmin();
          let query = admin
            .from("activities")
            .select("*")
            .order("start_time", { ascending: false });

          if (category) query = query.eq("category", category);
          if (status) query = query.eq("status", status);

          const { data, error } = await query;
          if (error) throw error;

          return json({
            success: true,
            data: { activities: data ?? [] },
          });
        } catch {
          return json({ success: false, error: "Failed to fetch activities" }, 500);
        }
      },

      POST: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const body = (await request.json().catch(() => ({}))) as Record<string, any>;
        if (!body.title || !body.startTime) {
          return json({ success: false, error: "Title and startTime are required." }, 400);
        }

        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("activities")
            .insert({
              title: body.title,
              category: body.category || "Institutional",
              description: body.description || "",
              image_url: body.imageUrl || "",
              location: body.location || "SBU Parade Ground",
              start_time: body.startTime,
              end_time: body.endTime || null,
              status: body.status || "PLANNED",
              organizer: body.organizer || "19 JHR BN NCC",
            })
            .select("*")
            .single();

          if (error) throw error;

          const { logAuditEvent } = await import("@backend/lib/audit-log.server");
          logAuditEvent({
            actor: "officer",
            action: "cadet_modified",
            target: `activity:${data.id}`,
            metadata: { title: body.title },
          });

          return json({ success: true, data: { activity: data } }, 201);
        } catch {
          return json({ success: false, error: "Failed to create activity" }, 500);
        }
      },
    },
  },
});
