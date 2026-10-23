import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { resetAdminClientOverride, setAdminClientOverride } from "../lib/ncc-db.ts";
import {
  DEFAULT_REMINDER_RULES,
  calculateScheduledTime,
} from "../services/prompter/reminder.rules.ts";
import { dispatchReminder } from "../services/prompter/reminder.dispatcher.ts";

describe("Tier 2: Prompter Reminder Engine & Dynamic Lifecycle Tests", () => {
  afterEach(() => {
    resetAdminClientOverride();
  });

  describe("1. Default Reminder Rules & Interval Offsets", () => {
    it("configures standard notification schedule (24h, 2h, 30m, 0m start)", () => {
      assert.equal(DEFAULT_REMINDER_RULES.length, 4);
      const offsets = DEFAULT_REMINDER_RULES.map((r) => r.offsetMinutes);
      assert.deepEqual(offsets, [1440, 120, 30, 0]);
    });
  });

  describe("2. Scheduled Time Offset Calculation", () => {
    it("accurately calculates reminder trigger times relative to event start", () => {
      const eventStart = "2026-10-30T10:00:00.000Z";

      // 24 hours prior (1440 min)
      const t24h = calculateScheduledTime(eventStart, 1440);
      assert.equal(new Date(t24h).toISOString(), "2026-10-29T10:00:00.000Z");

      // 2 hours prior (120 min)
      const t2h = calculateScheduledTime(eventStart, 120);
      assert.equal(new Date(t24h).toISOString(), "2026-10-29T10:00:00.000Z");
      assert.equal(new Date(t2h).toISOString(), "2026-10-30T08:00:00.000Z");

      // 30 minutes prior
      const t30m = calculateScheduledTime(eventStart, 30);
      assert.equal(new Date(t30m).toISOString(), "2026-10-30T09:30:00.000Z");

      // Exactly at event start
      const t0m = calculateScheduledTime(eventStart, 0);
      assert.equal(new Date(t0m).toISOString(), "2026-10-30T10:00:00.000Z");
    });

    it("handles month and year rollover boundaries safely", () => {
      // Event on 1 January 2027 at 01:00 UTC
      const eventStart = "2027-01-01T01:00:00.000Z";

      // 2 hours prior rolls back to 31 December 2026
      const t2h = calculateScheduledTime(eventStart, 120);
      assert.equal(new Date(t2h).toISOString(), "2026-12-31T23:00:00.000Z");

      // 24 hours prior rolls back to 31 December 2026 01:00 UTC
      const t24h = calculateScheduledTime(eventStart, 1440);
      assert.equal(new Date(t24h).toISOString(), "2026-12-31T01:00:00.000Z");
    });
  });

  describe("3. Rescheduling & Invalidation Logic", () => {
    it("calculates updated reminder schedules when an event is rescheduled", () => {
      const originalStart = "2026-11-10T08:00:00.000Z";
      const rescheduledStart = "2026-11-12T14:00:00.000Z";

      const original24h = calculateScheduledTime(originalStart, 1440);
      const updated24h = calculateScheduledTime(rescheduledStart, 1440);

      assert.notEqual(original24h, updated24h);
      assert.equal(new Date(updated24h).toISOString(), "2026-11-11T14:00:00.000Z");
    });

    it("dispatchReminder() formats payload and executes cleanly", async () => {
      setAdminClientOverride({
        from: () => ({
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: { id: "notif-test-101" }, error: null }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      });

      const reminder = {
        reminderId: "rem-101",
        eventId: "event-202",
        eventTitle: "Annual Republic Day Camp Drill",
        startTime: "2026-11-15T06:00:00.000Z",
        location: "Khelgaon Stadium, Ranchi",
        offsetMinutes: 120,
        channel: "IN_APP",
        recipientScope: "ALL_CADETS",
      };

      const result = await dispatchReminder(reminder);
      assert.equal(result, true);
    });
  });
});
