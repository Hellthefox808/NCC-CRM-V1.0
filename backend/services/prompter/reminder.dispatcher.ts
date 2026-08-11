import { getAdmin } from "../../lib/ncc-db.ts";
import { queueEmailJob } from "../queue/queue.service.ts";
import { emitNotification, emitCalendarUpdate } from "../socket/socket.server.ts";

export interface ReminderDispatcherPayload {
  reminderId: string;
  eventId: string;
  eventTitle: string;
  startTime: string;
  location: string;
  offsetMinutes: number;
  channel: string;
  recipientScope: string;
}

export async function dispatchReminder(payload: ReminderDispatcherPayload): Promise<boolean> {
  const admin = await getAdmin();
  try {
    const timeText =
      payload.offsetMinutes === 1440
        ? "24 hours before"
        : payload.offsetMinutes === 120
          ? "2 hours before"
          : payload.offsetMinutes === 30
            ? "30 minutes before"
            : payload.offsetMinutes === 0
              ? "starting now"
              : `${payload.offsetMinutes} minutes before`;

    // 1. Create in-app notification record if channel includes IN_APP or BOTH or SOCKET_IO
    const { data: notifData } = await admin
      .from("notifications")
      .insert({
        title: `Upcoming Event: ${payload.eventTitle}`,
        category: "Schedule Reminder",
        priority: payload.offsetMinutes <= 30 ? "HIGH" : "NORMAL",
        body: `Event '${payload.eventTitle}' is scheduled to start at ${new Date(payload.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} at ${payload.location}.`,
        action_type: "schedule",
        action_label: "View Calendar",
      })
      .select("id")
      .single();

    const notifId = notifData?.id;

    // 2. Dispatch via Socket.IO if channel is SOCKET_IO or BOTH
    if (payload.channel === "SOCKET_IO" || payload.channel === "BOTH") {
      emitNotification({
        id: notifId || `rem_${Date.now()}`,
        title: `Upcoming Event: ${payload.eventTitle}`,
        category: "Schedule Reminder",
        priority: payload.offsetMinutes <= 30 ? "HIGH" : "NORMAL",
        date: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
        body: `Event '${payload.eventTitle}' starts ${timeText} at ${payload.location}.`,
        read: false,
        actionType: "schedule",
        actionLabel: "View Calendar",
      });

      emitCalendarUpdate({
        type: "EVENT_REMINDER_TRIGGERED",
        eventId: payload.eventId,
        eventTitle: payload.eventTitle,
        startTime: payload.startTime,
        offsetMinutes: payload.offsetMinutes,
      });
    }

    // 3. Dispatch via Email if channel is EMAIL or BOTH
    if (payload.channel === "EMAIL" || payload.channel === "BOTH") {
      // Retrieve target recipients based on scope
      let recipients: string[] = [];

      if (payload.recipientScope === "ALL_CADETS") {
        const { data: cadets } = await admin
          .from("cadet_enrollments")
          .select("email")
          .not("email", "is", null);
        recipients = (cadets ?? []).map((c: any) => c.email).filter(Boolean);
      }

      // Default fallback recipient if list is empty
      if (recipients.length === 0) {
        recipients = ["cadet@sbu.ac.in"];
      }

      for (const email of recipients) {
        await queueEmailJob("sendReminder", email, {
          eventTitle: payload.eventTitle,
          startTime: payload.startTime,
          location: payload.location,
          reminderTimeText: timeText,
          eventId: payload.eventId,
        });
      }
    }

    // 4. Update reminder status in DB to SENT
    await admin
      .from("calendar_event_reminders")
      .update({
        status: "SENT",
        sent_at: new Date().toISOString(),
      })
      .eq("id", payload.reminderId);

    return true;
  } catch (err) {
    console.error("[Reminder Dispatcher Error]", err);
    await admin
      .from("calendar_event_reminders")
      .update({ status: "FAILED" })
      .eq("id", payload.reminderId);
    return false;
  }
}
