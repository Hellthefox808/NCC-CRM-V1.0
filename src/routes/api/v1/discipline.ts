import { createFileRoute } from "@tanstack/react-router";
import {
  addMemoryDiscipline,
  getMemoryDiscipline,
  json,
  type DisciplineRecord,
} from "@backend/lib/ncc-db";
import { extractClientIp } from "@backend/lib/validation.schemas";

const ALLOWED_DISCIPLINE_TYPES = ["Appreciation", "Reward", "Warning", "Punishment"] as const;
type DisciplineType = (typeof ALLOWED_DISCIPLINE_TYPES)[number];

export const Route = createFileRoute("/api/v1/discipline")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { requireOfficer, requireCadetSession } =
          await import("@backend/lib/cadet-registry.server");

        const url = new URL(request.url);
        const requestedCadetId = url.searchParams.get("cadetId")?.trim() || undefined;

        // 1. Officer authentication check (battalion-wide visibility)
        const officerGate = await requireOfficer(request);
        if (officerGate.ok) {
          const records = getMemoryDiscipline(requestedCadetId);
          return json({
            success: true,
            data: { records, count: records.length },
          });
        }

        // 2. Cadet session authentication check
        const cadetGate = await requireCadetSession(request);
        if (!cadetGate.ok) {
          return json({ success: false, error: "Authentication required" }, 401);
        }

        // 3. IDOR Protection: Cadets may only query their own disciplinary records
        const ownCadetId = cadetGate.cadetId || cadetGate.enrollmentId || "";
        if (requestedCadetId && requestedCadetId !== ownCadetId) {
          const { recordSecurityEvent } = await import("@backend/services/ids/ids.service");
          recordSecurityEvent({
            eventType: "IDOR_ATTEMPT",
            actorId: ownCadetId || "unknown_cadet",
            actorIp: extractClientIp(request),
            details: { target: requestedCadetId, resource: "discipline" },
          });
          return json({ success: false, error: "Access denied" }, 403);
        }

        const records = getMemoryDiscipline(ownCadetId || undefined);
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
        const rawCadetId = typeof body.cadetId === "string" ? body.cadetId.trim() : "";
        const rawTitle = typeof body.title === "string" ? body.title.trim() : "";
        const rawType = typeof body.type === "string" ? body.type.trim() : "Appreciation";
        const rawRemarks = typeof body.remarks === "string" ? body.remarks.trim() : "";
        const rawDate = typeof body.date === "string" ? body.date.trim() : "";
        const rawCadetName = typeof body.cadetName === "string" ? body.cadetName.trim() : "Cadet";

        if (!rawCadetId || !rawTitle) {
          return json({ success: false, error: "Cadet ID and title are required." }, 400);
        }

        if (rawCadetId.length > 50 || rawTitle.length > 200 || rawRemarks.length > 1000) {
          return json(
            { success: false, error: "Input exceeds maximum permitted field length." },
            400,
          );
        }

        const sanitizedType: DisciplineType = (
          ALLOWED_DISCIPLINE_TYPES.includes(rawType as DisciplineType) ? rawType : "Appreciation"
        ) as DisciplineType;

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const date = dateRegex.test(rawDate) ? rawDate : new Date().toISOString().split("T")[0];

        const newRecord = addMemoryDiscipline({
          cadetId: rawCadetId,
          cadetName: rawCadetName.slice(0, 100) || "Cadet",
          type: sanitizedType,
          title: rawTitle,
          date,
          remarks: rawRemarks,
          officerName: gate.officerName || "Capt. Dr. Animesh Roy (ANO)",
        });

        // Audit log event
        const { logAuditEvent } = await import("@backend/lib/audit-log.server");
        logAuditEvent({
          actor: gate.officerName || "Officer",
          action: "cadet_modified",
          target: `discipline:${newRecord.id}`,
          ip: extractClientIp(request),
          metadata: { cadetId: rawCadetId, type: sanitizedType, title: rawTitle },
        });

        return json({ success: true, data: { record: newRecord } }, 201);
      },
    },
  },
});
