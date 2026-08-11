import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import {
  otpRequestSchema,
  validateRequestBody,
  extractClientIp,
} from "@backend/lib/validation.schemas";

/**
 * POST /api/v1/auth/otp/request
 * Issues a 6-digit one-time code for the "forgot password" flow.
 * Enhanced with comprehensive input validation and security monitoring.
 */
export const Route = createFileRoute("/api/v1/auth/otp/request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Validate request body with Zod schema
        const rawBody = await request.json().catch(() => ({}));
        const validation = validateRequestBody(otpRequestSchema, rawBody, "OTP request");

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

        const { identifier, userType } = validation.data;
        const clientIp = extractClientIp(request);

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

          // Enqueue OTP email job asynchronously
          if (destination.includes("@")) {
            const { queueEmailJob } = await import("@backend/services/queue/queue.service");
            await queueEmailJob("sendOtp", destination, {
              recipientName: identifier,
              otpCode: issued.code,
              ttlMinutes: OTP_TTL_MINUTES,
            });
          }

          return json({
            success: true,
            message: `Verification code issued for ${maskDestination(destination)}. Please check your email.`,
            data: {
              issued: true,
              destination: maskDestination(destination),
              expiresAt: issued.expiresAt,
              ttlMinutes: OTP_TTL_MINUTES,
              delivery: destination.includes("@") ? "email" : "sms",
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
