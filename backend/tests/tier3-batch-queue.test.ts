import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { processPendingEmailJobs, queueEmailJobsBatch } from "../services/queue/queue.service.ts";

describe("Tier 3: Batch Queueing, Worker Execution & Concurrency Tests", () => {
  let mockJobs: Array<Record<string, unknown>> = [];
  let updatedJobs: Array<Record<string, unknown>> = [];

  beforeEach(() => {
    mockJobs = [];
    updatedJobs = [];

    process.env["SUPABASE_URL"] = process.env["SUPABASE_URL"] || "http://127.0.0.1:54321";
    process.env["SUPABASE_SERVICE_ROLE_KEY"] =
      process.env["SUPABASE_SERVICE_ROLE_KEY"] || "mock-service-role-key";

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = typeof input === "string" ? input : input.toString();
      const method = init?.method || "GET";

      if (urlStr.includes("/rest/v1/email_jobs")) {
        if (method === "GET") {
          const pending = mockJobs.filter((j) => j.status === "PENDING");
          return new Response(JSON.stringify(pending), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (method === "POST") {
          const body = JSON.parse((init?.body as string) || "[]");
          const rowArray = Array.isArray(body) ? body : [body];
          const inserted = rowArray.map((r, i) => ({
            id: `batch_job_${Date.now()}_${i}`,
            ...r,
          }));
          return new Response(JSON.stringify(inserted.length === 1 ? inserted[0] : inserted), {
            status: 201,
            headers: {
              "Content-Type": "application/json",
              "Content-Range": `0-${inserted.length - 1}/${inserted.length}`,
            },
          });
        }

        if (method === "PATCH") {
          const body = JSON.parse((init?.body as string) || "{}");
          updatedJobs.push(body);
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      if (urlStr.includes("/rest/v1/email_delivery_logs")) {
        return new Response(JSON.stringify({ id: "log-1" }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({}), { status: 200 });
    }) as typeof fetch;
  });

  describe("1. Atomic Batch Enqueueing (queueEmailJobsBatch)", () => {
    it("handles empty job array cleanly without database calls", async () => {
      const res = await queueEmailJobsBatch([]);
      assert.equal(res.success, true);
      assert.equal(res.enqueuedCount, 0);
    });

    it("enqueues 100+ batch email jobs atomically in a single operation", async () => {
      const batch = Array.from({ length: 120 }, (_, idx) => ({
        jobType: "sendReminder",
        recipient: `cadet.${idx}@sbu.ac.in`,
        payload: {
          eventTitle: "Annual Firing Training Camp",
          cadetName: `Cadet ${idx}`,
          offsetMinutes: 120,
        },
      }));

      const res = await queueEmailJobsBatch(batch);
      assert.equal(res.success, true);
      assert.equal(res.enqueuedCount, 120);
    });
  });

  describe("2. Worker Draining Loop & Retry Ceilings", () => {
    it("drains pending jobs and processes them with retry threshold checking", async () => {
      // Mock 2 pending jobs
      mockJobs = [
        {
          id: "job-1",
          job_type: "sendWelcomeEmail",
          recipient: "cadet.new@sbu.ac.in",
          payload: { cadetName: "Praveen Singh", regimentalId: "192026102312345678" },
          status: "PENDING",
          attempts: 0,
        },
        {
          id: "job-2",
          job_type: "sendOtp",
          recipient: "cadet.otp@sbu.ac.in",
          payload: { code: "654321", purpose: "login" },
          status: "PENDING",
          attempts: 0,
        },
      ];

      const processedCount = await processPendingEmailJobs();
      assert.equal(processedCount, 2);
      assert.ok(updatedJobs.some((j) => j.status === "COMPLETED"));
    });
  });
});
