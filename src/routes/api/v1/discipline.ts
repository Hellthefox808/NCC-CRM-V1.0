import { createFileRoute } from "@tanstack/react-router";
import {
  addMemoryDiscipline,
  getMemoryDiscipline,
  json,
  type DisciplineRecord,
} from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/discipline")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { bearer } = await import("@backend/lib/cadet-registry.server");
        const token = bearer(request);
        if (!token) return json({ success: false, error: "Authentication required" }, 401);

        const url = new URL(request.url);
        const cadetId = url.searchParams.get("cadetId") || undefined;
        const records = getMemoryDiscipline(cadetId);

        return json({
          success: true,
          data: { records, count: records.length },
        });
      },

      POST: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const cadetId = typeof body.cadetId === "string" ? body.cadetId : "";
        const title = typeof body.title === "string" ? body.title : "";

        if (!cadetId || !title) {
          return json({ success: false, error: "Cadet ID and title are required." }, 400);
        }

        const newRecord = addMemoryDiscipline({
          cadetId,
          cadetName: (body.cadetName as string) || "Cadet",
          type:
            (body.type as "Appreciation" | "Reward" | "Warning" | "Punishment") || "Appreciation",
          title,
          date: (body.date as string) || new Date().toISOString().split("T")[0],
          remarks: (body.remarks as string) || "",
          officerName: (body.officerName as string) || "Capt. Dr. Animesh Roy (ANO)",
        });
        return json({ success: true, data: { record: newRecord } }, 201);
      },
    },
  },
});
