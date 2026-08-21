import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import campusFront from "@/assets/sbu-campus-front.jpg.asset.json";
import {
  Award,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  ShieldCheck,
  User,
  UserCheck,
  UserPlus,
  FileText,
  AlertCircle,
  Building,
  Mail,
  Phone,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { BATTALION_DETAILS } from "@/data/nccData";
import { EnterpriseDataPlatform, type UserSessionProfile } from "@backend/services/dataPlatform";

interface SbuNccSignupPortalProps {
  onLoginSuccess: (
    userType: "cadet" | "admin",
    userData?: UserSessionProfile | Record<string, unknown>,
  ) => void;
  onOpenEnrollmentForm: () => void;
  defaultSection?: "cadets" | "admin";
}

export const SbuNccSignupPortal: React.FC<SbuNccSignupPortalProps> = ({
  onLoginSuccess,
  onOpenEnrollmentForm,
  defaultSection = "cadets",
}) => {
  // Main Section Toggle: 'cadets' vs 'admin'
  const [activeSection, setActiveSection] = useState<"cadets" | "admin">(defaultSection);

  // Sub-mode for Cadets: 'login' vs 'signup'
  const [cadetMode, setCadetMode] = useState<"login" | "signup">("login");

  // Sub-mode for Admin: 'login' vs 'signup'
  const [adminMode, setAdminMode] = useState<"login" | "signup">("login");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Loading state: which portal panel is swapping, and which sign-in is authenticating.
  const [isSwitchingPortal, setIsSwitchingPortal] = useState(false);
  const [authPending, setAuthPending] = useState<"cadet" | "admin" | null>(null);
  const [retryAction, setRetryAction] = useState<{ label: string; run: () => void } | null>(null);

  // Cadet Login State
  const [cadetIdentifier, setCadetIdentifier] = useState("");
  const [cadetPassword, setCadetPassword] = useState("");

  // Cadet Signup State
  const [cadetForm, setCadetForm] = useState({
    sbuRollNo: "",
    fullName: "",
    email: "",
    mobile: "",
    gender: "SD",
    sbuCourse: "",
    sbuYear: "1st Year",
    password: "",
    confirmPassword: "",
    termsAgreed: true,
  });

  // Admin Login State
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Admin Signup State
  const [adminForm, setAdminForm] = useState({
    fullName: "",
    designation: "Associate NCC Officer (ANO)",
    employeeId: "",
    email: "",
    mobile: "",
    accessKey: "",
    password: "",
  });

  // Motion variants — shared across portal panels for a cohesive, premium feel.
  const cardVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const panelVariants = {
    initial: { opacity: 0, x: 18 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: { opacity: 0, x: -14, transition: { duration: 0.18 } },
  };

  // Handle Cadet Sign In
  const submitCadetLogin = async () => {
    if (!cadetIdentifier || !cadetPassword) {
      setRetryAction(null);
      setNoticeMessage({ type: "error", text: "Please enter your SBU Roll No and Password." });
      return;
    }
    setRetryAction(null);
    setNoticeMessage(null);
    setAuthPending("cadet");
    try {
      const res = await EnterpriseDataPlatform.login({
        userType: "cadet",
        username: cadetIdentifier,
        password: cadetPassword,
      });
      if (res.success && res.data) {
        setNoticeMessage({
          type: "success",
          text: "Cadet authentication successful! Welcome to SBU NCC Portal.",
        });
        setAuthPending(null);
        setTimeout(() => {
          onLoginSuccess("cadet", {
            fullName: res.data!.user.name || cadetForm.fullName || cadetIdentifier,
            sbuRollNo: cadetIdentifier,
            gender: cadetForm.gender,
          });
        }, 500);
      } else {
        setAuthPending(null);
        // Surface a clear, actionable message when the account exists but hasn't
        // been activated yet — guide the cadet straight to the recovery flow.
        if ((res as { code?: string }).code === "ACCOUNT_NOT_ACTIVATED") {
          setNoticeMessage({
            type: "error",
            text: "Your account hasn't been activated yet. Use 'Forgot password?' below to set your portal password.",
          });
          setRetryAction({
            label: "Activate account",
            run: () => openRecovery("cadet"),
          });
        } else {
          setNoticeMessage({
            type: "error",
            text: res.error || "Invalid enrollment number or password.",
          });
          setRetryAction({ label: "Retry sign in", run: () => void submitCadetLogin() });
        }
      }
    } catch (err: unknown) {
      setAuthPending(null);
      const message =
        err instanceof Error ? err.message : "Authentication failed. Please check credentials.";
      setNoticeMessage({
        type: "error",
        text: message,
      });
      setRetryAction({ label: "Retry sign in", run: () => void submitCadetLogin() });
    }
  };

  const handleCadetLogin = (e: React.FormEvent) => {
    e.preventDefault();
    void submitCadetLogin();
  };

  // Handle Cadet New Registration (Sign Up)
  const handleCadetSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadetForm.sbuRollNo || !cadetForm.fullName || !cadetForm.mobile || !cadetForm.email) {
      setNoticeMessage({
        type: "error",
        text: "Please fill in all mandatory SBU student details.",
      });
      return;
    }
    if (cadetForm.password && cadetForm.password !== cadetForm.confirmPassword) {
      setNoticeMessage({ type: "error", text: "Passwords do not match. Please re-check." });
      return;
    }

    setNoticeMessage({
      type: "success",
      text: `Account created for ${cadetForm.fullName} (${cadetForm.sbuRollNo}). Proceeding to Enrollment!`,
    });

    setTimeout(() => {
      onLoginSuccess("cadet", cadetForm);
      onOpenEnrollmentForm();
    }, 800);
  };

  // Handle Admin Sign In
  const submitAdminLogin = async () => {
    if (!adminUsername || !adminPassword) {
      setRetryAction(null);
      setNoticeMessage({
        type: "error",
        text: "Please enter your Official Officer Email and Password.",
      });
      return;
    }
    setRetryAction(null);
    setNoticeMessage(null);
    setAuthPending("admin");
    try {
      const res = await EnterpriseDataPlatform.login({
        userType: "admin",
        username: adminUsername,
        password: adminPassword,
      });
      if (res.success && res.data) {
        setNoticeMessage({
          type: "success",
          text: "Officer Credentials Verified! Welcome Associate NCC Officer.",
        });
        setAuthPending(null);
        setTimeout(() => {
          onLoginSuccess("admin", res.data!.user);
        }, 500);
      } else {
        setAuthPending(null);
        if ((res as { code?: string }).code === "ACCOUNT_NOT_ACTIVATED") {
          setNoticeMessage({
            type: "error",
            text: "Officer account not activated. Use 'Forgot command key?' below to set your password.",
          });
          setRetryAction({
            label: "Activate officer account",
            run: () => openRecovery("admin"),
          });
        } else {
          setNoticeMessage({
            type: "error",
            text: res.error || "Invalid email, username, or password.",
          });
          setRetryAction({ label: "Retry sign in", run: () => void submitAdminLogin() });
        }
      }
    } catch (err: unknown) {
      setAuthPending(null);
      const message = err instanceof Error ? err.message : "Officer authentication failed.";
      setNoticeMessage({ type: "error", text: message });
      setRetryAction({ label: "Retry sign in", run: () => void submitAdminLogin() });
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    void submitAdminLogin();
  };

  // Handle Admin Authorization Signup Request
  const handleAdminSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.fullName || !adminForm.employeeId || !adminForm.email) {
      setNoticeMessage({
        type: "error",
        text: "Please provide all required officer registration details.",
      });
      return;
    }
    setNoticeMessage({
      type: "success",
      text: "Officer authorization request submitted to 19 JHR BN HQ. Access granted for demo session.",
    });
    setTimeout(() => {
      onLoginSuccess("admin");
    }, 800);
  };

  // ── Password recovery (forgot password + OTP) ─────────────────────────────
  // Two steps in place of the sign-in form: identify the account, then enter the
  // 6-digit code and set a new portal password. Never navigates away, so the
  // cadet keeps the portal context (Linear/Stripe recovery pattern).
  const [recovery, setRecovery] = useState<{
    open: boolean;
    portal: "cadet" | "admin";
    step: "identify" | "verify";
    identifier: string;
    code: string;
    newPassword: string;
    confirmPassword: string;
    destination: string;
    issuedCode: string | null;
    expiresAt: string | null;
    pending: boolean;
  }>({
    open: false,
    portal: "cadet",
    step: "identify",
    identifier: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
    destination: "",
    issuedCode: null,
    expiresAt: null,
    pending: false,
  });
  const [resendIn, setResendIn] = useState(0);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const openRecovery = (portal: "cadet" | "admin") => {
    setNoticeMessage(null);
    setRetryAction(null);
    setRecovery({
      open: true,
      portal,
      step: "identify",
      identifier: portal === "cadet" ? cadetIdentifier : adminUsername,
      code: "",
      newPassword: "",
      confirmPassword: "",
      destination: "",
      issuedCode: null,
      expiresAt: null,
      pending: false,
    });
  };

  const closeRecovery = () => {
    setRecovery((r) => ({ ...r, open: false, pending: false }));
    setNoticeMessage(null);
    setRetryAction(null);
  };

  const requestRecoveryCode = async (portal: "cadet" | "admin", identifier: string) => {
    if (!identifier.trim()) {
      setRetryAction(null);
      setNoticeMessage({
        type: "error",
        text:
          portal === "cadet"
            ? "Enter your SBU Roll No, regimental number, registered email or mobile."
            : "Enter your officer username or official email.",
      });
      return;
    }
    setNoticeMessage(null);
    setRetryAction(null);
    setRecovery((r) => ({ ...r, pending: true }));
    try {
      const res = await EnterpriseDataPlatform.requestPasswordOtp({
        identifier: identifier.trim(),
        userType: portal,
      });
      if (!res.success) {
        setRecovery((r) => ({ ...r, pending: false }));
        setNoticeMessage({
          type: "error",
          text: res.error || "Could not issue a verification code.",
        });
        setRetryAction({
          label: "Retry sending code",
          run: () => void requestRecoveryCode(portal, identifier),
        });
        return;
      }
      const data = res.data!;
      setResendIn(45);
      setRecovery((r) => ({
        ...r,
        pending: false,
        step: "verify",
        identifier: identifier.trim(),
        destination: data.destination || "",
        issuedCode: data.code || null,
        expiresAt: data.expiresAt || null,
      }));
      setNoticeMessage({
        type: "success",
        text: data.issued
          ? `Verification code issued for ${data.destination}. Valid for ${data.ttlMinutes} minutes.`
          : res.message ||
            "If this account exists on the unit register, a verification code has been issued.",
      });
    } catch (err: unknown) {
      setRecovery((r) => ({ ...r, pending: false }));
      const message = err instanceof Error ? err.message : "Could not issue a verification code.";
      setNoticeMessage({
        type: "error",
        text: message,
      });
      setRetryAction({
        label: "Retry sending code",
        run: () => void requestRecoveryCode(portal, identifier),
      });
    }
  };

  const submitRecoveryReset = async () => {
    const { identifier, code, newPassword, confirmPassword, portal } = recovery;
    if (!/^\d{6}$/.test(code.trim())) {
      setRetryAction(null);
      setNoticeMessage({ type: "error", text: "Enter the 6-digit verification code." });
      return;
    }
    if (newPassword.length < 8) {
      setRetryAction(null);
      setNoticeMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setRetryAction(null);
      setNoticeMessage({ type: "error", text: "Passwords do not match. Please re-check." });
      return;
    }
    setNoticeMessage(null);
    setRetryAction(null);
    setRecovery((r) => ({ ...r, pending: true }));
    try {
      const res = await EnterpriseDataPlatform.verifyPasswordOtp({
        identifier,
        code: code.trim(),
        newPassword,
      });
      if (!res.success) {
        setRecovery((r) => ({ ...r, pending: false }));
        setNoticeMessage({ type: "error", text: res.error || "Could not verify the code." });
        setRetryAction({ label: "Retry verification", run: () => void submitRecoveryReset() });
        return;
      }
      setRecovery((r) => ({ ...r, open: false, pending: false }));
      if (portal === "cadet") {
        setCadetIdentifier(identifier);
        setCadetPassword("");
      } else {
        setAdminUsername(identifier);
        setAdminPassword("");
      }
      setNoticeMessage({
        type: "success",
        text: "Password reset successfully. Sign in with your new password.",
      });
    } catch (err: unknown) {
      setRecovery((r) => ({ ...r, pending: false }));
      const message = err instanceof Error ? err.message : "Could not verify the code.";
      setNoticeMessage({ type: "error", text: message });
      setRetryAction({ label: "Retry verification", run: () => void submitRecoveryReset() });
    }
  };

  // Shared field styling — Light Coffee Cream & Regimental Navy theme.
  const fieldClass =
    "w-full rounded-[14px] border border-[#8C5E3C]/25 bg-[#FAF7F2] px-4 py-3 text-sm text-[#3B281C] placeholder:text-[#8C5E3C]/50 transition-all duration-200 ease-out field-focus-glow focus:outline-none font-medium tracking-[0.01em]";
  const fieldWithIconClass = `${fieldClass} pl-11`;
  const labelClass =
    "mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#8C5E3C] label-lift";
  const submitClass =
    "w-full rounded-[14px] bg-[#1E3A8A] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1E3A8A]/25 transition-all duration-200 hover:bg-[#152A64] hover:shadow-xl active:scale-[0.985] cursor-pointer flex items-center justify-center gap-2 btn-shine";
  const subTabClass = (active: boolean) =>
    `pb-3 text-[13px] font-bold transition-colors cursor-pointer border-b-2 ${
      active
        ? "text-[#1E3A8A] border-[#1E3A8A]"
        : "text-[#8C5E3C]/70 border-transparent hover:text-[#3B281C]"
    }`;

  // Portal switch shows a skeleton for one animation beat so the panel swap reads
  // as a deliberate transition instead of a jarring layout jump. If the swap
  // throws, the banner keeps a retry so the user never has to reload.
  const switchSection = (section: "cadets" | "admin", force = false) => {
    if (isSwitchingPortal) return;
    if (section === activeSection && !force) return;
    setNoticeMessage(null);
    setRetryAction(null);
    setIsSwitchingPortal(true);
    try {
      setActiveSection(section);
      window.setTimeout(() => setIsSwitchingPortal(false), 420);
    } catch (err: unknown) {
      setIsSwitchingPortal(false);
      const message =
        err instanceof Error ? err.message : "Could not switch portals. Please try again.";
      setNoticeMessage({
        type: "error",
        text: message,
      });
      setRetryAction({ label: "Retry portal switch", run: () => switchSection(section, true) });
    }
  };

  const SkeletonField = () => (
    <div className="space-y-2">
      <div className="h-2.5 w-40 rounded-full bg-muted" />
      <div className="h-[46px] w-full rounded-[14px] border border-border bg-muted/60" />
    </div>
  );

  // Skeleton mirrors the real form geometry (2 fields + primary action) so nothing shifts.
  const AuthFormSkeleton: React.FC<{ label: string; showTabs?: boolean }> = ({
    label,
    showTabs,
  }) => (
    <div className="flex-1" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="animate-pulse">
        {showTabs && (
          <div className="mb-8 flex gap-6 border-b border-border pb-3">
            <div className="h-2.5 w-14 rounded-full bg-muted" />
            <div className="h-2.5 w-16 rounded-full bg-muted" />
          </div>
        )}
        <div className="space-y-6">
          <SkeletonField />
          <SkeletonField />
          <div className="h-[50px] w-full rounded-[14px] bg-muted" />
          <div className="mx-auto h-2.5 w-48 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );

  // Recovery panel replaces the sign-in form in place (no route change), matching
  // the two-step "identify → verify" pattern used by Stripe/Linear account recovery.
  const renderRecoveryPanel = () => (
    <div className="flex-1">
      <div className="mb-8 border-b border-border pb-5">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-primary" />
          {recovery.portal === "cadet" ? "Cadet account recovery" : "Officer account recovery"}
        </div>
        <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
          {recovery.step === "identify" ? "Reset your portal password" : "Enter verification code"}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          {recovery.step === "identify"
            ? recovery.portal === "cadet"
              ? "We verify your identity against the 19 JHR BN nominal roll, then issue a one-time code."
              : "Officer recovery is verified against battalion command records before a code is issued."
            : `Enter the 6-digit code${recovery.destination ? ` issued for ${recovery.destination}` : ""} and set a new password.`}
        </p>
      </div>

      {recovery.step === "identify" && (
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            void requestRecoveryCode(recovery.portal, recovery.identifier);
          }}
        >
          <div>
            <label className={labelClass} htmlFor="recovery-identifier">
              {recovery.portal === "cadet"
                ? "SBU Roll No / Regimental No / Email / Mobile"
                : "Officer Username / Official Email"}
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="recovery-identifier"
                type="text"
                autoComplete="username"
                value={recovery.identifier}
                onChange={(e) => setRecovery((r) => ({ ...r, identifier: e.target.value }))}
                placeholder={recovery.portal === "cadet" ? "SBU2401211" : "ano.sbu"}
                className={fieldWithIconClass}
              />
            </div>
          </div>

          <button
            type="submit"
            className={submitClass}
            disabled={recovery.pending}
            id="recovery-request-btn"
          >
            {recovery.pending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            <span>{recovery.pending ? "Issuing code…" : "Send verification code"}</span>
          </button>

          <button
            type="button"
            onClick={closeRecovery}
            className="w-full text-center text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            Back to sign in
          </button>
        </form>
      )}

      {recovery.step === "verify" && (
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            void submitRecoveryReset();
          }}
        >
          {recovery.issuedCode && (
            <div className="rounded-[14px] border border-primary/25 bg-primary/5 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                Verification code
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums tracking-[0.35em] text-foreground">
                {recovery.issuedCode}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Unit email/SMS dispatch is not provisioned yet, so the code is shown here for the
                cadre in attendance.
              </p>
            </div>
          )}

          <div>
            <label className={labelClass} htmlFor="recovery-code">
              6-Digit Verification Code
            </label>
            <input
              id="recovery-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={recovery.code}
              onChange={(e) =>
                setRecovery((r) => ({ ...r, code: e.target.value.replace(/\D/g, "").slice(0, 6) }))
              }
              placeholder="000000"
              className={`${fieldClass} text-center font-mono text-lg tabular-nums tracking-[0.4em]`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="recovery-new-password">
                New Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="recovery-new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={recovery.newPassword}
                  onChange={(e) => setRecovery((r) => ({ ...r, newPassword: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className={fieldWithIconClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="recovery-confirm-password">
                Confirm Password
              </label>
              <input
                id="recovery-confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={recovery.confirmPassword}
                onChange={(e) => setRecovery((r) => ({ ...r, confirmPassword: e.target.value }))}
                placeholder="Repeat password"
                className={fieldClass}
              />
            </div>
          </div>

          <button
            type="submit"
            className={submitClass}
            disabled={recovery.pending}
            id="recovery-verify-btn"
          >
            {recovery.pending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            <span>{recovery.pending ? "Verifying…" : "Verify code & reset password"}</span>
          </button>

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={resendIn > 0 || recovery.pending}
              onClick={() => void requestRecoveryCode(recovery.portal, recovery.identifier)}
              className="text-[12px] font-semibold text-primary transition-colors hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline cursor-pointer"
            >
              {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
            </button>
            <button
              type="button"
              onClick={closeRecovery}
              className="text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              Back to sign in
            </button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <section
      className="flex min-h-[85vh] items-center justify-center portal-ambient-bg px-4 py-10 sm:px-6 sm:py-14"
      id="sbu-signup-portal-section"
    >
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[1100px] overflow-hidden rounded-[22px] border border-border/80 bg-card shadow-[0_32px_64px_-12px_rgb(0_0_0/0.14)] card-hover-lift lg:flex lg:min-h-[680px]"
      >
        {/* Left: campus identity rail - Light Coffee & Regimental Image Theme */}
        <div className="relative hidden bg-[#0f2415] lg:block lg:w-[42%] overflow-hidden">
          {/* Crystal Clear SBU Campus Photography */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 brightness-105 contrast-105 saturate-[1.1]"
            style={{ backgroundImage: `url('/sbu-campus-front.jpg')` }}
            role="img"
            aria-label="Sarala Birla University main campus building, Ranchi"
          />
          {/* Subtle Regimental Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09150c]/90 via-[#0f2415]/50 to-[#09150c]/70" />

          {/* Top Crest Badges on Left Rail */}
          <div className="absolute top-10 left-10 flex items-center gap-3 z-10">
            <div className="w-11 h-11 rounded-full bg-white p-0.5 shadow-xl border border-emerald-400 flex items-center justify-center overflow-hidden crest-pulse-ring">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_5fO3j9MhxWCOALUorfuM3nZcChQfc2949oaRRyjpIQ&s=10"
                alt="SBU Emblem"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-11 h-11 rounded-full bg-white p-0.5 shadow-xl border border-amber-400 flex items-center justify-center overflow-hidden">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZDvUjTIPyVWknpreMHXnyKTvz7-P_uljpSxjPHcXXw&s=10"
                alt="NCC Crest"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="absolute inset-x-10 bottom-12 z-10"
          >
            <motion.div
              variants={staggerItem}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/60 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md shadow-lg"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CADRE PORTAL</span>
            </motion.div>
            <motion.h2
              variants={staggerItem}
              className="mb-4 font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] lg:text-5xl text-render-premium"
            >
              सरला बिरला विश्वविद्यालय, राँची
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="max-w-md text-sm leading-relaxed text-emerald-100/90 font-medium drop-shadow-md"
            >
              Official Senior Division &amp; Senior Wing Army cadre portal of{" "}
              <strong className="font-bold text-white">19 Jharkhand Battalion NCC</strong>, Bihar
              &amp; Jharkhand Directorate — enrollment, attendance, camps and certificate records
              for the Sarala Birla University company.
            </motion.p>
          </motion.div>
        </div>

        {/* Right: authentication panel */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-1 flex-col p-6 sm:p-10 lg:p-14 bg-[#FFFBF7] text-render-premium"
        >
          {/* Panel header: crests, university identity, cadre chip */}
          <motion.div
            variants={staggerItem}
            className="mb-10 flex items-start justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: -2 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-400/60 bg-white p-1 shadow-md crest-pulse-ring"
                >
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_5fO3j9MhxWCOALUorfuM3nZcChQfc2949oaRRyjpIQ&s=10"
                    alt="Sarala Birla University Emblem"
                    className="h-full w-full rounded-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 2 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-400/60 bg-white p-1 shadow-md"
                >
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZDvUjTIPyVWknpreMHXnyKTvz7-P_uljpSxjPHcXXw&s=10"
                    alt="19 JHR BN NCC Crest"
                    className="h-full w-full rounded-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>

              <div className="min-w-0">
                <h1 className="font-display text-lg font-black leading-none tracking-[-0.02em] text-[#3B281C]">
                  Sarala Birla University
                </h1>
                <p className="mt-1 text-[11px] font-bold text-[#8C5E3C]">
                  सरला बिरला विश्वविद्यालय, राँची
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg border border-[#1E3A8A]/30 bg-[#1E3A8A] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
              2026-27 Cadre
            </span>
          </motion.div>

          {/* Portal switcher: Cadet vs ANO / Officer */}
          <motion.div
            variants={staggerItem}
            role="tablist"
            aria-label="Select portal"
            className="relative mb-9 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/70 p-1.5 shadow-inner backdrop-blur-sm"
          >
            <motion.div
              layoutId="portal-active-pill"
              className={`pointer-events-none absolute inset-y-1.5 w-[calc(50%-0.5rem)] rounded-[13px] border border-border bg-card shadow-md ${
                activeSection === "cadets" ? "left-1.5" : "left-[calc(50%+0.25rem)]"
              }`}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
            {[
              {
                key: "cadets" as const,
                id: "sbu-portal-cadets-tab",
                panelId: "sbu-portal-cadets-panel",
                Icon: GraduationCap,
                label: "Cadet Portal",
                hint: "Cadets & aspirants",
              },
              {
                key: "admin" as const,
                id: "sbu-portal-admin-tab",
                panelId: "sbu-portal-admin-panel",
                Icon: Award,
                label: "ANO / Officer",
                hint: "Command access",
              },
            ].map(({ key, id, panelId, Icon, label, hint }, index, tabs) => {
              const isActive = activeSection === key;
              const focusTab = (nextIndex: number) => {
                const next = tabs[(nextIndex + tabs.length) % tabs.length];
                const el = document.getElementById(next.id) as HTMLButtonElement | null;
                el?.focus();
                switchSection(next.key);
              };
              return (
                <button
                  key={key}
                  id={id}
                  type="button"
                  role="tab"
                  onClick={() => switchSection(key)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                      event.preventDefault();
                      focusTab(index + 1);
                    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                      event.preventDefault();
                      focusTab(index - 1);
                    } else if (event.key === "Home") {
                      event.preventDefault();
                      focusTab(0);
                    } else if (event.key === "End") {
                      event.preventDefault();
                      focusTab(tabs.length - 1);
                    }
                  }}
                  disabled={isSwitchingPortal || authPending !== null}
                  aria-selected={isActive}
                  aria-controls={panelId}
                  aria-label={`${label} — ${hint}`}
                  tabIndex={isActive ? 0 : -1}
                  className={`group relative z-10 flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[13px] px-2 py-2 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70 ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs font-semibold">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-card/70 text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {label}
                  </span>
                  <span
                    className={`text-[10px] font-medium tracking-wide transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground/70"
                    }`}
                  >
                    {hint}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Notice banner */}
          {noticeMessage && (
            <div
              role="status"
              aria-live="polite"
              className={`mb-6 flex flex-wrap items-start gap-x-2 gap-y-3 rounded-[14px] border px-3.5 py-3 text-xs font-medium ${
                noticeMessage.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {noticeMessage.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span className="min-w-0 flex-1">{noticeMessage.text}</span>
              {noticeMessage.type === "error" && retryAction && (
                <button
                  type="button"
                  onClick={retryAction.run}
                  disabled={authPending !== null || isSwitchingPortal}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] border border-destructive/30 bg-card px-2.5 py-1.5 text-[11px] font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${authPending !== null ? "animate-spin" : ""}`}
                  />
                  {retryAction.label}
                </button>
              )}
            </div>
          )}

          {/* SECTION 1: CADETS */}
          {/* Portal swap skeleton — holds the panel geometry while sections switch */}
          {isSwitchingPortal && <AuthFormSkeleton label="Loading portal" showTabs />}

          {/* Password recovery takes over the panel while active */}
          {recovery.open && !isSwitchingPortal && renderRecoveryPanel()}

          <AnimatePresence mode="wait">
            {activeSection === "cadets" && !isSwitchingPortal && !recovery.open && (
              <motion.div
                key="cadets"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1"
                id="sbu-portal-cadets-panel"
                role="tabpanel"
                aria-labelledby="sbu-portal-cadets-tab"
                tabIndex={0}
              >
                <div className="mb-8 flex gap-6 border-b border-border">
                  <button
                    type="button"
                    onClick={() => setCadetMode("login")}
                    className={subTabClass(cadetMode === "login")}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setCadetMode("signup")}
                    className={subTabClass(cadetMode === "signup")}
                  >
                    Register
                  </button>
                </div>

                {/* CADET MODE: SIGN IN */}
                {cadetMode === "login" && authPending === "cadet" && (
                  <AuthFormSkeleton label="Verifying cadet credentials" />
                )}

                {cadetMode === "login" && authPending !== "cadet" && (
                  <form onSubmit={handleCadetLogin} className="space-y-6">
                    <div className="label-lift-parent">
                      <label className={labelClass} htmlFor="cadet-identifier">
                        NCC Enrolment No*
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          id="cadet-identifier"
                          type="text"
                          required
                          value={cadetIdentifier}
                          onChange={(e) => setCadetIdentifier(e.target.value)}
                          placeholder="JH24SDA104201"
                          className={fieldWithIconClass}
                        />
                      </div>
                    </div>

                    <div className="label-lift-parent">
                      <label className={labelClass} htmlFor="cadet-password">
                        Portal Password
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          id="cadet-password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={cadetPassword}
                          onChange={(e) => setCadetPassword(e.target.value)}
                          placeholder="Enter password"
                          className={`${fieldWithIconClass} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className={submitClass} id="cadet-signin-submit-btn">
                      <UserCheck className="h-4 w-4" />
                      <span>Sign in to cadet portal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openRecovery("cadet")}
                      className="w-full text-center text-[12px] font-semibold text-primary transition-colors hover:underline cursor-pointer"
                      id="cadet-forgot-password-btn"
                    >
                      Forgot password?
                    </button>

                    <p className="text-center text-[13px] text-muted-foreground">
                      New to the unit?{" "}
                      <button
                        type="button"
                        onClick={() => setCadetMode("signup")}
                        className="font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Register as cadet
                      </button>
                    </p>
                  </form>
                )}

                {/* CADET MODE: REGISTRATION */}
                {cadetMode === "signup" && (
                  <form onSubmit={handleCadetSignup} className="space-y-5">
                    <div>
                      <label className={labelClass}>NCC Enrolment No*</label>
                      <input
                        type="text"
                        required
                        value={cadetForm.sbuRollNo}
                        onChange={(e) => setCadetForm({ ...cadetForm, sbuRollNo: e.target.value })}
                        placeholder="JH24SDA104201"
                        className={fieldClass}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Full Name*</label>
                        <input
                          type="text"
                          required
                          value={cadetForm.fullName}
                          onChange={(e) => setCadetForm({ ...cadetForm, fullName: e.target.value })}
                          placeholder="Aman Sharma"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Division / Wing*</label>
                        <select
                          value={cadetForm.gender}
                          onChange={(e) => setCadetForm({ ...cadetForm, gender: e.target.value })}
                          className={fieldClass}
                        >
                          <option value="SD">Senior Division (SD)</option>
                          <option value="SW">Senior Wing (SW)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Mobile No*</label>
                        <input
                          type="tel"
                          required
                          value={cadetForm.mobile}
                          onChange={(e) => setCadetForm({ ...cadetForm, mobile: e.target.value })}
                          placeholder="9431100223"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Official Email*</label>
                        <input
                          type="email"
                          required
                          value={cadetForm.email}
                          onChange={(e) => setCadetForm({ ...cadetForm, email: e.target.value })}
                          placeholder="aman@sbu.ac.in"
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Password*</label>
                        <input
                          type="password"
                          required
                          value={cadetForm.password}
                          onChange={(e) => setCadetForm({ ...cadetForm, password: e.target.value })}
                          placeholder="Create password"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Confirm Password*</label>
                        <input
                          type="password"
                          required
                          value={cadetForm.confirmPassword}
                          onChange={(e) =>
                            setCadetForm({ ...cadetForm, confirmPassword: e.target.value })
                          }
                          placeholder="Repeat password"
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <button type="submit" className={submitClass} id="cadet-signup-submit-btn">
                      <span>Complete registration &amp; apply</span>
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {activeSection === "admin" && !isSwitchingPortal && !recovery.open && (
              <motion.div
                key="admin"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1"
                id="sbu-portal-admin-panel"
                role="tabpanel"
                aria-labelledby="sbu-portal-admin-tab"
                tabIndex={0}
              >
                <div className="mb-8 flex gap-6 border-b border-border">
                  <button
                    type="button"
                    onClick={() => setAdminMode("login")}
                    className={subTabClass(adminMode === "login")}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminMode("signup")}
                    className={subTabClass(adminMode === "signup")}
                  >
                    Request Access
                  </button>
                </div>

                {adminMode === "login" && authPending === "admin" && (
                  <AuthFormSkeleton label="Verifying officer command credentials" />
                )}

                {adminMode === "login" && authPending !== "admin" && (
                  <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div>
                      <label className={labelClass} htmlFor="officer-identifier">
                        Officer Email / Username
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          id="officer-identifier"
                          type="text"
                          required
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          placeholder="ano.ncc@sbu.ac.in"
                          className={fieldWithIconClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="officer-password">
                        Battalion Command Security Key
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          id="officer-password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Enter command key"
                          className={`${fieldWithIconClass} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide security key" : "Show security key"}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className={submitClass} id="admin-signin-submit-btn">
                      <Award className="h-4 w-4" />
                      <span>Officer command access</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openRecovery("admin")}
                      className="w-full text-center text-[12px] font-semibold text-primary transition-colors hover:underline cursor-pointer"
                      id="admin-forgot-password-btn"
                    >
                      Forgot command key?
                    </button>
                  </form>
                )}

                {adminMode === "signup" && (
                  <form onSubmit={handleAdminSignup} className="space-y-5">
                    <div>
                      <label className={labelClass}>Officer Name &amp; Rank*</label>
                      <input
                        type="text"
                        required
                        value={adminForm.fullName}
                        onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                        placeholder="Lt. / Capt. Officer Name"
                        className={fieldClass}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Employee ID*</label>
                        <input
                          type="text"
                          required
                          value={adminForm.employeeId}
                          onChange={(e) =>
                            setAdminForm({ ...adminForm, employeeId: e.target.value })
                          }
                          placeholder="SBU-EMP-042"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Official Email*</label>
                        <input
                          type="email"
                          required
                          value={adminForm.email}
                          onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                          placeholder="ano@sbu.ac.in"
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <button type="submit" className={submitClass} id="admin-signup-submit-btn">
                      <span>Submit authorization request</span>
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* IT support keyline */}
          <div className="mt-12 flex items-center gap-4">
            <div className="flex-1 divider-gradient" />
            <p className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
              Support{" "}
              <a
                href="mailto:itsupport@sbu.ac.in"
                className="font-semibold text-primary hover:underline"
              >
                itsupport@sbu.ac.in
              </a>{" "}
              ·{" "}
              <a
                href="mailto:co.19jhrbn@ncc.gov.in"
                className="font-semibold text-primary hover:underline"
              >
                19 JHR BN HQ
              </a>
            </p>
            <div className="flex-1 divider-gradient" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
