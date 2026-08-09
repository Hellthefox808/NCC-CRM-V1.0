import React from "react";
import { SbuNccSignupPortal } from "@frontend/features/SbuNccSignupPortal";
import { useNavigate } from "@backend/lib/navigation";
import { type UserSessionProfile } from "@backend/services/dataPlatform";

interface LoginProps {
  onLoginSuccess: (
    type: "cadet" | "admin",
    user?: UserSessionProfile | Record<string, unknown>,
  ) => void;
  onBack?: () => void;
  onOpenEnrollmentForm?: () => void;
  defaultSection?: "cadets" | "admin";
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onBack,
  onOpenEnrollmentForm,
  defaultSection = "cadets",
}) => {
  const goTo = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12">
      <SbuNccSignupPortal
        defaultSection={defaultSection}
        onLoginSuccess={(type, user) => {
          onLoginSuccess(type, user);
          goTo(type === "admin" ? "/admin" : "/cadet");
        }}
        onOpenEnrollmentForm={() => {
          if (onOpenEnrollmentForm) {
            onOpenEnrollmentForm();
          } else {
            goTo("/enroll");
          }
        }}
      />
    </div>
  );
};
