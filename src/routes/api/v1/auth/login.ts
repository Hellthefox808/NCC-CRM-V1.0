import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import {
  loginRequestSchema,
  validateRequestBody,
  extractClientIp,
} from "@backend/lib/validation.schemas";

export const Route = createFileRoute("/api/v1/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Parse and validate request body with comprehensive schema validation
        const rawBody = await request.json().catch(() => ({}));
        const validation = validateRequestBody(loginRequestSchema, rawBody, "login request");

        if (!validation.success) {
          return json(
            {
              success: false,
              error: validation.error,
              code: "AUTH_VALIDATION_FAILED",
              details: validation.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
              })),
            },
            400,
          );
        }

        const { userType, username, email, password } = validation.data;

        // Normalize identifier for consistent processing
        const identifier = String(username || email || "")
          .trim()
          .toLowerCase();

        // Extract and validate client IP for rate limiting and audit logging
        const clientIp = extractClientIp(request);

        // ── Rate Limiting ──────────────────────────────────────────────
        const { checkRateLimit } = await import("@backend/lib/rate-limiter.server");
        const rl = checkRateLimit(`login:${clientIp}:${identifier}`, {
          maxAttempts: 5,
          windowMs: 15 * 60 * 1000, // 15 minutes
        });

        if (!rl.allowed) {
          // Log rate limit violation for security monitoring
          const { logAuditEvent } = await import("@backend/lib/audit-log.server");
          logAuditEvent({
            actor: identifier,
            action: "login_failure",
            target: userType,
            ip: clientIp,
            metadata: {
              reason: "rate_limit_exceeded",
              attempts: rl.remaining,
              retryAfter: Math.ceil(rl.retryAfterMs / 1000),
            },
          });

          return json(
            {
              success: false,
              error: "Too many login attempts. Please try again later.",
              code: "RATE_LIMIT_EXCEEDED",
              retryAfter: Math.ceil(rl.retryAfterMs / 1000),
            },
            429,
          );
        }

        let authenticated = false;
        let userName = "";
        let userEmail: string = email || username || "";
        let role = "cadet";

        const cadetEnrollmentId: string | null = null;
        const cadetRecord: Record<string, unknown> | null = null;

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
            // Cadet with a verified stored password.
            authenticated = true;
            userName = username || email || "SBU Cadet";
            role = "cadet";
          } else if (storedMatch === null) {
            // Unactivated account — require activation / password setup via OTP first.
            const { logAuditEvent } = await import("@backend/lib/audit-log.server");
            logAuditEvent({
              actor: identifier,
              action: "login_failure",
              target: "cadet",
              ip: clientIp,
              metadata: { reason: "account_not_activated" },
            });
            return json(
              {
                success: false,
                error:
                  "Account not activated. Please use 'Forgot Password / Activate Account' to set up your password.",
                code: "ACCOUNT_NOT_ACTIVATED",
              },
              401,
            );
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
          return json(
            { success: false, error: "Authentication system error. Please try again." },
            500,
          );
        }
      },
    },
  },
});
