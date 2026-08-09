import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/cadets/me")({
  server: {
    handlers: {
      /**
       * Returns the signed-in cadet's own record from the unit register.
       * Sensitive identifiers (Aadhaar, bank account) stay masked.
       */
      GET: async ({ request }) => {
        const { cadetByEnrollmentId, mapCadet, requireCadetSession } =
          await import("@backend/lib/cadet-registry.server");

        const gate = await requireCadetSession(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const url = new URL(request.url);
        // Officers may inspect a specific cadet's dashboard view.
        const requested = gate.role === "admin" ? url.searchParams.get("enrollmentId") : null;
        const enrollmentId = requested || gate.enrollmentId;

        if (!enrollmentId) {
          return json(
            {
              success: false,
              error: "This login is not linked to a cadet record in the unit register.",
              code: "CADET_NOT_LINKED",
            },
            404,
          );
        }

        try {
          const row = await cadetByEnrollmentId(enrollmentId);
          if (!row) {
            return json({ success: false, error: "Cadet record not found." }, 404);
          }
          return json({ success: true, data: { cadet: mapCadet(row) } });
        } catch {
          return json({ success: false, error: "Database error fetching cadet record" }, 500);
        }
      },
    },
  },
});
