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

interface CadetUserRecord {
  id: string;
}

interface OnboardingProgressRecord {
  user_id: string;
  profile_completed: boolean;
  contact_verified: boolean;
  documents_verified: boolean;
  declaration_accepted: boolean;
  orientation_completed: boolean;
  onboarding_completed: boolean;
  completed_at?: string | null;
  updated_at: string;
}

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
          const db = admin as unknown as {
            from: (table: string) => {
              select: (cols: string) => {
                or: (clause: string) => {
                  maybeSingle: () => Promise<{ data: CadetUserRecord | null }>;
                };
                eq: (
                  col: string,
                  val: string,
                ) => {
                  maybeSingle: () => Promise<{ data: OnboardingProgressRecord | null }>;
                };
              };
              upsert: (
                record: Record<string, unknown>,
                opts: { onConflict: string },
              ) => {
                select: (cols: string) => {
                  single: () => Promise<{
                    data: OnboardingProgressRecord | null;
                    error: Error | null;
                  }>;
                };
              };
            };
          };

          const cadetId = gate.session?.cadetId || gate.enrollmentId || "";
          const { data: user } = await db
            .from("cadet_users")
            .select("id")
            .or(`cadet_id.eq.${cadetId},email.eq.${cadetId}`)
            .maybeSingle();

          const userId = user?.id;
          if (!userId) {
            return json({ success: false, error: "Cadet user record not found" }, 404);
          }

          // Fetch current onboarding record
          const { data: current } = await db
            .from("onboarding_progress")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          const updatedState: Record<string, unknown> = {
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
            Boolean(updatedState.profile_completed) &&
            Boolean(updatedState.contact_verified) &&
            Boolean(updatedState.documents_verified) &&
            Boolean(updatedState.declaration_accepted) &&
            Boolean(updatedState.orientation_completed);

          if (allDone) {
            updatedState.onboarding_completed = true;
            updatedState.completed_at = new Date().toISOString();
          }

          const { data: saved, error } = await db
            .from("onboarding_progress")
            .upsert(updatedState, { onConflict: "user_id" })
            .select("*")
            .single();

          if (error) throw error;

          const items = [
            saved?.profile_completed,
            saved?.contact_verified,
            saved?.documents_verified,
            saved?.declaration_accepted,
            saved?.orientation_completed,
          ];
          const progressPercent = Math.round((items.filter(Boolean).length / items.length) * 100);

          return json({
            success: true,
            message: `Onboarding step '${step}' updated.`,
            data: {
              progressPercent,
              checklist: {
                profileCompleted: saved?.profile_completed ?? false,
                contactVerified: saved?.contact_verified ?? true,
                documentsVerified: saved?.documents_verified ?? true,
                declarationAccepted: saved?.declaration_accepted ?? false,
                orientationCompleted: saved?.orientation_completed ?? false,
                onboardingCompleted: saved?.onboarding_completed ?? false,
              },
            },
          });
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to update onboarding step";
          console.error("[Update Onboarding Step Error]", err);
          return json({ success: false, error: errorMessage }, 500);
        }
      },
    },
  },
});
