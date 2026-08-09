import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@frontend/features/pages/AdminDashboard";
import { SbuNccSignupPortal } from "@frontend/features/SbuNccSignupPortal";
import { useAppShell } from "@backend/lib/app-shell";
import { useNavigate } from "@backend/lib/navigation";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Officer Command Centre — SBU NCC Portal" },
      {
        name: "description",
        content:
          "Associate NCC Officer command centre: review enrollments, update selection status, broadcast notices and track unit metrics.",
      },
      { property: "og:title", content: "Officer Command Centre — SBU NCC Portal" },
      {
        property: "og:description",
        content:
          "Review cadet enrollments, update status, broadcast notices and track unit metrics.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const shell = useAppShell();
  const navigate = useNavigate();

  if (shell.isLoggedIn && shell.currentUserType === "admin") {
    return <AdminDashboard onOpenPrintableSlip={shell.setPrintableRecord} />;
  }

  return (
    <SbuNccSignupPortal
      defaultSection="admin"
      onLoginSuccess={(type, user) => shell.signIn(type, user)}
      onOpenEnrollmentForm={() => navigate("/enroll")}
    />
  );
}
