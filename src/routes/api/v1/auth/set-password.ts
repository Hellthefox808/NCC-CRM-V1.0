import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { hashPassword } from "@backend/lib/auth-otp.server";
import { queueEmailJob } from "@backend/services/queue/queue.service";
import crypto from "crypto";

export const Route = createFileRoute("/api/v1/auth/set-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          token?: string;
          password?: string;
        };

        const rawToken = body.token?.trim();
        const password = body.password;

        if (!rawToken || !password) {
          return json(
            { success: false, error: "Activation token and new password are required." },
            400,
          );
        }

        // Validate password against security rules
        const { strongPasswordSchema } = await import("@backend/lib/validation.schemas");
        const passValidation = strongPasswordSchema.safeParse(password);
        if (!passValidation.success) {
          return json(
            {
              success: false,
              error:
                passValidation.error.issues[0]?.message ||
                "Password does not meet security requirements.",
              code: "WEAK_PASSWORD",
            },
            400,
          );
        }

        try {
          const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
          const admin = await getAdmin();

          // 1. Fetch & validate token
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
              { success: false, error: "This activation link has expired.", code: "TOKEN_EXPIRED" },
              400,
            );
          }

          // 2. Fetch cadet user
          const { data: user } = await admin
            .from("cadet_users")
            .select("*")
            .eq("id", tokRecord.user_id)
            .single();

          if (!user) {
            return json({ success: false, error: "Cadet user record not found." }, 404);
          }

          // 3. Generate salted scrypt hash
          const saltedHash = await hashPassword(password, user.email);

          const now = new Date().toISOString();

          // 4. Update cadet_users status to ACTIVE
          await admin
            .from("cadet_users")
            .update({
              password_hash: saltedHash,
              account_status: "ACTIVE",
              activated_at: now,
              updated_at: now,
            })
            .eq("id", user.id);

          // 5. Store credential in app_credentials for standard auth login
          await admin.from("app_credentials").upsert(
            {
              identifier: user.cadet_id,
              email: user.email,
              password_hash: saltedHash,
              role: "CADET",
              updated_at: now,
            },
            { onConflict: "identifier" },
          );

          // 6. Mark token as used
          await admin
            .from("account_activation_tokens")
            .update({ used_at: now })
            .eq("id", tokRecord.id);

          // 7. Initialize onboarding_progress
          await admin.from("onboarding_progress").upsert(
            {
              user_id: user.id,
              profile_completed: false,
              contact_verified: true,
              documents_verified: true,
              declaration_accepted: false,
              orientation_completed: false,
              onboarding_completed: false,
              updated_at: now,
            },
            { onConflict: "user_id" },
          );

          // 8. Fetch enrollment record details
          const { data: app } = await admin
            .from("cadet_enrollments")
            .select("full_name")
            .eq("id", user.application_id)
            .maybeSingle();

          const cadetName = app?.full_name || "Cadet";

          // 9. Enqueue Onboarding Welcome Email
          await queueEmailJob("sendOnboardingWelcome", user.email, {
            recipient: user.email,
            cadetName,
            cadetId: user.cadet_id,
            unitName: "19 JHR BN NCC",
          });

          // 10. Record Audit Log
          await admin.from("audit_logs").insert({
            action: "ACTIVATE_CADET_ACCOUNT",
            performed_by: user.email,
            target_id: user.id,
            details: { cadetId: user.cadet_id },
          });

          return json({
            success: true,
            message:
              "Account activated successfully. Your password has been set. You can now log in to the portal.",
            data: {
              cadetId: user.cadet_id,
              email: user.email,
              accountStatus: "ACTIVE",
            },
          });
        } catch (err: any) {
          console.error("[Set Password Error]", err);
          return json(
            {
              success: false,
              error: err?.message || "Failed to set password and activate account",
            },
            500,
          );
        }
      },
    },
  },
});
