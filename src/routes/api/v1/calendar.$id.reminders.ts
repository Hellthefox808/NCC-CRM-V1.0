import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { prompterEngine } from "@backend/services/prompter/prompter.service";

export const Route = createFileRoute("/api/v1/calendar/$id/reminders")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

        if (body.offsetMinutes === undefined) {
          return json({ success: false, error: "offsetMinutes is required" }, 400);
        }

        try {
          const admin = await getAdmin();
          const { data: event, error } = await admin
            .from("calendar_events")
            .select("start_time")
            .eq("id", id)
            .single();

          if (error || !event) {
            return json({ success: false, error: "Calendar event not found" }, 404);
          }

          const reminderId = await prompterEngine.addCustomReminder(
            id,
            Number(body.offsetMinutes),
            (body.channel as "EMAIL" | "SOCKET" | "BOTH") || "BOTH",
            event.start_time,
            (body.recipientScope as "ALL_CADETS" | "SD_ONLY" | "SW_ONLY" | "OFFICERS_ONLY") ||
              "ALL_CADETS",
          );

          return json(
            {
              success: true,
              message: "Custom reminder scheduled successfully",
              data: { reminderId },
            },
            201,
          );
        } catch (err: unknown) {
          console.error("[Custom Reminder Create Error]", err);
          return json({ success: false, error: "Failed to schedule custom reminder" }, 500);
        }
      },
    },
  },
});
