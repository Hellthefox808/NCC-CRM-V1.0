import { createFileRoute, useSearch } from "@tanstack/react-router";
import { PasswordSetupPortal } from "@frontend/features/PasswordSetupPortal";

export const Route = createFileRoute("/activate")({
  head: () => ({
    meta: [
      { title: "Account Activation & Password Setup — 19 JHR BN NCC" },
      {
        name: "description",
        content: "Set your secure password and activate your 19 Jharkhand Battalion NCC portal account.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { token?: string; mode?: "activation" | "reset" } => ({
    token: (search.token as string) || "",
    mode: (search.mode as "activation" | "reset") || "activation",
  }),
  component: ActivateRoute,
});

function ActivateRoute() {
  const search = useSearch({ from: "/activate" });
  return <PasswordSetupPortal token={search.token || ""} mode={search.mode || "activation"} />;
}
