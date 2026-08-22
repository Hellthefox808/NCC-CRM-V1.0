import { createFileRoute } from "@tanstack/react-router";
import { CadetDatabase } from "@frontend/features/Admin/CadetDatabase";
import { SbuNccSignupPortal } from "@frontend/features/SbuNccSignupPortal";
import { useAppShell } from "@backend/lib/app-shell";
import { useNavigate } from "@backend/lib/navigation";

export const Route = createFileRoute("/cadet-database")({
  head: () => ({
    meta: [
      { title: "Cadet Database — 19 JHR BN NCC, Sarala Birla University" },
      {
        name: "description",
        content:
          "Officer-only cadet register of 19 Jharkhand Battalion NCC at Sarala Birla University: nominal roll, academic posting, next-of-kin, stipend and service record.",
      },
      { property: "og:title", content: "Cadet Database — 19 JHR BN NCC, Sarala Birla University" },
      {
        property: "og:description",
        content:
          "Consolidated Batch-I and Batch-II cadet register with search, filters and service records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CadetDatabaseRoute,
});

function CadetDatabaseRoute() {
  const shell = useAppShell();
  const navigate = useNavigate();

  if (shell.isLoggedIn && shell.currentUserType === "admin") {
    return <CadetDatabase />;
  }

  return (
    <SbuNccSignupPortal
      defaultSection="admin"
      onLoginSuccess={(type, user) => shell.signIn(type, (user as Record<string, unknown>) ?? null)}
      onOpenEnrollmentForm={() => navigate("/enroll")}
    />
  );
}
