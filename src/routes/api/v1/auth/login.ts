import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const { userType, username, password, email } = body as Record<string, string | undefined>;

        if (!userType || (!username && !email) || !password) {
          return json(
            {
              success: false,
              error: "Invalid request payload. Credentials required.",
              code: "AUTH_VALIDATION_FAILED",
            },
            400,
          );
        }

        const identifier = String(username || email || "").trim().toLowerCase();

        // ── Rate Limiting ──────────────────────────────────────────────
        const { checkRateLimit } = await import("@backend/lib/rate-limiter.server");
        const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const rl = checkRateLimit(`login:${clientIp}:${identifier}`, {
          maxAttempts: 5,
          windowMs: 15 * 60 * 1000,
        });
        if (!rl.allowed) {
          return json(
            {
              success: false,
              error: "Too many login attempts. Please try again later.",
              code: "RATE_LIMIT_EXCEEDED",
            },
            429,
          );
        }

        let authenticated = false;
        let userName = "";
        let userEmail: string = email || username || "";
        let role = "cadet";

        let cadetEnrollmentId: string | null = null;
        let cadetRecord: Record<string, unknown> | null = null;

        // All authentication flows through stored credentials only.
        // No hardcoded passwords — every account must set a portal password.
        const { checkPortalPassword } = await import("@backend/lib/auth-otp.server");
        const storedMatch = await checkPortalPassword(identifier, String(password));

        if (storedMatch === false) {
          const { logAuditEvent } = await import("@backend/lib/audit-log.server");
          logAuditEvent({
            actor: identifier,
            action: "login_failure",
            target: userType || "unknown",
            ip: clientIp,
            metadata: { reason: "invalid_password" },
          });
          return json(
            {
              success: false,
              error: "Invalid email, username, or password.",
              code: "INVALID_CREDENTIALS",
            },
            401,
          );
        }

        if (userType === "admin") {
          // Admin authentication: requires a stored portal password.
          if (storedMatch === true) {
            authenticated = true;
            userName = "Associate NCC Officer (ANO)";
            userEmail = identifier.includes("@") ? identifier : "admin@sbu.ac.in";
            role = "admin";
          }
        } else if (userType === "cadet") {
          if (storedMatch === true) {
            // Cadet with a stored password — verified.
            authenticated = true;
            userName = username || email || "SBU Cadet";
            role = "cadet";
          } else if (storedMatch === null) {
            // First-time cadet login: no stored password yet.
            // Allowed only if the identifier matches a registered cadet record
            // and the submitted password meets minimum length.
            if (String(password).length >= 6) {
              const { findCadetByIdentifier } = await import("@backend/lib/cadet-registry.server");
              const foundCadet = await findCadetByIdentifier(identifier);
              if (foundCadet) {
                authenticated = true;
                userName = (foundCadet["full_name"] as string) || username || email || "SBU Cadet";
                role = "cadet";
                cadetRecord = foundCadet;
                cadetEnrollmentId = (foundCadet["enrollment_id"] as string) || null;
                userEmail = (foundCadet["email"] as string) || userEmail;
              }
            }
          }

          // Link session to cadet record if not already resolved
          if (authenticated && !cadetRecord) {
            const { findCadetByIdentifier } = await import("@backend/lib/cadet-registry.server");
            cadetRecord = await findCadetByIdentifier(identifier);
            if (cadetRecord) {
              cadetEnrollmentId = (cadetRecord["enrollment_id"] as string) || null;
              userName = (cadetRecord["full_name"] as string) || userName;
              userEmail = (cadetRecord["email"] as string) || userEmail;
            }
          }
        }

        if (!authenticated) {
          const { logAuditEvent } = await import("@backend/lib/audit-log.server");
          logAuditEvent({
            actor: identifier,
            action: "login_failure",
            target: userType || "unknown",
            ip: clientIp,
            metadata: { reason: "authentication_failed" },
          });
          return json(
            {
              success: false,
              error: "Invalid email, username, or password.",
              code: "INVALID_CREDENTIALS",
            },
            401,
          );
        }

        try {
          const admin = await getAdmin();
          const randomBytes = new Uint8Array(32);
          crypto.getRandomValues(randomBytes);
          const token = `sess_${Array.from(randomBytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")}`;
          const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

          const { data, error } = await admin
            .from("app_sessions")
            .insert({
              token,
              email: userEmail,
              display_name: userName,
              role,
              cadet_enrollment_id: cadetEnrollmentId,
              expires_at: expiresAt.toISOString(),
            })
            .select("id")
            .single();

          if (error) throw error;

          // ── Audit: successful login ──────────────────────────────────
          const { logAuditEvent } = await import("@backend/lib/audit-log.server");
          logAuditEvent({
            actor: userEmail,
            action: "login_success",
            target: role,
            ip: clientIp,
            metadata: { sessionId: data.id },
          });

          const cookieHeader = `ncc_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${8 * 3600}; Secure`;

          return json(
            {
              success: true,
              message: "Authentication successful.",
              data: {
                token,
                userType,
                user: {
                  id: data.id,
                  name: userName,
                  email: userEmail,
                  role: userType,
                  enrollmentId: cadetEnrollmentId,
                  registered: Boolean(cadetRecord),
                },
                expiresAt: expiresAt.toISOString(),
              },
            },
            200,
            { "Set-Cookie": cookieHeader },
          );
        } catch {
          return json({ success: false, error: "Authentication system error. Please try again." }, 500);
        }
      },
    },
  },
});
