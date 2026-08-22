import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { prompterEngine } from "@backend/services/prompter/prompter.service";
import { queueEmailJob } from "@backend/services/queue/queue.service";
import {
  emitCalendarEventUpdated,
  emitCalendarEventCancelled,
} from "@backend/services/socket/socket.server";
import { recordAuditLog } from "@backend/lib/audit-log.server";

export const Route = createFileRoute("/api/v1/calendar/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { id } = params;
          const admin = await getAdmin();

          const { data: event, error } = await admin
            .from("calendar_events")
            .select("*")
            .eq("id", id)
            .single();

          if (error || !event) {
            return json({ success: false, error: "Calendar event not found" }, 404);
          }

          const { data: attendees } = await admin
            .from("calendar_event_attendees")
            .select("*")
            .eq("event_id", id);

          const { data: reminders } = await admin
            .from("calendar_event_reminders")
            .select("*")
            .eq("event_id", id)
            .order("offset_minutes", { ascending: false });

          return json({
            success: true,
            data: {
              event,
              attendees: attendees ?? [],
              reminders: reminders ?? [],
            },
          });
        } catch {
          return json({ success: false, error: "Failed to fetch calendar event details" }, 500);
        }
      },

      PATCH: async ({ request, params }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

        try {
          const admin = await getAdmin();

          // Fetch existing event state
          const { data: existing, error: fetchErr } = await admin
            .from("calendar_events")
            .select("*")
            .eq("id", id)
            .single();

          if (fetchErr || !existing) {
            return json({ success: false, error: "Calendar event not found" }, 404);
          }

          const updatePayload: {
            updated_at: string;
            updated_by: string;
            title?: string;
            description?: string | null;
            event_type?: string;
            start_time?: string;
            end_time?: string;
            location?: string | null;
            status?: string;
            is_all_day?: boolean;
          } = {
            updated_at: new Date().toISOString(),
            updated_by: gate.officerName || "Officer",
          };

          if (typeof body.title === "string") updatePayload.title = body.title;
          if (body.description !== undefined)
            updatePayload.description = body.description as string | null;
          if (typeof body.eventType === "string") updatePayload.event_type = body.eventType;
          if (typeof body.startTime === "string") updatePayload.start_time = body.startTime;
          if (typeof body.endTime === "string") updatePayload.end_time = body.endTime;
          if (typeof body.location === "string") updatePayload.location = body.location;
          if (typeof body.status === "string") updatePayload.status = body.status;
          if (body.isAllDay !== undefined) updatePayload.is_all_day = Boolean(body.isAllDay);

          const { data: updated, error: updateErr } = await admin
            .from("calendar_events")
            .update(updatePayload)
            .eq("id", id)
            .select("*")
            .single();

          if (updateErr) throw updateErr;

          // If start time changed, recalculate prompter reminders
          if (body.startTime && body.startTime !== existing.start_time) {
            await prompterEngine.updateEventReminders(id, body.startTime as string);
          }

          // Socket.IO Broadcast
          emitCalendarEventUpdated(updated);

          // Non-blocking Async Update Email Job
          const { data: cadets } = await admin.from("cadet_enrollments").select("email");
          const recipients = (cadets ?? [])
            .map((c: Record<string, unknown>) => c.email as string)
            .filter(Boolean);
          const emailTargets = recipients.length > 0 ? recipients : ["cadet@sbu.ac.in"];

          for (const email of emailTargets) {
            await queueEmailJob("sendEventUpdated", email, {
              eventTitle: updated.title,
              oldStartTime: existing.start_time,
              newStartTime: updated.start_time,
              newEndTime: updated.end_time,
              newLocation: updated.location,
              changeSummary:
                (body.changeSummary as string) || "Schedule updated by battalion officer.",
              eventId: updated.id,
            });
          }

          // Audit Log
          await recordAuditLog({
            actorId: gate.officerName || "Officer",
            action: "UPDATE_CALENDAR_EVENT",
            target: id,
            details: `Updated calendar event '${updated.title}'`,
          });

          return json({ success: true, data: { event: updated } });
        } catch (err: unknown) {
          console.error("[Calendar Update Error]", err);
          return json({ success: false, error: "Failed to update calendar event" }, 500);
        }
      },

      DELETE: async ({ request, params }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const { id } = params;

        try {
          const admin = await getAdmin();

          // Cancel prompter reminders first
          await prompterEngine.cancelEventReminders(id);

          const { error } = await admin.from("calendar_events").delete().eq("id", id);
          if (error) throw error;

          // Socket.IO Broadcast
          emitCalendarEventCancelled(id, "Deleted by officer");

          // Audit Log
          await recordAuditLog({
            actorId: gate.officerName || "Officer",
            action: "DELETE_CALENDAR_EVENT",
            target: id,
            details: `Deleted calendar event ${id}`,
          });

          return json({ success: true, message: "Calendar event deleted successfully" });
        } catch (err: unknown) {
          console.error("[Calendar Delete Error]", err);
          return json({ success: false, error: "Failed to delete calendar event" }, 500);
        }
      },
    },
  },
});
