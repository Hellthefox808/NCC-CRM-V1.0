import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { prompterEngine } from "@backend/services/prompter/prompter.service";
import { queueEmailJob } from "@backend/services/queue/queue.service";
import { emitCalendarEventCreated, emitNotification } from "@backend/services/socket/socket.server";
import { recordAuditLog } from "@backend/lib/audit-log.server";

export const Route = createFileRoute("/api/v1/calendar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const statusFilter = url.searchParams.get("status");
          const typeFilter = url.searchParams.get("eventType");
          const startDate = url.searchParams.get("start");
          const endDate = url.searchParams.get("end");

          const admin = await getAdmin();
          let query = admin.from("calendar_events").select("*");

          if (statusFilter) {
            query = query.eq("status", statusFilter);
          }
          if (typeFilter) {
            query = query.eq("event_type", typeFilter);
          }
          if (startDate) {
            query = query.gte("start_time", startDate);
          }
          if (endDate) {
            query = query.lte("end_time", endDate);
          }

          const { data, error } = await query.order("start_time", { ascending: true });

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

        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const title = typeof body.title === "string" ? body.title : "";
        const startTime = typeof body.startTime === "string" ? body.startTime : "";
        const endTime = typeof body.endTime === "string" ? body.endTime : "";
        if (!title || !startTime || !endTime) {
          return json(
            { success: false, error: "Title, startTime, and endTime are required." },
            400,
          );
        }

        try {
          const admin = await getAdmin();
          const { data: event, error } = await admin
            .from("calendar_events")
            .insert({
              title,
              event_type: (body.eventType as string) || "Parade",
              start_time: startTime,
              end_time: endTime,
              timezone: (body.timezone as string) || "Asia/Kolkata",
              location: (body.location as string) || "SBU Campus",
              description: (body.description as string) || "",
              is_all_day: Boolean(body.isAllDay),
              status: (body.status as string) || "PUBLISHED",
              created_by: "Officer",
              updated_by: "Officer",
            })
            .select("*")
            .single();

          if (error) throw error;

          // 1. Prompter Engine: Setup automated 24h, 2h, 30m, start reminders
          await prompterEngine.setupEventReminders(event.id, event.start_time);

          // 2. Real-time Socket.IO Broadcast
          emitCalendarEventCreated(event);
          emitNotification({
            id: `notif_evt_${event.id}`,
            title: `New Event: ${event.title}`,
            category: "Training Schedule",
            priority: "NORMAL",
            date: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
            body: `A new ${event.event_type} event '${event.title}' has been scheduled for ${new Date(event.start_time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} at ${event.location}.`,
            read: false,
            actionType: "schedule",
            actionLabel: "View Details",
          });

          // 3. Non-blocking Async Email Notification Queue
          const { data: cadets } = await admin.from("cadet_enrollments").select("email");
          const recipients = (cadets ?? [])
            .map((c: Record<string, unknown>) => c.email as string)
            .filter(Boolean);
          const emailTargets = recipients.length > 0 ? recipients : ["cadet@sbu.ac.in"];

          for (const email of emailTargets) {
            await queueEmailJob("sendEventCreated", email, {
              eventTitle: event.title,
              eventType: event.event_type,
              startTime: event.start_time,
              endTime: event.end_time,
              location: event.location,
              description: event.description,
              eventId: event.id,
            });
          }

          // 4. Audit Log
          await recordAuditLog({
            actorId: "Officer",
            action: "CREATE_CALENDAR_EVENT",
            target: event.id,
            details: `Created calendar event '${event.title}'`,
          });

          return json({ success: true, data: { event } }, 201);
        } catch (err: unknown) {
          console.error("[Calendar Event Create Error]", err);
          return json({ success: false, error: "Failed to create calendar event" }, 500);
        }
      },
    },
  },
});
