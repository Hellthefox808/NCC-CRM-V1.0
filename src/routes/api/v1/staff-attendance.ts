import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/staff-attendance")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const url = new URL(request.url);
        const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);

        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("staff_attendance")
            .select("*")
            .eq("date", date)
            .order("clock_in", { ascending: false });

          if (error) throw error;

          return json({
            success: true,
            data: { attendance: data ?? [] },
          });
        } catch {
          return json({ success: false, error: "Failed to fetch staff attendance" }, 500);
        }
      },

      POST: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const body = (await request.json().catch(() => ({}))) as Record<string, any>;
        const { staffName, staffRole, action, dutyLocation, remarks } = body;

        if (!staffName || !action) {
          return json({ success: false, error: "staffName and action ('clock_in' | 'clock_out') required." }, 400);
        }

        const today = new Date().toISOString().slice(0, 10);

        try {
          const admin = await getAdmin();

          if (action === "clock_in") {
            const { data, error } = await admin
              .from("staff_attendance")
              .insert({
                staff_name: staffName,
                staff_role: staffRole || "PI Staff",
                date: today,
                clock_in: new Date().toISOString(),
                duty_location: dutyLocation || "SBU Parade Ground",
                remarks: remarks || "",
              })
              .select("*")
              .single();

            if (error) throw error;

            return json({ success: true, message: `${staffName} clocked in successfully.`, data: { record: data } });
          } else if (action === "clock_out") {
            // Find latest active clock_in for this staff member today
            const { data: existing } = await admin
              .from("staff_attendance")
              .select("id")
              .eq("staff_name", staffName)
              .eq("date", today)
              .is("clock_out", null)
              .order("clock_in", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (!existing) {
              return json({ success: false, error: "No active clock-in session found for today." }, 404);
            }

            const { data, error } = await admin
              .from("staff_attendance")
              .update({
                clock_out: new Date().toISOString(),
                remarks: remarks || "",
              })
              .eq("id", existing.id)
              .select("*")
              .single();

            if (error) throw error;

            return json({ success: true, message: `${staffName} clocked out successfully.`, data: { record: data } });
          }

          return json({ success: false, error: "Invalid action" }, 400);
        } catch {
          return json({ success: false, error: "Failed to update staff attendance" }, 500);
        }
      },
    },
  },
});
