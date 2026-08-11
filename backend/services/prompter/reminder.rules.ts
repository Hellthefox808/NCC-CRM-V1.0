export interface StandardReminderRule {
  offsetMinutes: number; // minutes relative to event start time
  channel: "EMAIL" | "SOCKET_IO" | "IN_APP" | "BOTH";
  recipientScope: "ALL_CADETS" | "PI_STAFF" | "OFFICERS" | "SPECIFIC_USERS";
  label: string;
}

export const DEFAULT_REMINDER_RULES: StandardReminderRule[] = [
  {
    offsetMinutes: 1440, // 24 hours before
    channel: "BOTH",
    recipientScope: "ALL_CADETS",
    label: "24 hours before",
  },
  {
    offsetMinutes: 120, // 2 hours before
    channel: "BOTH",
    recipientScope: "ALL_CADETS",
    label: "2 hours before",
  },
  {
    offsetMinutes: 30, // 30 minutes before
    channel: "SOCKET_IO",
    recipientScope: "ALL_CADETS",
    label: "30 minutes before",
  },
  {
    offsetMinutes: 0, // At event start
    channel: "SOCKET_IO",
    recipientScope: "ALL_CADETS",
    label: "Event start",
  },
];

export function calculateScheduledTime(eventStartTime: string, offsetMinutes: number): string {
  const startMs = new Date(eventStartTime).getTime();
  const scheduledMs = startMs - offsetMinutes * 60 * 1000;
  return new Date(scheduledMs).toISOString();
}
