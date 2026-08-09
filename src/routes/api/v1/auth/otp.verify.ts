import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";

/**
 * POST /api/v1/auth/otp/verify
 * Verifies a one-time code. When `newPassword` is supplied, the code is
 * consumed and the portal password is (re)set for that identifier.
 */
export const Route = createFileRoute("/api/v1/auth/otp/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const identifier = String(body.identifier || "").trim();
        const code = String(body.code || "").trim();
        const newPassword = body.newPassword ? String(body.newPassword) : "";

        if (!identifier || !/^\d{6}$/.test(code)) {
          return json(
            {
              success: false,
              error: "Enter the 6-digit verification code.",
              code: "OTP_VALIDATION_FAILED",
            },
            400,
          );
        }
        if (newPassword && newPassword.length < 8) {
          return json(
            {
              success: false,
              error: "New password must be at least 8 characters.",
              code: "WEAK_PASSWORD",
            },
            400,
          );
        }

        try {
          const { verifyOtp, setPortalPassword } = await import("@backend/lib/auth-otp.server");
          const result = await verifyOtp(identifier, code);
          if (!result.ok) {
            return json({ success: false, error: result.error, code: result.code }, 400);
          }

          if (newPassword) {
            await setPortalPassword(identifier, newPassword);
            return json({
              success: true,
              message: "Password reset successfully. Sign in with your new password.",
              data: { verified: true, passwordUpdated: true },
            });
          }

          return json({
            success: true,
            message: "Code verified.",
            data: { verified: true, passwordUpdated: false },
          });
        } catch {
          return json({ success: false, error: "Could not verify the code. Try again." }, 500);
        }
      },
    },
  },
});
