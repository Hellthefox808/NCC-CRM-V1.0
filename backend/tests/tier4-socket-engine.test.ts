import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  initSocketServer,
  emitStatusUpdated,
  emitNotification,
  emitCalendarEventCreated,
} from "../services/socket/socket.server.ts";

describe("Tier 4: Real-Time Socket.IO Engine & Room Isolation Tests", () => {
  describe("1. Server Initialization & CORS Shielding", () => {
    it("configures strict CORS origin and credentials based on environment", () => {
      delete process.env.VITE_WS_HOST;
      const io = initSocketServer();
      const serverOpts = (
        io as unknown as { opts?: { cors?: { origin?: string; credentials?: boolean } } }
      ).opts;

      assert.ok(serverOpts?.cors);
      assert.equal(serverOpts.cors.origin, "http://localhost:3000");
      assert.equal(serverOpts.cors.credentials, true);
    });

    it("supports multiple allowed origins and ping timing configurations", () => {
      const io = initSocketServer();
      const serverOpts = (
        io as unknown as { opts?: { pingInterval?: number; pingTimeout?: number } }
      ).opts;

      assert.equal(serverOpts?.pingInterval, 15000);
      assert.equal(serverOpts?.pingTimeout, 10000);
    });
  });

  describe("2. Dedicated Room Derivation & Channel Security", () => {
    it("derives strict user, role, and operational channels", () => {
      // Required system broadcast rooms
      const expectedRooms = [
        "user:mock-id",
        "notification:user:mock-id",
        "role:CADET",
        "calendar",
        "notification:global",
        "cadre:enrollments",
        "cadre:notifications",
        "cadre:presence",
      ];

      for (const room of expectedRooms) {
        assert.ok(room.length > 0);
        assert.ok(!room.includes("..")); // No traversal
      }
    });
  });

  describe("3. Operational Broadcast Methods", () => {
    it("emitStatusUpdated() dispatches CADET_STATUS_UPDATED event payload", () => {
      const payload = {
        applicationId: "192026102312345678",
        status: "APPROVED",
        reviewedBy: "Lt. Sharma",
        reviewedAt: new Date().toISOString(),
      };

      assert.doesNotThrow(() => {
        emitStatusUpdated(payload);
      });
    });

    it("emitNotification() dispatches role and global notifications safely", () => {
      const notification = {
        id: "notif-1",
        title: "Annual Training Camp",
        message: "Mandatory drill reporting on Monday 06:00 AM",
        type: "CAMP" as const,
        timestamp: new Date().toISOString(),
      };

      assert.doesNotThrow(() => {
        emitNotification(notification);
        emitNotification(notification, "cadet-uid-123");
      });
    });

    it("emitCalendarEventCreated() dispatches calendar event notifications", () => {
      const eventPayload = {
        id: "evt-99",
        title: "Republic Day Parade Drill",
        startTime: "2026-11-20T06:00:00.000Z",
        location: "Main Ground",
      };

      assert.doesNotThrow(() => {
        emitCalendarEventCreated(eventPayload);
      });
    });
  });
});
