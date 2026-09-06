import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_REMINDER_RULES,
  calculateScheduledTime,
} from "../services/prompter/reminder.rules.ts";
import { dispatchReminder } from "../services/prompter/reminder.dispatcher.ts";
import { setAdminClientOverride, resetAdminClientOverride } from "../lib/ncc-db.ts";

describe("Prompter Reminder Engine Unit Tests", () => {
  afterEach(() => {
    resetAdminClientOverride();
  });

  it("DEFAULT_REMINDER_RULES contains standard 24h, 2h, 30m, and start triggers", () => {
    assert.equal(DEFAULT_REMINDER_RULES.length, 4);

    const offsets = DEFAULT_REMINDER_RULES.map((r) => r.offsetMinutes);
    assert.deepEqual(offsets, [1440, 120, 30, 0]);
  });

  it("calculateScheduledTime() correctly subtracts offset minutes from event start time", () => {
    const eventStartTime = "2026-08-15T09:00:00.000Z";

    // 24h before (1440 minutes) -> 14 August 09:00
    const time24h = calculateScheduledTime(eventStartTime, 1440);
    assert.equal(new Date(time24h).toISOString(), "2026-08-14T09:00:00.000Z");

    // 2h before (120 minutes) -> 15 August 07:00
    const time2h = calculateScheduledTime(eventStartTime, 120);
    assert.equal(new Date(time2h).toISOString(), "2026-08-15T07:00:00.000Z");

    // 30m before (30 minutes) -> 15 August 08:30
    const time30m = calculateScheduledTime(eventStartTime, 30);
    assert.equal(new Date(time30m).toISOString(), "2026-08-15T08:30:00.000Z");

    // Start time (0 minutes) -> 15 August 09:00
    const timeStart = calculateScheduledTime(eventStartTime, 0);
    assert.equal(new Date(timeStart).toISOString(), "2026-08-15T09:00:00.000Z");
  });

  it("dispatchReminder() returns false when getAdmin() throws an error", async () => {
    setAdminClientOverride(new Error("Database connection or authentication error"));

    const samplePayload = {
      reminderId: "rem_123",
      eventId: "evt_456",
      eventTitle: "Annual Training Camp",
      startTime: "2026-09-01T08:00:00.000Z",
      location: "SBU Parade Ground",
      offsetMinutes: 120,
      channel: "BOTH",
      recipientScope: "ALL_CADETS",
    };

    const result = await dispatchReminder(samplePayload);
    assert.equal(result, false, "dispatchReminder should handle getAdmin failure and return false");
  });

  it("dispatchReminder() updates reminder status to FAILED and returns false when database operations fail", async () => {
    let failedStatusUpdated = false;

    const mockAdmin = {
      from: (table: string) => {
        if (table === "notifications") {
          return {
            insert: () => {
              throw new Error("DB Error inserting notification");
            },
          };
        }
        if (table === "calendar_event_reminders") {
          return {
            update: (payload: { status: string }) => {
              if (payload.status === "FAILED") {
                failedStatusUpdated = true;
              }
              return {
                eq: () => Promise.resolve({ error: null }),
              };
            },
          };
        }
        return {};
      },
    };

    setAdminClientOverride(mockAdmin);

    const samplePayload = {
      reminderId: "rem_789",
      eventId: "evt_456",
      eventTitle: "Firing Practice",
      startTime: "2026-09-05T06:00:00.000Z",
      location: "Range",
      offsetMinutes: 30,
      channel: "IN_APP",
      recipientScope: "ALL_CADETS",
    };

    const result = await dispatchReminder(samplePayload);
    assert.equal(result, false);
    assert.equal(failedStatusUpdated, true, "Status should be updated to FAILED on DB error");
  });

  it("dispatchReminder() returns true when dispatch flow succeeds", async () => {
    let sentStatusUpdated = false;

    const mockAdmin = {
      from: (table: string) => {
        if (table === "notifications") {
          return {
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({ data: { id: "notif_123" } }),
              }),
            }),
          };
        }
        if (table === "cadet_enrollments") {
          return {
            select: () => ({
              not: () => Promise.resolve({ data: [{ email: "cadet1@sbu.ac.in" }] }),
            }),
          };
        }
        if (table === "email_jobs") {
          return {
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({ data: { id: "job_123" } }),
              }),
            }),
          };
        }
        if (table === "calendar_event_reminders") {
          return {
            update: (payload: { status: string }) => {
              if (payload.status === "SENT") {
                sentStatusUpdated = true;
              }
              return {
                eq: () => Promise.resolve({ error: null }),
              };
            },
          };
        }
        return {};
      },
    };

    setAdminClientOverride(mockAdmin);

    const samplePayload = {
      reminderId: "rem_999",
      eventId: "evt_100",
      eventTitle: "Republic Day Parade Drill",
      startTime: "2027-01-26T06:00:00.000Z",
      location: "Main Ground",
      offsetMinutes: 1440,
      channel: "BOTH",
      recipientScope: "ALL_CADETS",
    };

    const result = await dispatchReminder(samplePayload);
    assert.equal(result, true);
    assert.equal(sentStatusUpdated, true, "Status should be updated to SENT on success");
  });
});
