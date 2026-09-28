import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import {
  otpVerifySchema,
  validateRequestBody,
  extractClientIp,
} from "@backend/lib/validation.schemas";

/**
 * POST /api/v1/auth/otp/verify
 * Verifies a one-time code with enhanced validation and security.
 * When `newPassword` is supplied, the code is consumed and the portal
 * password is (re)set for that identifier with strong password enforcement.
 */
export const Route = createFileRoute("/api/v1/auth/otp/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Validate request body with comprehensive schema
        const rawBody = await request.json().catch(() => ({}));
        const validation = validateRequestBody(otpVerifySchema, rawBody, "OTP verification");

        if (!validation.success) {
          return json(
            {
              success: false,
              error: validation.error,
              code: "OTP_VALIDATION_FAILED",
              details: validation.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
              })),
            },
            400,
          );
        }

        const { identifier, code, newPassword } = validation.data;
        const purpose = validation.data.purpose || "password_reset";
        const clientIp = extractClientIp(request);

        try {
          const { verifyOtp, setPortalPassword } = await import("@backend/lib/auth-otp.server");
          const { logAuditEvent } = await import("@backend/lib/audit-log.server");

          const result = await verifyOtp(identifier, code, purpose);
          if (!result.ok) {
            // Log failed OTP verification attempt
            logAuditEvent({
              actor: identifier,
              action: "otp_failed",
              target: purpose,
              ip: clientIp,
              metadata: {
                reason: result.code || "unknown",
                error: result.error,
                purpose,
              },
            });

            return json(
              {
                success: false,
                error: result.error,
                code: result.code,
              },
              400,
            );
          }

          // Log successful OTP verification
          logAuditEvent({
            actor: identifier,
            action: "otp_verified",
            target: purpose,
            ip: clientIp,
            metadata: { passwordUpdate: !!newPassword, purpose },
          });

          // Link to Onboarding: When verifying for onboarding or activation, mark contact_verified in progress
          if (
            purpose === "onboarding" ||
            purpose === "account_activation" ||
            purpose === "verification"
          ) {
            try {
              const { getAdmin } = await import("@backend/lib/ncc-db");
              const admin = await getAdmin();
              const { findCadetByIdentifier } = await import("@backend/lib/cadet-registry.server");
              const cadet = await findCadetByIdentifier(identifier);
              if (cadet) {
                const db = admin as unknown as {
                  from: (table: string) => {
                    select: (cols: string) => {
                      or: (clause: string) => {
                        maybeSingle: () => Promise<{ data: { id: string } | null }>;
                      };
                    };
                    upsert: (
                      record: Record<string, unknown>,
                      opts: { onConflict: string },
                    ) => Promise<unknown>;
                  };
                };
                const { data: user } = await db
                  .from("cadet_users")
                  .select("id")
                  .or(`cadet_id.eq.${cadet.id},email.eq.${cadet.email || ""}`)
                  .maybeSingle();

                if (user?.id) {
                  await db.from("onboarding_progress").upsert(
                    {
                      user_id: user.id,
                      contact_verified: true,
                      updated_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id" },
                  );
                }
              }
            } catch {
              // Resilient non-blocking link
            }
          }

          if (newPassword) {
            await setPortalPassword(identifier, newPassword);

            // Log password reset completion
            logAuditEvent({
              actor: identifier,
              action: "password_reset",
              target: "portal_password",
              ip: clientIp,
            });

            return json({
              success: true,
              message: "Password set successfully. Sign in with your new credentials.",
              data: { verified: true, passwordUpdated: true, purpose },
            });
          }

          return json({
            success: true,
            message: "Code verified successfully.",
            data: { verified: true, passwordUpdated: false, purpose },
          });
        } catch (err) {
          // Log system error
          const { logAuditEvent } = await import("@backend/lib/audit-log.server");
          logAuditEvent({
            actor: identifier,
            action: "otp_failed",
            target: "system_error",
            ip: clientIp,
            metadata: {
              error: err instanceof Error ? err.message : "Unknown error",
            },
          });

          return json(
            {
              success: false,
              error: "Could not verify the code. Please try again.",
            },
            500,
          );
        }
      },
    },
  },
});
