import { createFileRoute } from "@tanstack/react-router";
import {
  addMemoryLeave,
  getMemoryLeaves,
  json,
  updateMemoryLeave,
  type LeaveRecord,
} from "@backend/lib/ncc-db";
import { extractClientIp } from "@backend/lib/validation.schemas";

export const Route = createFileRoute("/api/v1/leaves")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { requireOfficer, requireCadetSession } =
          await import("@backend/lib/cadet-registry.server");

        const url = new URL(request.url);
        const requestedCadetId = url.searchParams.get("cadetId") || undefined;

        // Try officer auth first (full access)
        const officerGate = await requireOfficer(request);
        if (officerGate.ok) {
          const leaves = getMemoryLeaves(requestedCadetId);
          return json({ success: true, data: { leaves, count: leaves.length } });
        }

        // Fall back to cadet session — can only view own records
        const cadetGate = await requireCadetSession(request);
        if (!cadetGate.ok) {
          return json({ success: false, error: "Authentication required" }, 401);
        }

        // IDOR protection: cadets may only query their own records
        const ownCadetId = cadetGate.cadetId ?? undefined;
        if (requestedCadetId && requestedCadetId !== ownCadetId) {
          const { recordSecurityEvent } = await import("@backend/services/ids/ids.service");
          recordSecurityEvent({
            eventType: "IDOR_ATTEMPT",
            actorId: ownCadetId,
            actorIp: extractClientIp(request),
            details: { target: requestedCadetId, resource: "leaves" },
          });
          return json({ success: false, error: "Access denied" }, 403);
        }

        const leaves = getMemoryLeaves(ownCadetId);
        return json({ success: true, data: { leaves, count: leaves.length } });
      },

      POST: async ({ request }) => {
        const { requireCadetSession, requireOfficer } =
          await import("@backend/lib/cadet-registry.server");

        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const cadetId = typeof body.cadetId === "string" ? body.cadetId : "";
        const startDate = typeof body.startDate === "string" ? body.startDate : "";
        const endDate = typeof body.endDate === "string" ? body.endDate : "";

        if (!startDate || !endDate || !cadetId) {
          return json(
            { success: false, error: "Cadet ID, start date, and end date are required." },
            400,
          );
        }

        // Officers can submit on behalf of any cadet
        const officerGate = await requireOfficer(request);
        if (!officerGate.ok) {
          // Cadets can only submit for themselves
          const cadetGate = await requireCadetSession(request);
          if (!cadetGate.ok) {
            return json({ success: false, error: "Authentication required" }, 401);
          }
          if (cadetId !== cadetGate.cadetId) {
            return json({ success: false, error: "Access denied" }, 403);
          }
        }

        const newLeave = addMemoryLeave({
          cadetId,
          cadetName: (body.cadetName as string) || "NCC Cadet",
          category: (body.category as string) || "General",
          startDate,
          endDate,
          reason: (body.reason as string) || "",
        });
        return json({ success: true, data: { leave: newLeave } }, 201);
      },

      PATCH: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const body = (await request.json().catch(() => ({}))) as {
          id?: string;
          status?: "Approved" | "Rejected";
          remarks?: string;
          officerName?: string;
        };

        if (!body.id || !body.status) {
          return json({ success: false, error: "Leave ID and status are required." }, 400);
        }

        const updated = updateMemoryLeave(
          body.id,
          body.status,
          body.remarks || "Updated by ANO Office",
          body.officerName || "Capt. Dr. Animesh Roy (ANO)",
        );

        if (!updated) {
          return json({ success: false, error: "Leave record not found." }, 404);
        }

        return json({ success: true, data: { leave: updated } });
      },
    },
  },
});
