import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/calendar")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("calendar_events")
            .select("*")
            .order("start_time", { ascending: true });

          if (error) throw error;

          return json({
            success: true,
            data: { events: data ?? [] },
          });
        } catch {
          return json({ success: false, error: "Failed to fetch calendar events" }, 500);
        }
      },

      POST: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const body = (await request.json().catch(() => ({}))) as Record<string, any>;
        if (!body.title || !body.startTime || !body.endTime) {
          return json({ success: false, error: "Title, startTime, and endTime are required." }, 400);
        }

        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("calendar_events")
            .insert({
              title: body.title,
              event_type: body.eventType || "Parade",
              start_time: body.startTime,
              end_time: body.endTime,
              location: body.location || "SBU Campus",
              description: body.description || "",
              is_all_day: Boolean(body.isAllDay),
            })
            .select("*")
            .single();

          if (error) throw error;

          return json({ success: true, data: { event: data } }, 201);
        } catch {
          return json({ success: false, error: "Failed to create calendar event" }, 500);
        }
      },
    },
  },
});
