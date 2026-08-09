import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";

/**
 * POST /api/v1/auth/otp/request
 * Issues a 6-digit one-time code for the "forgot password" flow.
 *
 * The response never reveals whether an account exists (no enumeration): an
 * unknown identifier gets the same generic acknowledgement.
 */
export const Route = createFileRoute("/api/v1/auth/otp/request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const identifier = String(body.identifier || "").trim();
        const userType = body.userType === "admin" ? "admin" : "cadet";

        if (!identifier) {
          return json(
            {
              success: false,
              error: "Enter your SBU Roll No, regimental number, email or mobile.",
              code: "OTP_VALIDATION_FAILED",
            },
            400,
          );
        }

        const { issueOtp, maskDestination, OTP_TTL_MINUTES } =
          await import("@backend/lib/auth-otp.server");

        let destination = "";
        let known = false;

        if (userType === "admin") {
          if (["admin", "ano.sbu", "admin@sbu.ac.in"].includes(identifier.toLowerCase())) {
            destination = "admin@sbu.ac.in";
            known = true;
          }
        } else {
          const { findCadetByIdentifier } = await import("@backend/lib/cadet-registry.server");
          const cadet = await findCadetByIdentifier(identifier);
          if (cadet) {
            destination = cadet.email || cadet.mobile || "";
            known = true;
          }
        }

        const generic = {
          success: true,
          message: `If this account exists on the unit register, a verification code valid for ${OTP_TTL_MINUTES} minutes has been issued.`,
          data: {
            issued: false,
            destination: "",
            expiresAt: null as string | null,
            ttlMinutes: OTP_TTL_MINUTES,
            delivery: "none",
            code: null as string | null,
          },
        };

        if (!known) return json(generic);

        try {
          const issued = await issueOtp(identifier, destination);
          if (!issued) {
            return json(
              {
                success: false,
                error: "A code was just sent. Please wait a moment before requesting another.",
                code: "OTP_THROTTLED",
              },
              429,
            );
          }

          return json({
            success: true,
            message: `Verification code issued for ${maskDestination(destination)}.`,
            data: {
              issued: true,
              destination: maskDestination(destination),
              expiresAt: issued.expiresAt,
              ttlMinutes: OTP_TTL_MINUTES,
              // Email/SMS dispatch is not provisioned for this unit yet, so the
              // code is returned to the requesting screen instead.
              delivery: "onscreen",
              code: issued.code,
            },
          });
        } catch {
          return json(
            { success: false, error: "Could not issue a verification code. Try again." },
            500,
          );
        }
      },
    },
  },
});
