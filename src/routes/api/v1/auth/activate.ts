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
          const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
          const admin = await getAdmin();

          // Fetch activation token
          const { data: tokRecord, error: tokErr } = await admin
            .from("account_activation_tokens")
            .select("*")
            .eq("token_hash", tokenHash)
            .single();

          if (tokErr || !tokRecord) {
            return json(
              {
                success: false,
                error: "Invalid or expired activation link.",
                code: "INVALID_TOKEN",
              },
              400,
            );
          }

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
                error: "This activation link has expired. Please contact ANO for a new link.",
                code: "TOKEN_EXPIRED",
              },
              400,
            );
          }

          // Fetch user details
          const { data: user } = await admin
            .from("cadet_users")
            .select("*")
            .eq("id", tokRecord.user_id)
            .single();

          if (!user) {
            return json({ success: false, error: "Associated cadet user record not found." }, 404);
          }

          // Fetch enrollment details
          const { data: app } = await admin
            .from("cadet_enrollments")
            .select("full_name, sbu_course")
            .eq("id", user.application_id)
            .maybeSingle();

          return json({
            success: true,
            valid: true,
            data: {
              userId: user.id,
              cadetId: user.cadet_id,
              email: user.email,
              fullName: app?.full_name || "Cadet",
              sbuCourse: app?.sbu_course || "SBU Course",
            },
          });
        } catch (err: any) {
          console.error("[Activation Verification Error]", err);
          return json(
            { success: false, error: err?.message || "Failed to verify activation token" },
            500,
          );
        }
      },
    },
  },
});
