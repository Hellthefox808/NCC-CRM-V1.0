import { createFileRoute } from "@tanstack/react-router";
import { CadetDashboard } from "@frontend/features/pages/CadetDashboard";
import { SbuNccSignupPortal } from "@frontend/features/SbuNccSignupPortal";
import { useAppShell } from "@backend/lib/app-shell";
import { useNavigate } from "@backend/lib/navigation";

export const Route = createFileRoute("/cadet")({
  head: () => ({
    meta: [
      { title: "Cadet Dashboard — SBU NCC Portal" },
      {
        name: "description",
        content:
          "Cadet dashboard: attendance, training modules, camp activities, certificates, leave requests and achievements.",
      },
      { property: "og:title", content: "Cadet Dashboard — SBU NCC Portal" },
      {
        property: "og:description",
        content:
          "Attendance, training, camps, certificates, leave requests and achievements for SBU NCC cadets.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CadetRoute,
});

function CadetRoute() {
  const shell = useAppShell();
  const navigate = useNavigate();

  if (shell.isLoggedIn && shell.currentUserType === "cadet") {
    return <CadetDashboard onLogout={() => void shell.signOut()} />;
  }

  return (
    <SbuNccSignupPortal
      defaultSection="cadets"
      onLoginSuccess={(type, user) => shell.signIn(type, (user as Record<string, unknown>) ?? null)}
      onOpenEnrollmentForm={() => navigate("/enroll")}
    />
  );
}
