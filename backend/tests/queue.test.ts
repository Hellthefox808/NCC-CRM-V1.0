import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mailer } from "../services/mail/mailer.ts";
import {
  processPendingEmailJobs,
  queueEmailJob,
  queueEmailJobsBatch,
} from "../services/queue/queue.service.ts";

describe("Queue Service Job Execution & Error Handling Unit Tests", () => {
  let mockJobs: Array<Record<string, unknown>> = [];
  let updatedJobs: Array<Record<string, unknown>> = [];
  let deliveryLogs: Array<Record<string, unknown>> = [];
  let mockAdminError: Error | null = null;

  beforeEach(() => {
    mockJobs = [];
    updatedJobs = [];
    deliveryLogs = [];
    mockAdminError = null;

    // Set mock env vars so getAdmin() can run createSupabaseAdminClient without throwing missing env var error
    process.env["SUPABASE_URL"] = process.env["SUPABASE_URL"] || "http://127.0.0.1:54321";
    process.env["SUPABASE_SERVICE_ROLE_KEY"] =
      process.env["SUPABASE_SERVICE_ROLE_KEY"] || "mock-service-role-key";

    // Global fetch mock to intercept Supabase PostgREST client queries
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = typeof input === "string" ? input : input.toString();
      const method = init?.method || "GET";

      if (urlStr.includes("/rest/v1/email_jobs")) {
        if (method === "GET") {
          if (mockAdminError) {
            return new Response(JSON.stringify({ message: mockAdminError.message }), { status: 500 });
          }
          const pending = mockJobs.filter((j) => j.status === "PENDING");
          return new Response(JSON.stringify(pending), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (method === "POST") {
          if (mockAdminError) {
            return new Response(JSON.stringify({ message: mockAdminError.message }), { status: 400 });
          }
          const body = JSON.parse((init?.body as string) || "[]");
          const rowArray = Array.isArray(body) ? body : [body];
          const inserted = rowArray.map((r, i) => ({
            id: `job_${Date.now()}_${i}`,
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
          return new Response(JSON.stringify([body]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      if (urlStr.includes("/rest/v1/email_delivery_logs")) {
        if (method === "POST") {
          const body = JSON.parse((init?.body as string) || "{}");
          deliveryLogs.push(body);
          return new Response(JSON.stringify([body]), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify([]), { status: 200 });
    }) as typeof fetch;
  });

  it("processPendingEmailJobs() handles mailer exception cleanly and marks job as PENDING when attempts < 3", async () => {
    mockJobs = [
      {
        id: "job_err_1",
        job_type: "sendOtp",
        recipient: "cadet.test@sbu.ac.in",
        payload: { recipient: "cadet.test@sbu.ac.in", otpCode: "123456" },
        attempts: 0,
        status: "PENDING",
      },
    ];

    // Mock sendOtp to throw an Error
    const originalSendOtp = mailer.sendOtp;
    mailer.sendOtp = async () => {
      throw new Error("SMTP connection timeout");
    };

    try {
      const processedCount = await processPendingEmailJobs();

      assert.equal(processedCount, 0, "No jobs should be processed successfully");

      // Verify status update on email_jobs
      const processingUpdate = updatedJobs.find((u) => u.status === "PROCESSING");
      assert.ok(processingUpdate, "Job should first be marked as PROCESSING");
      assert.equal(processingUpdate.attempts, 1);

      const failedUpdate = updatedJobs.find((u) => u.status === "PENDING");
      assert.ok(failedUpdate, "Job should be set back to PENDING when attempt < 3");
      assert.equal(failedUpdate.error_message, "SMTP connection timeout");

      // Verify email_delivery_logs entry
      assert.equal(deliveryLogs.length, 1);
      assert.equal(deliveryLogs[0].status, "FAILED");
      assert.equal(deliveryLogs[0].error_details, "SMTP connection timeout");
    } finally {
      mailer.sendOtp = originalSendOtp;
    }
  });

  it("processPendingEmailJobs() marks job as FAILED when attempts reach max limit (3)", async () => {
    mockJobs = [
      {
        id: "job_max_attempts",
        job_type: "sendOtp",
        recipient: "cadet.test@sbu.ac.in",
        payload: { recipient: "cadet.test@sbu.ac.in", otpCode: "999999" },
        attempts: 2, // 3rd attempt when processed
        status: "PENDING",
      },
    ];

    const originalSendOtp = mailer.sendOtp;
    mailer.sendOtp = async () => {
      throw new Error("Permanent mail server rejection");
    };

    try {
      const processedCount = await processPendingEmailJobs();

      assert.equal(processedCount, 0);

      const failedUpdate = updatedJobs.find((u) => u.status === "FAILED");
      assert.ok(
        failedUpdate,
        "Job should be marked as FAILED when max attempts (3) is reached",
      );
      assert.equal(failedUpdate.error_message, "Permanent mail server rejection");

      assert.equal(deliveryLogs.length, 1);
      assert.equal(deliveryLogs[0].status, "FAILED");
      assert.equal(deliveryLogs[0].error_details, "Permanent mail server rejection");
    } finally {
      mailer.sendOtp = originalSendOtp;
    }
  });

  it("processPendingEmailJobs() handles mailer methods returning success: false", async () => {
    mockJobs = [
      {
        id: "job_returned_error",
        job_type: "sendWelcomeEmail",
        recipient: "cadet.test@sbu.ac.in",
        payload: {
          recipient: "cadet.test@sbu.ac.in",
          cadetName: "Rohan",
          enrollmentNo: "123",
          subject: "Welcome",
        },
        attempts: 1,
        status: "PENDING",
      },
    ];

    const originalSendWelcome = mailer.sendWelcomeEmail;
    mailer.sendWelcomeEmail = async () => {
      return { success: false, error: "Recipient inbox full" };
    };

    try {
      const processedCount = await processPendingEmailJobs();

      assert.equal(processedCount, 0);

      const statusUpdate = updatedJobs.find((u) => u.status === "PENDING");
      assert.ok(statusUpdate);
      assert.equal(statusUpdate.error_message, "Recipient inbox full");

      assert.equal(deliveryLogs.length, 1);
      assert.equal(deliveryLogs[0].status, "FAILED");
      assert.equal(deliveryLogs[0].subject, "Welcome");
      assert.equal(deliveryLogs[0].error_details, "Recipient inbox full");
    } finally {
      mailer.sendWelcomeEmail = originalSendWelcome;
    }
  });

  it("processPendingEmailJobs() handles unknown job types gracefully", async () => {
    mockJobs = [
      {
        id: "job_unknown",
        job_type: "sendUnknownType",
        recipient: "cadet.test@sbu.ac.in",
        payload: {},
        attempts: 0,
        status: "PENDING",
      },
    ];

    const processedCount = await processPendingEmailJobs();

    assert.equal(processedCount, 0);

    const statusUpdate = updatedJobs.find((u) => u.status === "PENDING");
    assert.ok(statusUpdate);
    assert.equal(statusUpdate.error_message, "Unknown job type: sendUnknownType");

    assert.equal(deliveryLogs.length, 1);
    assert.equal(deliveryLogs[0].status, "FAILED");
    assert.equal(deliveryLogs[0].error_details, "Unknown job type: sendUnknownType");
  });

  it("processPendingEmailJobs() successfully completes job and records delivery log", async () => {
    mockJobs = [
      {
        id: "job_success",
        job_type: "sendOtp",
        recipient: "cadet.test@sbu.ac.in",
        payload: { recipient: "cadet.test@sbu.ac.in", otpCode: "654321", subject: "OTP Code" },
        attempts: 0,
        status: "PENDING",
      },
    ];

    const originalSendOtp = mailer.sendOtp;
    mailer.sendOtp = async () => {
      return { success: true, messageId: "msg_12345" };
    };

    try {
      const processedCount = await processPendingEmailJobs();

      assert.equal(processedCount, 1);

      const completedUpdate = updatedJobs.find((u) => u.status === "COMPLETED");
      assert.ok(completedUpdate);

      assert.equal(deliveryLogs.length, 1);
      assert.equal(deliveryLogs[0].status, "SENT");
      assert.equal(deliveryLogs[0].smtp_message_id, "msg_12345");
      assert.equal(deliveryLogs[0].subject, "OTP Code");
    } finally {
      mailer.sendOtp = originalSendOtp;
    }
  });

  it("queueEmailJob() handles enqueue error gracefully", async () => {
    mockAdminError = new Error("Database connection error");

    const result = await queueEmailJob("sendOtp", "cadet@sbu.ac.in", { otpCode: "123456" });

    assert.equal(result.success, false);
    assert.equal(result.error, "Failed to enqueue email job");
  });

  it("queueEmailJobsBatch() handles batch enqueue error gracefully", async () => {
    mockAdminError = new Error("Batch insert constraint violation");

    const jobsToQueue = [
      {
        jobType: "sendOtp",
        recipient: "cadet1@sbu.ac.in",
        payload: { otpCode: "111111" },
      },
      {
        jobType: "sendOtp",
        recipient: "cadet2@sbu.ac.in",
        payload: { otpCode: "222222" },
      },
    ];

    const result = await queueEmailJobsBatch(jobsToQueue);

    assert.equal(result.success, false);
    assert.equal(result.enqueuedCount, 0);
    assert.equal(result.error, "Failed to batch enqueue email jobs");
  });
});
