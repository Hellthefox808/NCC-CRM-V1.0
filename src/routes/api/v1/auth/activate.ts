import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import crypto from "crypto";

export const Route = createFileRoute("/api/v1/auth/activate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { token?: string };
        const rawToken = body.token?.trim();

        if (!rawToken) {
          return json({ success: false, error: "Activation token is required." }, 400);
        }

        try {
          const admin = await getAdmin();
          const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

          // 1. Try account_activation_tokens table first
          const { data: tokRecord } = await admin
            .from("account_activation_tokens")
            .select("*")
            .eq("token_hash", tokenHash)
            .maybeSingle();

          if (tokRecord) {
            if (tokRecord.used_at) {
              return json(
                {
                  success: false,
                  error: "This activation link has already been used.",
                  code: "TOKEN_ALREADY_USED",
                },
                400,
              );
            }
            if (new Date(tokRecord.expires_at) < new Date()) {
              return json(
                {
                  success: false,
                  error: "This activation link has expired.",
                  code: "TOKEN_EXPIRED",
                },
                400,
              );
            }
            const { data: user } = await admin
              .from("cadet_users")
              .select("*")
              .eq("id", tokRecord.user_id)
              .maybeSingle();

            const { data: app } = user?.application_id
              ? await admin
                  .from("cadet_enrollments")
                  .select("full_name, sbu_course")
                  .eq("id", user.application_id)
                  .maybeSingle()
              : { data: null };

            return json({
              success: true,
              valid: true,
              data: {
                userId: user?.id || tokRecord.user_id,
                username: user?.cadet_id || user?.email || "NCC Cadet",
                cadetId: user?.cadet_id || "",
                email: user?.email || "",
                userType: "Applicant / Cadet",
                fullName: app?.full_name || "Cadet",
                sbuCourse: app?.sbu_course || "SBU Course",
              },
            });
          }

          // 2. Fallback to auth_otp_codes tokens (issued via issueActivationToken)
          const { verifyActivationToken } = await import("@backend/lib/auth-otp.server");
          const verifyResult = await verifyActivationToken(rawToken);

          if (!verifyResult.ok) {
            return json(
              {
                success: false,
                error: verifyResult.error || "Invalid or expired activation link.",
                code: verifyResult.code || "INVALID_TOKEN",
              },
              400,
            );
          }

          const identifier = verifyResult.identifier || "";

          // Resolve cadet or admin details
          const { data: cred } = await admin
            .from("app_credentials")
            .select("identifier, email, role")
            .eq("identifier", identifier)
            .maybeSingle();

          const userType =
            cred?.role === "ANO" || cred?.role === "ADMIN" ? "ANO Officer" : "Applicant / Cadet";

          return json({
            success: true,
            valid: true,
            data: {
              username: identifier.toUpperCase(),
              email: cred?.email || identifier,
              userType,
              fullName: identifier.toUpperCase(),
            },
          });
        } catch (err: unknown) {
          console.error("[Activation Verification Error]", err);
          const errorMsg = err instanceof Error ? err.message : "Failed to verify activation token";
          return json({ success: false, error: errorMsg }, 500);
        }
      },
    },
  },
});
