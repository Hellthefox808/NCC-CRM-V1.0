import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { prompterEngine } from "@backend/services/prompter/prompter.service";
import { queueEmailJob } from "@backend/services/queue/queue.service";
import { emitCalendarEventCancelled } from "@backend/services/socket/socket.server";
import { recordAuditLog } from "@backend/lib/audit-log.server";

export const Route = createFileRoute("/api/v1/calendar/$id/cancel")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, any>;
        const reason = body.reason || "Cancelled by battalion officer";

        try {
          const admin = await getAdmin();
          const { data: event, error } = await admin
            .from("calendar_events")
            .update({
              status: "CANCELLED",
              cancelled_at: new Date().toISOString(),
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

          // 1. Cancel pending Prompter reminders
          await prompterEngine.cancelEventReminders(id);

          // 2. Real-time Socket.IO Broadcast
          emitCalendarEventCancelled(id, reason);

          // 3. Non-blocking Async Cancellation Email Job
          const { data: cadets } = await admin.from("cadet_enrollments").select("email");
          const recipients = (cadets ?? []).map((c: any) => c.email).filter(Boolean);
          const emailTargets = recipients.length > 0 ? recipients : ["cadet@sbu.ac.in"];

          for (const email of emailTargets) {
            await queueEmailJob("sendEventCancelled", email, {
              eventTitle: event.title,
              startTime: event.start_time,
              reason,
              eventId: event.id,
            });
          }

          // 4. Audit Log
          await recordAuditLog({
            actorId: gate.officerName || "Officer",
            action: "CANCEL_CALENDAR_EVENT",
            target: id,
            details: `Cancelled calendar event '${event.title}'. Reason: ${reason}`,
          });

          return json({ success: true, data: { event } });
        } catch (err: any) {
          console.error("[Calendar Cancel Error]", err);
          return json({ success: false, error: "Failed to cancel calendar event" }, 500);
        }
      },
    },
  },
});
