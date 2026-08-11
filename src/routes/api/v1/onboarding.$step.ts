import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { requireCadetSession } from "@backend/lib/cadet-registry.server";

const VALID_STEPS = [
  "profile_completed",
  "contact_verified",
  "documents_verified",
  "declaration_accepted",
  "orientation_completed",
];

export const Route = createFileRoute("/api/v1/onboarding/$step")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        const gate = await requireCadetSession(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const rawStep = params.step;
        // Normalize camelCase to snake_case if needed
        const step = rawStep.replace(/([A-Z])/g, "_$1").toLowerCase();

        if (!VALID_STEPS.includes(step)) {
          return json(
            {
              success: false,
              error: `Invalid onboarding step: ${rawStep}. Allowed steps: ${VALID_STEPS.join(", ")}`,
            },
            400,
          );
        }

        const body = (await request.json().catch(() => ({}))) as { completed?: boolean };
        const isCompleted = body.completed ?? true;

        try {
          const admin = await getAdmin();
          const { data: user } = await admin
            .from("cadet_users")
            .select("id")
            .eq("email", gate.session?.cadetId || "")
            .maybeSingle();

          const userId = user?.id;
          if (!userId) {
            return json({ success: false, error: "Cadet user record not found" }, 404);
          }

          // Fetch current onboarding record
          const { data: current } = await admin
            .from("onboarding_progress")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          const updatedState: Record<string, any> = {
            user_id: userId,
            profile_completed: current?.profile_completed ?? false,
            contact_verified: current?.contact_verified ?? true,
            documents_verified: current?.documents_verified ?? true,
            declaration_accepted: current?.declaration_accepted ?? false,
            orientation_completed: current?.orientation_completed ?? false,
            updated_at: new Date().toISOString(),
          };

          updatedState[step] = isCompleted;

          // Check if all steps are completed
          const allDone =
            updatedState.profile_completed &&
            updatedState.contact_verified &&
            updatedState.documents_verified &&
            updatedState.declaration_accepted &&
            updatedState.orientation_completed;

          if (allDone) {
            updatedState.onboarding_completed = true;
            updatedState.completed_at = new Date().toISOString();
          }

          const { data: saved, error } = await admin
            .from("onboarding_progress")
            .upsert(updatedState, { onConflict: "user_id" })
            .select("*")
            .single();

          if (error) throw error;

          const items = [
            saved.profile_completed,
            saved.contact_verified,
            saved.documents_verified,
            saved.declaration_accepted,
            saved.orientation_completed,
          ];
          const progressPercent = Math.round((items.filter(Boolean).length / items.length) * 100);

          return json({
            success: true,
            message: `Onboarding step '${step}' updated.`,
            data: {
              progressPercent,
              checklist: {
                profileCompleted: saved.profile_completed,
                contactVerified: saved.contact_verified,
                documentsVerified: saved.documents_verified,
                declarationAccepted: saved.declaration_accepted,
                orientationCompleted: saved.orientation_completed,
                onboardingCompleted: saved.onboarding_completed,
              },
            },
          });
        } catch (err: any) {
          console.error("[Update Onboarding Step Error]", err);
          return json(
            { success: false, error: err?.message || "Failed to update onboarding step" },
            500,
          );
        }
      },
    },
  },
});
