import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { prompterEngine } from "@backend/services/prompter/prompter.service";
import { emitCalendarEventCreated, emitNotification } from "@backend/services/socket/socket.server";
import { recordAuditLog } from "@backend/lib/audit-log.server";

export const Route = createFileRoute("/api/v1/calendar/$id/publish")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const { id } = params;

        try {
          const admin = await getAdmin();
          const { data: event, error } = await admin
            .from("calendar_events")
            .update({
              status: "PUBLISHED",
              published_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              updated_by: gate.officerName || "Officer",
            })
            .eq("id", id)
            .select("*")
            .single();

          if (error || !event) {
            return json(
              { success: false, error: "Calendar event not found or update failed" },
              404,
            );
          }

          // Ensure prompter reminders exist
          await prompterEngine.setupEventReminders(event.id, event.start_time);

          // Socket.IO Broadcast
          emitCalendarEventCreated(event);
          emitNotification({
            id: `notif_pub_${event.id}`,
            title: `Event Published: ${event.title}`,
            category: "Calendar Update",
            priority: "NORMAL",
            date: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
            body: `Event '${event.title}' is now published for ${new Date(event.start_time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}.`,
            read: false,
            actionType: "schedule",
            actionLabel: "View Event",
          });

          // Audit Log
          await recordAuditLog({
            actorId: gate.officerName || "Officer",
            action: "PUBLISH_CALENDAR_EVENT",
            target: id,
            details: `Published calendar event '${event.title}'`,
          });

          return json({ success: true, data: { event } });
        } catch (err: any) {
          console.error("[Calendar Publish Error]", err);
          return json({ success: false, error: "Failed to publish calendar event" }, 500);
        }
      },
    },
  },
});
