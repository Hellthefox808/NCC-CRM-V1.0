import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { EnterpriseDataPlatform, DataPlatformError, dataCache } from "../services/dataPlatform.ts";
import { getMongoClient } from "../lib/mongodb.server.ts";

describe("Enterprise Data Platform & Data Storage Unit Tests", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    EnterpriseDataPlatform.clearCache();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("DataPlatformError initializes with code, status, and message", () => {
    const err = new DataPlatformError("Unauthorized access", "AUTH_FORBIDDEN", 403, "req-123");
    assert.equal(err.message, "Unauthorized access");
    assert.equal(err.code, "AUTH_FORBIDDEN");
    assert.equal(err.status, 403);
    assert.equal(err.requestId, "req-123");
    assert.equal(err.name, "DataPlatformError");
  });

  it("getMongoClient() throws descriptive error when MONGODB_URI is not set", async () => {
    const originalUri = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;
    try {
      await assert.rejects(
        async () => {
          await getMongoClient();
        },
        {
          name: "Error",
          message:
            "MONGODB_URI is not set in environment variables. Please check your .env configuration.",
        },
      );
    } finally {
      if (originalUri !== undefined) {
        process.env.MONGODB_URI = originalUri;
      }
    }
  });

  it("EnterpriseDataPlatform.getOnboardingProgress() requests correct endpoint and parses progress", async () => {
    const mockProgress = {
      cadetId: "cadet_123",
      accountStatus: "PENDING_ONBOARDING",
      isComplete: false,
      completedStepsCount: 2,
      totalStepsCount: 5,
      progressPercentage: 40,
      checklist: [
        {
          id: "profile_completed",
          name: "Profile",
          description: "Done",
          completed: true,
          required: true,
        },
        {
          id: "contact_verified",
          name: "Contact",
          description: "Done",
          completed: true,
          required: true,
        },
      ],
      nextStep: {
        id: "documents_verified",
        name: "Documents",
        description: "Pending",
        completed: false,
        required: true,
      },
    };

    let requestedUrl = "";
    globalThis.fetch = mock.fn(async (input: RequestInfo | URL) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({ success: true, data: mockProgress }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const res = await EnterpriseDataPlatform.getOnboardingProgress("cadet_123");
    assert.equal(res.success, true);
    assert.equal(res.data?.cadetId, "cadet_123");
    assert.equal(res.data?.progressPercentage, 40);
    assert.ok(requestedUrl.includes("/api/v1/onboarding?cadetId=cadet_123"));
  });

  it("EnterpriseDataPlatform.updateOnboardingStep() sends PATCH to specific step", async () => {
    let capturedMethod = "";
    let capturedBody = "";
    let requestedUrl = "";

    globalThis.fetch = mock.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      requestedUrl = String(input);
      capturedMethod = init?.method || "GET";
      capturedBody = String(init?.body || "");
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            cadetId: "cadet_999",
            isComplete: true,
            progressPercentage: 100,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const res = await EnterpriseDataPlatform.updateOnboardingStep("orientation_completed", {
      completed: true,
      cadetId: "cadet_999",
    });

    assert.equal(res.success, true);
    assert.equal(capturedMethod, "PATCH");
    assert.ok(requestedUrl.includes("/api/v1/onboarding/orientation_completed"));
    const parsedBody = JSON.parse(capturedBody);
    assert.equal(parsedBody.completed, true);
    assert.equal(parsedBody.cadetId, "cadet_999");
  });

  it("EnterpriseDataPlatform.requestOtp() and verifyOtp() dispatch to authentication endpoints", async () => {
    const calls: { url: string; body: Record<string, unknown> }[] = [];

    globalThis.fetch = mock.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({
        url: String(input),
        body: JSON.parse(String(init?.body || "{}")),
      });
      return new Response(
        JSON.stringify({
          success: true,
          data: { verified: true, message: "OTP valid" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    await EnterpriseDataPlatform.requestOtp({
      identifier: "cadet@sbu.ac.in",
      purpose: "onboarding",
    });

    await EnterpriseDataPlatform.verifyOtp({
      identifier: "cadet@sbu.ac.in",
      otp: "123456",
      purpose: "onboarding",
    });

    assert.equal(calls.length, 2);
    assert.ok(calls[0].url.includes("/api/v1/auth/otp/request"));
    assert.equal(calls[0].body.identifier, "cadet@sbu.ac.in");
    assert.equal(calls[0].body.purpose, "onboarding");

    assert.ok(calls[1].url.includes("/api/v1/auth/otp/verify"));
    assert.equal(calls[1].body.otp, "123456");
  });

  it("dataCache dedupes in-flight queries and caches results", async () => {
    let computeCalls = 0;
    const compute = async () => {
      computeCalls++;
      return { uptimeSeconds: 3600, totalRequests: 42 };
    };

    // Fire 3 simultaneous deduplicated calls
    const [r1, r2, r3] = await Promise.all([
      dataCache.deduplicate("test_metric_key", compute),
      dataCache.deduplicate("test_metric_key", compute),
      dataCache.deduplicate("test_metric_key", compute),
    ]);

    assert.equal(r1.uptimeSeconds, 3600);
    assert.equal(r2.uptimeSeconds, 3600);
    assert.equal(r3.uptimeSeconds, 3600);
    assert.equal(computeCalls, 1);
  });
});
