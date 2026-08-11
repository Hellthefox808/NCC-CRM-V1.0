import { getAdmin } from "../../lib/ncc-db.ts";
import { dispatchReminder } from "./reminder.dispatcher.ts";

let schedulerTimer: ReturnType<typeof setInterval> | null = null;

export async function checkAndDispatchDueReminders(): Promise<number> {
  try {
    const admin = await getAdmin();
    const nowIso = new Date().toISOString();

    const { data: pendingReminders, error } = await admin
      .from("calendar_event_reminders")
      .select("*, calendar_events(title, start_time, location)")
      .eq("status", "PENDING")
      .lte("scheduled_for", nowIso)
      .limit(20);

    if (error || !pendingReminders || pendingReminders.length === 0) return 0;

    let dispatchedCount = 0;

    for (const item of pendingReminders) {
      const event = item.calendar_events as any;
      if (!event) continue;

      const success = await dispatchReminder({
        reminderId: item.id,
        eventId: item.event_id,
        eventTitle: event.title,
        startTime: event.start_time,
        location: event.location || "SBU Campus",
        offsetMinutes: item.offset_minutes,
        channel: item.channel,
        recipientScope: item.recipient_scope,
      });

      if (success) dispatchedCount++;
    }

    return dispatchedCount;
  } catch (err) {
    console.error("[Prompter Scheduler Exception]", err);
    return 0;
  }
}

export function startPrompterScheduler(intervalMs = 30000) {
  if (schedulerTimer) return;
  schedulerTimer = setInterval(() => {
    checkAndDispatchDueReminders().catch((e) => console.error("[Prompter Loop Error]", e));
  }, intervalMs);
}

export function stopPrompterScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
}
