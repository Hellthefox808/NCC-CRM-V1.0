import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowRight,
  Mail,
  FileCheck,
  Scroll,
  Compass,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  KeyRound,
  UserCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  EnterpriseDataPlatform,
  type OnboardingProgressData,
  type OnboardingStepDetail,
} from "@backend/services/dataPlatform";

interface CadetOnboardingCardProps {
  cadetId?: string;
  identifier?: string;
  onStatusChange?: (isComplete: boolean) => void;
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  profile_completed: <UserCheck className="w-4 h-4" />,
  contact_verified: <Mail className="w-4 h-4" />,
  documents_verified: <FileCheck className="w-4 h-4" />,
  declaration_accepted: <Scroll className="w-4 h-4" />,
  orientation_completed: <Compass className="w-4 h-4" />,
};

export const CadetOnboardingCard: React.FC<CadetOnboardingCardProps> = ({
  cadetId,
  identifier = "",
  onStatusChange,
}) => {
  const [data, setData] = useState<OnboardingProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OTP Verification Inline State
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpRequesting, setOtpRequesting] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await EnterpriseDataPlatform.getOnboardingProgress(cadetId);
      if (res.success && res.data) {
        setData(res.data);
        onStatusChange?.(res.data.isComplete);
        if (res.data.isComplete) {
          setExpanded(false); // collapse if already complete
        }
      } else {
        setErrorMessage(res.message || "Failed to load onboarding progress.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching induction progress.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [cadetId, onStatusChange]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Handle countdown timer for OTP resend
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleToggleStep = async (step: OnboardingStepDetail) => {
    // If it's contact verification and not verified, open the OTP box instead of manual toggle
    if (step.id === "contact_verified" && !step.completed && !showOtpBox) {
      setShowOtpBox(true);
      return;
    }

    try {
      setUpdatingStep(step.id);
      setErrorMessage(null);
      const res = await EnterpriseDataPlatform.updateOnboardingStep(step.id, {
        completed: !step.completed,
        cadetId: data?.cadetId || cadetId,
      });

      if (res.success && res.data) {
        setData(res.data);
        onStatusChange?.(res.data.isComplete);
        if (res.data.isComplete) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } else {
        setErrorMessage(res.message || "Failed to update step.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating step.";
      setErrorMessage(msg);
    } finally {
      setUpdatingStep(null);
    }
  };

  const handleRequestOtp = async () => {
    const targetIdentifier = identifier || data?.cadetId || cadetId;
    if (!targetIdentifier) {
      setOtpMessage("Identification required to send verification code.");
      return;
    }

    try {
      setOtpRequesting(true);
      setOtpMessage(null);
      const res = await EnterpriseDataPlatform.requestOtp({
        identifier: targetIdentifier,
        purpose: "onboarding",
      });

      if (res.success && res.data) {
        setOtpCooldown(res.data.cooldownSeconds || 45);
        setOtpMessage(`Code sent! ${res.data.emailMasked ? `To ${res.data.emailMasked}` : ""}`);
      } else {
        setOtpMessage(res.message || "Failed to dispatch verification code.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error requesting OTP.";
      setOtpMessage(msg);
    } finally {
      setOtpRequesting(false);
    }
  };

  const handleVerifyOtp = async () => {
    const targetIdentifier = identifier || data?.cadetId || cadetId;
    if (!targetIdentifier || !otpCode.trim()) {
      setOtpMessage("Please enter the 6-digit OTP code.");
      return;
    }

    try {
      setOtpVerifying(true);
      setOtpMessage(null);
      const res = await EnterpriseDataPlatform.verifyOtp({
        identifier: targetIdentifier,
        otp: otpCode.trim(),
        purpose: "onboarding",
      });

      if (res.success && res.data?.verified) {
        setOtpMessage("Contact verified successfully!");
        setShowOtpBox(false);
        setOtpCode("");
        // Reload progress
        await fetchProgress();
      } else {
        setOtpMessage(res.message || "Verification code is incorrect or expired.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error verifying OTP code.";
      setOtpMessage(msg);
    } finally {
      setOtpVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 flex items-center justify-center gap-3 text-xs text-zinc-400">
        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
        <span>Syncing 19 JHR BN NCC Cadet Induction Records...</span>
      </div>
    );
  }

  if (!data) return null;

  const isComplete = data.isComplete;

  return (
    <article className="surface-inverse relative overflow-hidden rounded-3xl border border-inverse-border shadow-xl backdrop-blur-xl transition-all">
      {/* Subtle ambient lighting */}
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl ${
          isComplete ? "bg-emerald-500" : "bg-blue-600"
        }`}
        aria-hidden
      />

      <header className="relative flex items-center justify-between p-5 border-b border-inverse-border/60">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              isComplete
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/20 shadow-md"
                : "border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-blue-500/20 shadow-md"
            }`}
          >
            {isComplete ? <ShieldCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isComplete
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                }`}
              >
                {isComplete ? "INDUCTION COMPLETE • ACTIVE" : "CADET INDUCTION IN PROGRESS"}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {data.completedStepsCount}/{data.totalStepsCount} Steps
              </span>
            </div>
            <h3 className="font-display text-base font-semibold text-white tracking-tight mt-0.5">
              19 JHR BN NCC Induction &amp; Readiness
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchProgress}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Refresh induction state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-inverse-border bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
          >
            <span>{expanded ? "Hide" : "Review"}</span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* Progress Bar Line */}
      <div className="h-1.5 w-full bg-white/5 relative">
        <div
          className={`h-full transition-all duration-500 rounded-r-full ${
            isComplete
              ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50"
              : "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm shadow-blue-500/50"
          }`}
          style={{ width: `${data.progressPercentage}%` }}
        />
      </div>

      {/* Expandable Step List */}
      {expanded && (
        <div className="p-5 space-y-4">
          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actionable Next Step Suggestion */}
          {data.nextStep && !isComplete && (
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 font-bold text-[11px]">
                  Next
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{data.nextStep.name}</p>
                  <p className="text-[11px] text-zinc-300 truncate">{data.nextStep.description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => data.nextStep && handleToggleStep(data.nextStep)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <span>Complete</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Step Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {data.checklist.map((step, idx) => {
              const Icon = STEP_ICONS[step.id] || <Circle className="w-4 h-4" />;
              const isUpdating = updatingStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`rounded-2xl border p-3.5 flex flex-col justify-between gap-3 transition-all ${
                    step.completed
                      ? "border-emerald-500/30 bg-emerald-950/20 text-zinc-300"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
                        {Icon}
                        <span>Step {idx + 1}</span>
                      </span>
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-500 shrink-0" />
                      )}
                    </div>
                    <h4
                      className={`text-xs font-semibold tracking-tight ${
                        step.completed ? "text-white line-through opacity-80" : "text-white"
                      }`}
                    >
                      {step.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2">
                      {step.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleToggleStep(step)}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                      step.completed
                        ? "bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                    }`}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : step.completed ? (
                      "Mark Incomplete"
                    ) : step.id === "contact_verified" ? (
                      "Verify with OTP"
                    ) : (
                      "Confirm Step"
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Inline OTP Verification Drawer */}
          {showOtpBox && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">
                    Contact Verification via Secure OTP
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOtpBox(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
              </div>

              <p className="text-[11px] text-zinc-300">
                A one-time passcode is dispatched to your registered email or mobile to confirm
                authenticity before induction sign-off.
              </p>

              {otpMessage && (
                <div className="text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                  {otpMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit OTP"
                  className="bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 w-36 text-center font-mono tracking-widest"
                />

                <button
                  type="button"
                  disabled={otpVerifying || otpCode.length !== 6}
                  onClick={handleVerifyOtp}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {otpVerifying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Verify OTP</span>
                </button>

                <button
                  type="button"
                  disabled={otpRequesting || otpCooldown > 0}
                  onClick={handleRequestOtp}
                  className="bg-white/10 hover:bg-white/15 text-zinc-200 px-3 py-2 rounded-xl text-xs font-medium border border-white/10 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  {otpRequesting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : otpCooldown > 0 ? (
                    `Resend in ${otpCooldown}s`
                  ) : (
                    "Send OTP Code"
                  )}
                </button>
              </div>
            </div>
          )}

          {isComplete && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-300">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  All induction standards fulfilled. Account authorized for full operational access,
                  examinations, and camp nomination.
                </span>
              </div>
              <span className="shrink-0 font-mono font-bold text-[11px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-lg">
                19 JHR BN NCC ACTIVE
              </span>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
