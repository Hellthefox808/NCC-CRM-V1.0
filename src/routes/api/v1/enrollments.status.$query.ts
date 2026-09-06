import { createFileRoute } from "@tanstack/react-router";
import {
  getAdmin,
  json,
  mapToCadetRecord,
  maskPublicRecord,
  sanitizePostgrestQuery,
} from "@backend/lib/ncc-db";
import { getOrSetCache } from "@backend/lib/cache.server";

export const Route = createFileRoute("/api/v1/enrollments/status/$query")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        // Anti-enumeration Rate Limiting: Max 20 queries per minute per IP
        const { extractClientIp } = await import("@backend/lib/validation.schemas");
        const clientIp = extractClientIp(request);
        const { checkRateLimitAsync } = await import("@backend/lib/rate-limiter.server");
        const rateLimit = await checkRateLimitAsync(`status_query:${clientIp}`, {
          maxAttempts: 20,
          windowMs: 60 * 1000,
        });

        if (!rateLimit.allowed) {
          return json(
            {
              success: false,
              error: "Too many tracking lookups. Please wait a moment before trying again.",
              code: "RATE_LIMIT_EXCEEDED",
              retryAfter: Math.ceil(rateLimit.retryAfterMs / 1000),
            },
            429,
          );
        }

        const rawQuery = decodeURIComponent(params.query || "").trim();
        const query = sanitizePostgrestQuery(rawQuery);
        if (!query) {
          return json(
            { success: false, error: "Search query required.", code: "RECORD_NOT_FOUND" },
            404,
          );
        }

        const cacheKey = `ncc:enrollment:status:${query.toLowerCase()}`;

        try {
          const cachedResult = await getOrSetCache(cacheKey, 30, async () => {
            const admin = await getAdmin();
            const { data, error } = await admin
              .from("cadet_enrollments")
              .select("*")
              .or(
                [
                  `id.ilike.${query}`,
                  `aadhaar_number.eq.${query}`,
                  `enrollment_no.ilike.${query}`,
                  `mobile.eq.${query}`,
                  `sbu_roll_no.ilike.${query}`,
                ].join(","),
              )
              .limit(1)
              .maybeSingle();

            if (error) throw error;
            if (!data) return null;
            return maskPublicRecord(mapToCadetRecord(data));
          });

          if (!cachedResult) {
            return json(
              {
                success: false,
                error: "No NCC Enrollment record found matching query.",
                code: "RECORD_NOT_FOUND",
              },
              404,
            );
          }

          return json(
            {
              success: true,
              data: { record: cachedResult },
            },
            200,
            { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" },
          );
        } catch {
          return json({ success: false, error: "Database error" }, 500);
        }
      },
    },
  },
});
