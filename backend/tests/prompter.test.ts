import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_REMINDER_RULES,
  calculateScheduledTime,
} from "../services/prompter/reminder.rules";
import { checkAndDispatchDueReminders } from "../services/prompter/scheduler.ts";
import { supabaseAdmin } from "../integrations/supabase/client.server.ts";

process.env["SUPABASE_URL"] = process.env["SUPABASE_URL"] || "https://example.supabase.co";
process.env["SUPABASE_SERVICE_ROLE_KEY"] =
  process.env["SUPABASE_SERVICE_ROLE_KEY"] || "mock-service-role-key";

// Initialize proxy object property before attaching mocks
if (supabaseAdmin) {
  void supabaseAdmin.auth;
}

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

  it("checkAndDispatchDueReminders() returns 0 when pendingReminders query returns empty array", async () => {
    const origFrom = supabaseAdmin.from;
    (supabaseAdmin as any).from = mock.fn(() => ({
      select: () => ({
        eq: () => ({
          lte: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
    }));

    try {
      const dispatched = await checkAndDispatchDueReminders();
      assert.equal(dispatched, 0);
    } finally {
      (supabaseAdmin as any).from = origFrom;
    }
  });

  it("checkAndDispatchDueReminders() returns 0 when query fails with error", async () => {
    const origFrom = supabaseAdmin.from;
    (supabaseAdmin as any).from = mock.fn(() => ({
      select: () => ({
        eq: () => ({
          lte: () => ({
            limit: () =>
              Promise.resolve({
                data: null,
                error: { message: "Database connection failure" },
              }),
          }),
        }),
      }),
    }));

    try {
      const dispatched = await checkAndDispatchDueReminders();
      assert.equal(dispatched, 0);
    } finally {
      (supabaseAdmin as any).from = origFrom;
    }
  });
});
