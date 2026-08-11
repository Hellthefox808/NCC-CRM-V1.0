import { getAdmin } from "@backend/lib/ncc-db";
import { DEFAULT_REMINDER_RULES, calculateScheduledTime } from "./reminder.rules";

export class PrompterEngineService {
  /** Create default scheduled reminder entries for a newly created calendar event. */
  public async setupEventReminders(
    eventId: string,
    eventStartTime: string,
    recipientScope: "ALL_CADETS" | "PI_STAFF" | "OFFICERS" = "ALL_CADETS",
  ): Promise<number> {
    const admin = await getAdmin();
    const rowsToInsert = DEFAULT_REMINDER_RULES.map((rule) => ({
      event_id: eventId,
      offset_minutes: rule.offsetMinutes,
      channel: rule.channel,
      recipient_scope: recipientScope,
      status: "PENDING",
      scheduled_for: calculateScheduledTime(eventStartTime, rule.offsetMinutes),
    }));

    const { data, error } = await admin
      .from("calendar_event_reminders")
      .insert(rowsToInsert)
      .select("id");

    if (error) {
      console.error("[Prompter Setup Error]", error);
      throw error;
    }

    return data?.length || 0;
  }

  /**
   * Atomically invalidates old pending reminders and creates new reminder schedule
   * when an event start time is updated.
   */
  public async updateEventReminders(
    eventId: string,
    newStartTime: string,
    recipientScope: "ALL_CADETS" | "PI_STAFF" | "OFFICERS" = "ALL_CADETS",
  ): Promise<number> {
    const admin = await getAdmin();

    // 1. Invalidate existing PENDING reminders
    await admin
      .from("calendar_event_reminders")
      .update({ status: "CANCELLED" })
      .eq("event_id", eventId)
      .eq("status", "PENDING");

    // 2. Insert updated reminder schedule
    return this.setupEventReminders(eventId, newStartTime, recipientScope);
  }

  /** Cancel all pending reminders when an event is cancelled. */
  public async cancelEventReminders(eventId: string): Promise<number> {
    const admin = await getAdmin();
    const { data, error } = await admin
      .from("calendar_event_reminders")
      .update({ status: "CANCELLED" })
      .eq("event_id", eventId)
      .eq("status", "PENDING")
      .select("id");

    if (error) {
      console.error("[Prompter Cancellation Error]", error);
      throw error;
    }

    return data?.length || 0;
  }

  /** Add a single custom reminder to an event. */
  public async addCustomReminder(
    eventId: string,
    offsetMinutes: number,
    channel: "EMAIL" | "SOCKET_IO" | "IN_APP" | "BOTH",
    eventStartTime: string,
    recipientScope: "ALL_CADETS" | "PI_STAFF" | "OFFICERS" = "ALL_CADETS",
  ): Promise<string> {
    const admin = await getAdmin();
    const scheduledFor = calculateScheduledTime(eventStartTime, offsetMinutes);

    const { data, error } = await admin
      .from("calendar_event_reminders")
      .insert({
        event_id: eventId,
        offset_minutes: offsetMinutes,
        channel,
        recipient_scope: recipientScope,
        status: "PENDING",
        scheduled_for: scheduledFor,
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  }
}

export const prompterEngine = new PrompterEngineService();
