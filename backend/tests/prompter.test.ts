import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_REMINDER_RULES,
  calculateScheduledTime,
} from "../services/prompter/reminder.rules";
import { checkAndDispatchDueReminders } from "../services/prompter/scheduler.ts";
import { getAdmin } from "../lib/ncc-db.ts";

describe("Prompter Reminder Engine Unit Tests", () => {
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

  it("checkAndDispatchDueReminders() handles query result error gracefully and returns 0", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

    const admin = await getAdmin();
    const originalFrom = admin.from;

    Object.defineProperty(admin, "from", {
      value: () =>
        ({
          select: () => ({
            eq: () => ({
              lte: () => ({
                limit: async () => ({
                  data: null,
                  error: { message: "Database query error", code: "PGRST500" },
                }),
              }),
            }),
          }),
        }) as any,
      writable: true,
      configurable: true,
    });

    try {
      const dispatchedCount = await checkAndDispatchDueReminders();
      assert.equal(dispatchedCount, 0);
    } finally {
      Object.defineProperty(admin, "from", {
        value: originalFrom,
        writable: true,
        configurable: true,
      });
    }
  });

  it("checkAndDispatchDueReminders() handles getAdmin or database exception gracefully and returns 0", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

    const admin = await getAdmin();
    const originalFrom = admin.from;

    Object.defineProperty(admin, "from", {
      value: () => {
        throw new Error("Simulated DB Connection Error");
      },
      writable: true,
      configurable: true,
    });

    try {
      const dispatchedCount = await checkAndDispatchDueReminders();
      assert.equal(dispatchedCount, 0);
    } finally {
      Object.defineProperty(admin, "from", {
        value: originalFrom,
        writable: true,
        configurable: true,
      });
    }
  });
});
