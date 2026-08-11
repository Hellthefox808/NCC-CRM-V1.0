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
        const clientIp = extractClientIp(request);

        try {
          const { verifyOtp, setPortalPassword } = await import("@backend/lib/auth-otp.server");
          const { logAuditEvent } = await import("@backend/lib/audit-log.server");

          const result = await verifyOtp(identifier, code);
          if (!result.ok) {
            // Log failed OTP verification attempt
            logAuditEvent({
              actor: identifier,
              action: "otp_failed",
              target: "password_reset",
              ip: clientIp,
              metadata: {
                reason: result.code || "unknown",
                error: result.error,
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
            target: "password_reset",
            ip: clientIp,
            metadata: { passwordUpdate: !!newPassword },
          });

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
              message: "Password reset successfully. Sign in with your new password.",
              data: { verified: true, passwordUpdated: true },
            });
          }

          return json({
            success: true,
            message: "Code verified successfully.",
            data: { verified: true, passwordUpdated: false },
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
