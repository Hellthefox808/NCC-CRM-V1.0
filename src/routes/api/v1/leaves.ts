import { createFileRoute } from "@tanstack/react-router";
import {
  addMemoryLeave,
  getMemoryLeaves,
  json,
  updateMemoryLeave,
  type LeaveRecord,
} from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/leaves")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { bearer } = await import("@backend/lib/cadet-registry.server");
        const token = bearer(request);
        if (!token) return json({ success: false, error: "Authentication required" }, 401);

        const url = new URL(request.url);
        const cadetId = url.searchParams.get("cadetId") || undefined;
        const leaves = getMemoryLeaves(cadetId);

        return json({
          success: true,
          data: { leaves, count: leaves.length },
        });
      },

      POST: async ({ request }) => {
        const { bearer } = await import("@backend/lib/cadet-registry.server");
        const token = bearer(request);
        if (!token) return json({ success: false, error: "Authentication required" }, 401);

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
