import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SbuNccSignupPortal } from "@frontend/features/SbuNccSignupPortal";
import { useAppShell } from "@backend/lib/app-shell";
import { useNavigate as usePathNavigate } from "@backend/lib/navigation";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — SBU NCC Portal" },
      {
        name: "description",
        content: "Sign in to the SBU NCC portal as a cadet or as an Associate NCC Officer.",
      },
      { property: "og:title", content: "Sign In — SBU NCC Portal" },
      {
        property: "og:description",
        content: "Cadet and officer sign-in for the SBU NCC portal.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginRoute,
});

function LoginRoute() {
  const shell = useAppShell();
  const navigate = useNavigate();
  const goTo = usePathNavigate();

  useEffect(() => {
    if (shell.isLoggedIn) {
      void navigate({
        to: shell.currentUserType === "admin" ? "/admin" : "/cadet",
        replace: true,
      });
    }
  }, [shell.isLoggedIn, shell.currentUserType, navigate]);

  return (
    <SbuNccSignupPortal
      defaultSection="cadets"
      onLoginSuccess={(type, user) => shell.signIn(type, user)}
      onOpenEnrollmentForm={() => goTo("/enroll")}
    />
  );
}
