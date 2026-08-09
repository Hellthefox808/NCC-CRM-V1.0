import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import {
  saveEncryptedDraft,
  loadEncryptedDraft,
  clearEncryptedDraft,
} from "@backend/lib/draft-crypto";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@frontend/components/ui/alert-dialog";
import {
  Check,
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  Heart,
  HeartPulse,
  Info,
  Printer,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { CadetRecord } from "@/types";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";

const DRAFT_KEY = "ncc-enrollment-draft-v3";
const LEGACY_DRAFT_KEY = "ncc-enrollment-draft-v2";
const DRAFT_SCHEMA_VERSION = "enroll-2026.3";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // auto-expires after 24 hours
const SENSITIVE_FIELDS = ["aadhaarNumber", "accountNumber"] as const;

interface EnrollmentFormProps {
  onSuccessSubmitted?: (record: CadetRecord) => void;
  onSuccess?: (record: CadetRecord) => void;
  onCancel?: () => void;
  onOpenPrintableSlip?: (record: CadetRecord) => void;
  openStatusModalWithQuery?: (query: string) => void;
}

export const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  onSuccessSubmitted,
  onOpenPrintableSlip,
  openStatusModalWithQuery,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<CadetRecord | null>(null);

  // Form State - Clean blank form for real cadet applications
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "SD" as "SD" | "SW",
    dob: "",
    aadhaarNumber: "",
    mobile: "",
    email: "",
    fatherName: "",
    motherName: "",
    bloodGroup: "O+",
    heightCm: "",
    weightKg: "",
    identificationMark: "",

    // SBU Academic
    sbuDepartment: "",
    sbuCourse: "",
    sbuRollNo: "",
    sbuYear: "1st Year",
    sbuSemester: "1st Sem",
    marksPercentage10th: "",
    marksPercentage12th: "",

    // Physical & Co-curricular
    run1600mTime: "",
    pushupsCount: "",
    hasJuniorCertificate: false,
    juniorCertificateNo: "",
    sportsLevel: "None" as "None" | "College" | "District" | "State" | "National",
    sportsDetails: "",

    // Address & Bank
    presentAddress: "",
    permanentAddress: "",
    pinCode: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",

    // Guardian
    guardianName: "",
    guardianRelation: "Father",
    guardianMobile: "",

    // Consent
    declarationAccepted: false,
    parentConsentAccepted: false,
  });

  // ---- Draft persistence (client-only, survives refresh) ----
  // Stored AES-GCM encrypted under a non-extractable browser key, so the blob
  // is unreadable from devtools/storage. Sensitive IDs are still never written.
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftExpiresAt, setDraftExpiresAt] = useState<number | null>(null);
  const [draftDiscarded, setDraftDiscarded] = useState<"expired" | "schema-changed" | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const hydratedRef = useRef(false);

  const clearDraft = async () => {
    await clearEncryptedDraft(DRAFT_KEY);
    setDraftRestored(false);
    setDraftExpiresAt(null);
    setDraftDiscarded(null);
  };

  // Hydrate once after mount (keeps SSR markup stable).
  useEffect(() => {
    let cancelled = false;
    // Purge any pre-encryption plaintext draft left by older builds.
    // Only drop the localStorage item — the legacy draft was never encrypted,
    // so deleting the IndexedDB crypto key would break the current encrypted draft.
    try {
      window.localStorage.removeItem(LEGACY_DRAFT_KEY);
    } catch {
      /* ignore */
    }
    void loadEncryptedDraft<{ activeStep?: number; formData?: Record<string, unknown> }>(
      DRAFT_KEY,
      {
        schemaVersion: DRAFT_SCHEMA_VERSION,
      },
    )
      .then((result) => {
        if (cancelled) return;
        if (result.discarded) {
          setDraftDiscarded(result.discarded);
          return;
        }
        const saved = result.data;
        if (saved) {
          if (saved.formData && typeof saved.formData === "object") {
            setFormData((prev) => ({ ...prev, ...saved.formData }));
          }
          if (
            typeof saved.activeStep === "number" &&
            saved.activeStep >= 1 &&
            saved.activeStep <= 5
          ) {
            setActiveStep(saved.activeStep);
          }
          if (saved.formData || saved.activeStep) setDraftRestored(true);
          if (result.expiresAt) setDraftExpiresAt(result.expiresAt);
        }
      })
      .finally(() => {
        hydratedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist step + answers on every change once hydrated.
  useEffect(() => {
    if (!hydratedRef.current || submittedRecord) return;
    const safeData: Record<string, unknown> = { ...formData };
    SENSITIVE_FIELDS.forEach((f) => {
      delete safeData[f];
    });
    void saveEncryptedDraft(
      DRAFT_KEY,
      { activeStep, formData: safeData, savedAt: Date.now() },
      { schemaVersion: DRAFT_SCHEMA_VERSION, ttlMs: DRAFT_TTL_MS },
    ).then((ok) => {
      if (ok) setDraftExpiresAt(Date.now() + DRAFT_TTL_MS);
    });
  }, [formData, activeStep, submittedRecord]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Instant Physical Rating Estimator
  const getPhysicalRating = () => {
    const height = Number(formData.heightCm) || 0;
    const runSec = formData.run1600mTime.includes("5 min") ? 5 : 6;
    if (formData.gender === "SD") {
      if (height >= 170 && runSec <= 5)
        return {
          rating: "Excellent (Grade A)",
          color: "text-emerald-700 bg-emerald-50 border-emerald-300",
        };
      if (height >= 168)
        return { rating: "Good (Eligible)", color: "text-zinc-900 bg-blue-50 border-blue-300" };
      return {
        rating: "Height Relaxation Subject to Tribal/State Norms",
        color: "text-blue-700 bg-blue-50 border-blue-300",
      };
    } else {
      if (height >= 152)
        return {
          rating: "Eligible for Senior Wing (SW)",
          color: "text-emerald-700 bg-emerald-50 border-emerald-300",
        };
      return {
        rating: "Height Relaxation as per Army Norms",
        color: "text-blue-700 bg-blue-50 border-blue-300",
      };
    }
  };

  // ---- Per-step required-field validation --------------------------------
  // Pure: validation never touches the autosave effect, so drafts keep saving
  // in the background even while a step is invalid.
  const validateStep = (step: number, data: typeof formData): Record<string, string> => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!data.fullName.trim())
        e.fullName = "Enter the cadet's full name as printed on the Aadhaar card.";
      const aadhaar = data.aadhaarNumber.replace(/\s/g, "");
      if (!aadhaar) e.aadhaarNumber = "Aadhaar number is required for Form 1 verification.";
      else if (!/^\d{12}$/.test(aadhaar)) e.aadhaarNumber = "Aadhaar must be exactly 12 digits.";
      const mobile = data.mobile.replace(/\s/g, "");
      if (!mobile) e.mobile = "A WhatsApp-enabled mobile number is required for camp calls.";
      else if (!/^[6-9]\d{9}$/.test(mobile))
        e.mobile = "Enter a valid 10-digit Indian mobile number.";
      if (!data.fatherName.trim())
        e.fatherName = "Father's name is required on the enrollment form.";
    }
    if (step === 2) {
      if (!data.sbuCourse.trim())
        e.sbuCourse = "Enter the course / program you are enrolled in at SBU.";
      if (!data.sbuRollNo.trim())
        e.sbuRollNo = "Enter your SBU university roll / registration number.";
    }
    if (step === 3) {
      const h = Number(data.heightCm);
      if (!data.heightCm.toString().trim()) e.heightCm = "Height is required for PET benchmarking.";
      else if (!Number.isFinite(h) || h < 140 || h > 220)
        e.heightCm = "Enter a height between 140 cm and 220 cm.";
    }
    if (step === 4) {
      if (!data.bankName.trim())
        e.bankName = "Bank name is required for camp allowance DBT transfer.";
      const acct = data.accountNumber.replace(/\s/g, "");
      if (!acct) e.accountNumber = "Account number is required for DBT payment of camp allowance.";
      else if (!/^\d{9,18}$/.test(acct)) e.accountNumber = "Account number must be 9–18 digits.";
      if (!data.presentAddress.trim())
        e.presentAddress = "Enter your present residence address in Ranchi / hostel.";
    }
    return e;
  };

  const stepErrors = validateStep(activeStep, formData);
  const isStepValid = Object.keys(stepErrors).length === 0;
  // Show an error only after the field was touched or the user pressed Next.
  const visibleErrors: Record<string, string> = Object.fromEntries(
    Object.entries(stepErrors).filter(([field]) => showAllErrors || touched[field]),
  );

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const FieldError: React.FC<{ id: string; message?: string }> = ({ id, message }) =>
    message ? (
      <p
        id={id}
        role="alert"
        className="flex items-start gap-1.5 text-[11px] font-semibold text-red-600 leading-snug"
      >
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
        <span>{message}</span>
      </p>
    ) : null;

  const handleNextStep = () => {
    setErrorMessage("");
    const errs = validateStep(activeStep, formData);
    if (Object.keys(errs).length > 0) {
      setShowAllErrors(true);
      setErrorMessage(
        `Complete ${Object.keys(errs).length} required field${Object.keys(errs).length > 1 ? "s" : ""} on this step to continue. Your progress is still being saved.`,
      );
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setShowAllErrors(false);
    setActiveStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage("");
    setShowAllErrors(false);
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.declarationAccepted || !formData.parentConsentAccepted) {
      return setErrorMessage(
        "Please check both Declaration and Parent/Guardian Consent checkboxes.",
      );
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        heightCm: Number(formData.heightCm),
        weightKg: Number(formData.weightKg),
        marksPercentage10th: Number(formData.marksPercentage10th),
        marksPercentage12th: Number(formData.marksPercentage12th),
        pushupsCount: Number(formData.pushupsCount),
        permanentAddress: formData.permanentAddress || formData.presentAddress,
        guardianName: formData.guardianName || formData.fatherName,
        guardianMobile: formData.guardianMobile || formData.mobile,
      };

      const res = await EnterpriseDataPlatform.submitEnrollment(payload);

      if (!res.success || !res.data?.enrollment) {
        throw new Error(res.error || "Failed to submit enrollment application.");
      }

      await clearDraft();
      setSubmittedRecord(res.data.enrollment);
      onSuccessSubmitted?.(res.data.enrollment);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred while submitting the application.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      num: 1,
      label: "Personal",
      shortLabel: "Personal",
      title: "Personal Identification",
      description:
        "Provide your official details as per your Aadhaar or school leaving certificate.",
    },
    {
      num: 2,
      label: "Academic",
      shortLabel: "Academic",
      title: "Academic Information",
      description: "Share your SBU course, roll number, and matriculation records.",
    },
    {
      num: 3,
      label: "Physical",
      shortLabel: "Physical",
      title: "Physical Fitness & Co-Curricular",
      description:
        "Enter height, weight, run time, and any sports or NCC Junior certificate details.",
    },
    {
      num: 4,
      label: "Bank & Address",
      shortLabel: "Bank",
      title: "Bank DBT Details & Address",
      description:
        "Provide bank account information for camp allowance transfers and your residence address.",
    },
    {
      num: 5,
      label: "Consent",
      shortLabel: "Consent",
      title: "Declarations & Consent",
      description: "Confirm the cadet declaration and parent/guardian consent to complete Form 1.",
    },
  ];

  const currentStep = steps.find((s) => s.num === activeStep) || steps[0];

  type StepRefs = React.MutableRefObject<Record<number, HTMLButtonElement | null>>;
  const stepRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const desktopStepRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  // Roving-tabindex keyboard navigation across reachable (completed/current) steps.
  const handleStepperKeyDown = (
    e: React.KeyboardEvent,
    orientation: "vertical" | "horizontal",
    refs: StepRefs = stepRefs,
  ) => {
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const reachable = steps.filter((s) => s.num <= activeStep).map((s) => s.num);
    if (reachable.length === 0) return;

    let target: number | null = null;
    if (e.key === nextKey) {
      const i = reachable.indexOf(activeStep);
      target = reachable[Math.min(i + 1, reachable.length - 1)];
    } else if (e.key === prevKey) {
      const i = reachable.indexOf(activeStep);
      target = reachable[Math.max(i - 1, 0)];
    } else if (e.key === "Home") {
      target = reachable[0];
    } else if (e.key === "End") {
      target = reachable[reachable.length - 1];
    }

    if (target !== null) {
      e.preventDefault();
      setActiveStep(target);
      requestAnimationFrame(() => refs.current[target as number]?.focus());
    }
  };

  return (
    <section
      className="min-h-screen w-full flex bg-enrollment-surface font-enrollment-body text-enrollment-primary"
      id="enrollment-section"
    >
      {/* Left Sidebar / Hero - Ultra-Clear HD SBU & NCC Regimental Section with Motion Effects */}
      <aside className="hidden lg:flex w-[40%] bg-zinc-950 p-8 xl:p-12 flex-col justify-between sticky top-0 h-screen overflow-hidden relative">
        {/* Slow-Zoom Motion Camera Background Image */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-105 contrast-110 saturate-[1.1]"
          style={{ backgroundImage: `url('/sbu-campus-front.jpg')` }}
          role="img"
          aria-label="Sarala Birla University Campus, Ranchi"
        />
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-[#0f2415]/30 to-black/75" />

        {/* High-Contrast Glassmorphic Container for 100% Text Legibility */}
        <div className="relative z-10 bg-[#09150c]/80 backdrop-blur-xl border border-emerald-500/30 p-6 sm:p-8 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] ring-1 ring-white/10 my-auto">
          {/* Identity Block with SBU & NCC Crest Logos */}
          <div className="mb-8">
            <div className="flex items-center gap-3.5 mb-5">
              {/* SBU Official Emblem Logo */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative w-14 h-14 rounded-full bg-white p-1 shadow-2xl border-2 border-emerald-400 ring-2 ring-black/40 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_5fO3j9MhxWCOALUorfuM3nZcChQfc2949oaRRyjpIQ&s=10"
                  alt="Sarala Birla University Emblem"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              <div className="h-8 w-0.5 bg-white/40 shadow-sm" />

              {/* NCC Official Crest Emblem Logo */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative w-14 h-14 rounded-full bg-white p-1 shadow-2xl border-2 border-amber-400 ring-2 ring-black/40 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZDvUjTIPyVWknpreMHXnyKTvz7-P_uljpSxjPHcXXw&s=10"
                  alt="19 JHR BN NCC Crest"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-400 text-xs font-black tracking-[0.22em] uppercase mb-1.5 font-enrollment-display flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>19 Jharkhand Battalion NCC</span>
            </motion.h2>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl xl:text-4xl font-black text-white leading-tight font-enrollment-display tracking-tight drop-shadow-md"
            >
              Cadet Enrollment
              <br />
              Application
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-3.5 inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 px-3.5 py-1 rounded-full text-emerald-300 font-extrabold text-xs tracking-wide"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sarala Birla University, Ranchi</span>
            </motion.div>
          </div>

          {/* Vertical Stepper */}
          <nav aria-label="Enrollment steps">
            <div
              role="tablist"
              aria-orientation="vertical"
              onKeyDown={(e) => handleStepperKeyDown(e, "vertical", desktopStepRefs)}
              className="space-y-6 relative"
            >
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/20" />
              <motion.div
                className="absolute left-[11px] top-2 w-px bg-enrollment-accent origin-top"
                initial={false}
                animate={{ height: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
                style={{ bottom: "auto" }}
                aria-hidden="true"
              />
              {steps.map((s) => {
                const isActive = activeStep === s.num;
                const isCompleted = activeStep > s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="enroll-step-panel"
                    aria-label={`Step ${s.num}: ${s.label} Details${isCompleted ? " (completed)" : isActive ? " (current)" : " (locked)"}`}
                    tabIndex={isActive ? 0 : -1}
                    ref={(el) => {
                      desktopStepRefs.current[s.num] = el;
                    }}
                    disabled={!isCompleted && !isActive}
                    onClick={() => isCompleted && setActiveStep(s.num)}
                    className={`relative flex items-center gap-4 group w-full text-left rounded-xl outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-enrollment-accent focus-visible:ring-offset-2 focus-visible:ring-offset-enrollment-primary ${
                      isCompleted
                        ? "opacity-100 cursor-pointer hover:translate-x-0.5"
                        : isActive
                          ? "opacity-100"
                          : "opacity-60 cursor-default"
                    }`}
                  >
                    <motion.div
                      initial={false}
                      animate={{ scale: isActive ? 1.15 : 1 }}
                      transition={{ type: "spring", stiffness: 340, damping: 22 }}
                      className={`w-6 h-6 rounded-full z-10 flex items-center justify-center transition-colors duration-300 ${
                        isActive
                          ? "bg-enrollment-accent ring-4 ring-enrollment-accent/30 shadow-lg shadow-emerald-500/40"
                          : isCompleted
                            ? "bg-enrollment-accent"
                            : "bg-white/20"
                      }`}
                    >
                      {isCompleted ? (
                        <Check
                          className="w-3.5 h-3.5 text-white"
                          strokeWidth={3}
                          aria-hidden="true"
                        />
                      ) : (
                        <div
                          className={`w-2 h-2 rounded-full ${isActive ? "bg-white" : "bg-white/40"}`}
                        />
                      )}
                    </motion.div>
                    <span className="flex flex-col">
                      <span
                        className={`text-sm font-bold transition-colors duration-300 ${
                          isActive ? "text-white" : isCompleted ? "text-white/90" : "text-white/70"
                        }`}
                      >
                        {s.label} Details
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-400">
                        {isCompleted ? "Completed" : isActive ? "In progress" : "Locked"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="relative z-10 text-white/80 text-[11px] font-black tracking-[0.18em] uppercase font-mono drop-shadow-sm flex items-center justify-between">
          <span>Discipline · Service · Unity</span>
          <span className="text-emerald-400 font-extrabold">2026-27</span>
        </div>
      </aside>

      {/* Right Content / Form */}
      <main className="flex-1 p-6 md:p-10 lg:p-16 xl:p-20 overflow-y-auto bg-white lg:rounded-l-[48px] shadow-2xl z-20">
        <div className="max-w-2xl mx-auto pb-40">
          {submittedRecord ? (
            /* Successful Submission View */
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-enrollment-accent/10 text-enrollment-accent flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-enrollment-primary font-enrollment-display leading-tight">
                    Application Submitted Successfully
                  </h2>
                  <p className="text-sm text-enrollment-muted mt-1">
                    Registered with 19 Jharkhand Battalion NCC, Ranchi
                  </p>
                </div>
              </div>

              <div className="bg-enrollment-surface border border-enrollment-accent/20 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-enrollment-muted text-xs font-bold uppercase tracking-wider mb-1">
                      Application Tracking ID
                    </p>
                    <p className="text-xl font-black text-enrollment-primary tracking-wide font-mono">
                      {submittedRecord.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-enrollment-muted text-xs font-bold uppercase tracking-wider mb-1">
                      Cadet Full Name
                    </p>
                    <p className="text-base font-bold text-enrollment-primary">
                      {submittedRecord.fullName} ({submittedRecord.gender})
                    </p>
                  </div>
                  <div>
                    <p className="text-enrollment-muted text-xs font-bold uppercase tracking-wider mb-1">
                      SBU Roll Number
                    </p>
                    <p className="text-sm font-bold text-enrollment-primary">
                      {submittedRecord.sbuRollNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-enrollment-muted text-xs font-bold uppercase tracking-wider mb-1">
                      Application Status
                    </p>
                    <span className="inline-block bg-enrollment-accent/10 text-enrollment-primary border border-enrollment-accent/20 font-bold px-3 py-1 rounded-full text-xs">
                      {submittedRecord.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white border border-enrollment-accent/15 rounded-2xl text-sm text-enrollment-primary/80 leading-relaxed">
                  <strong className="text-enrollment-primary font-bold">
                    Next Physical Verification Steps:
                  </strong>{" "}
                  Please take a printout of your Form 1 application slip below. Bring original
                  10th/12th marksheets, Aadhaar card, SBU Student ID card, Bank passbook photocopy,
                  and medical fitness certificate to SBU Sports Ground on parade day at 06:00 AM.
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onOpenPrintableSlip?.(submittedRecord)}
                  className="bg-enrollment-primary hover:bg-enrollment-primary-hover text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-enrollment-primary/15 transition-colors"
                  id="print-form-slip-btn"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Form 1 Slip</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => openStatusModalWithQuery?.(submittedRecord.id)}
                  className="bg-enrollment-accent/10 hover:bg-enrollment-accent/20 text-enrollment-primary border border-enrollment-accent/20 font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2 transition-colors"
                  id="track-new-application-btn"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Track Application Online</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={async () => {
                    await clearDraft();
                    setSubmittedRecord(null);
                    setActiveStep(1);
                  }}
                  className="bg-white hover:bg-enrollment-surface text-enrollment-primary border border-enrollment-primary/10 font-bold px-5 py-3 rounded-xl text-sm transition-colors"
                >
                  Submit Another Application
                </motion.button>
              </div>
            </div>
          ) : (
            /* Multi-Step Form */
            <div className="space-y-8">
              {/* Mobile Stepper */}
              <div className="lg:hidden">
                <div
                  role="tablist"
                  aria-label="Enrollment steps"
                  aria-orientation="horizontal"
                  onKeyDown={(e) => handleStepperKeyDown(e, "horizontal")}
                  className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
                >
                  {steps.map((s) => {
                    const isActive = activeStep === s.num;
                    const isCompleted = activeStep > s.num;
                    return (
                      <button
                        key={s.num}
                        type="button"
                        role="tab"
                        id={`enroll-step-tab-${s.num}`}
                        aria-selected={isActive}
                        aria-controls="enroll-step-panel"
                        aria-label={`Step ${s.num}: ${s.label}${isCompleted ? " (completed)" : isActive ? " (current)" : " (locked)"}`}
                        tabIndex={isActive ? 0 : -1}
                        ref={(el) => {
                          stepRefs.current[s.num] = el;
                        }}
                        disabled={!isCompleted && !isActive}
                        onClick={() => isCompleted && setActiveStep(s.num)}
                        className={`shrink-0 whitespace-nowrap min-w-[28px] h-7 px-2.5 rounded-full text-[10px] leading-none font-bold flex items-center justify-center gap-1 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-enrollment-accent focus-visible:ring-offset-2 ${
                          isActive
                            ? "bg-enrollment-primary text-white scale-105"
                            : isCompleted
                              ? "bg-enrollment-accent text-white"
                              : "bg-enrollment-surface text-enrollment-muted border border-enrollment-primary/10"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                        ) : (
                          s.num
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 h-1 w-full rounded-full bg-enrollment-primary/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-enrollment-accent"
                    initial={false}
                    animate={{ width: `${(activeStep / steps.length) * 100}%` }}
                    transition={{ type: "spring", stiffness: 220, damping: 28 }}
                  />
                </div>
              </div>

              {/* Restored draft notice */}
              {draftRestored && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-enrollment-accent/10 border border-enrollment-accent/25 text-sm text-enrollment-primary"
                >
                  <Info className="w-4 h-4 shrink-0 text-enrollment-accent" aria-hidden="true" />
                  <span className="font-semibold">
                    Resumed your saved draft at Step {activeStep}. Aadhaar and bank account numbers
                    are not stored and must be re-entered.
                    {draftExpiresAt && (
                      <span className="font-medium opacity-80">
                        {" "}
                        This draft clears automatically on{" "}
                        {new Date(draftExpiresAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        .
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowResetDialog(true)}
                    className="ml-auto font-bold text-xs uppercase tracking-wider underline underline-offset-4 rounded outline-none focus-visible:ring-2 focus-visible:ring-enrollment-accent focus-visible:ring-offset-2"
                  >
                    Start over
                  </button>
                </motion.div>
              )}

              {/* Draft was intentionally dropped (expired or flow changed) */}
              {draftDiscarded && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="status"
                  className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-enrollment-primary/5 border border-enrollment-primary/20 text-sm text-enrollment-primary"
                >
                  <AlertCircle
                    className="w-4 h-4 shrink-0 text-enrollment-primary/70"
                    aria-hidden="true"
                  />
                  <span className="font-semibold">
                    {draftDiscarded === "expired"
                      ? "Your earlier saved draft expired after 24 hours and was cleared. Please start this application fresh."
                      : "The enrollment form has been updated since your last visit, so the earlier draft was cleared to avoid mismatched answers."}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDraftDiscarded(null)}
                    className="ml-auto font-bold text-xs uppercase tracking-wider underline underline-offset-4 rounded outline-none focus-visible:ring-2 focus-visible:ring-enrollment-accent focus-visible:ring-offset-2"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}

              {/* Step Header */}
              <motion.header
                key={`step-header-${activeStep}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="mb-2"
              >
                <span className="text-enrollment-accent font-bold text-xs tracking-[0.15em] uppercase">
                  Step {String(activeStep).padStart(2, "0")} of{" "}
                  {String(steps.length).padStart(2, "0")}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 font-enrollment-display text-enrollment-primary">
                  {currentStep.title}
                </h2>
                <p className="text-enrollment-muted text-sm mt-1">{currentStep.description}</p>
              </motion.header>

              {/* Live region so assistive tech announces step changes */}
              <p aria-live="polite" className="sr-only">
                Step {activeStep} of {steps.length}: {currentStep.title}
              </p>

              {/* Error Notification Banner */}
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-sm font-semibold flex items-center gap-2.5 shadow-xs">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                id="enroll-step-panel"
                role="tabpanel"
                aria-labelledby={`enroll-step-tab-${activeStep}`}
                className="space-y-8"
              >
                {/* STEP 1: PERSONAL DETAILS */}
                {activeStep === 1 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Full Name of Cadet (in BLOCK Letters)*
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={!!visibleErrors.fullName}
                          aria-describedby={visibleErrors.fullName ? "err-fullName" : undefined}
                          placeholder="e.g. RAJESH KUMAR MAHATO"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 aria-invalid:border-red-400 aria-invalid:bg-red-50/40 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                        <FieldError id="err-fullName" message={visibleErrors.fullName} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Division / Wing (Gender)*
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary bg-white focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                        >
                          <option value="SD">Senior Division (SD - Male Cadet)</option>
                          <option value="SW">Senior Wing (SW - Female Cadet)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Date of Birth*
                        </label>
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          12-Digit Aadhaar Card Number*
                        </label>
                        <input
                          type="text"
                          name="aadhaarNumber"
                          value={formData.aadhaarNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={!!visibleErrors.aadhaarNumber}
                          aria-describedby={
                            visibleErrors.aadhaarNumber ? "err-aadhaarNumber" : undefined
                          }
                          placeholder="8472 1928 4012"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 aria-invalid:border-red-400 aria-invalid:bg-red-50/40 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                        <FieldError id="err-aadhaarNumber" message={visibleErrors.aadhaarNumber} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Mobile Number (WhatsApp Enabled)*
                        </label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={!!visibleErrors.mobile}
                          aria-describedby={visibleErrors.mobile ? "err-mobile" : undefined}
                          placeholder="9835123456"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 aria-invalid:border-red-400 aria-invalid:bg-red-50/40 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                        <FieldError id="err-mobile" message={visibleErrors.mobile} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Email Address*
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="cadet@sbu.ac.in"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Father's Full Name*
                        </label>
                        <input
                          type="text"
                          name="fatherName"
                          value={formData.fatherName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={!!visibleErrors.fatherName}
                          aria-describedby={visibleErrors.fatherName ? "err-fatherName" : undefined}
                          placeholder="Father's Name"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 aria-invalid:border-red-400 aria-invalid:bg-red-50/40 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                        <FieldError id="err-fatherName" message={visibleErrors.fatherName} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Mother's Full Name*
                        </label>
                        <input
                          type="text"
                          name="motherName"
                          value={formData.motherName}
                          onChange={handleChange}
                          placeholder="Mother's Name"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Blood Group*
                        </label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary bg-white focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                        >
                          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Identification Mark (Scar/Mole)
                        </label>
                        <input
                          type="text"
                          name="identificationMark"
                          value={formData.identificationMark}
                          onChange={handleChange}
                          placeholder="e.g. Mole on right wrist"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: SBU ACADEMIC DETAILS */}
                {activeStep === 2 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Faculty / Department at SBU Ranchi*
                        </label>
                        <select
                          name="sbuDepartment"
                          value={formData.sbuDepartment}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary bg-white focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                        >
                          <option value="Faculty of Engineering & Technology">
                            Faculty of Engineering & Tech
                          </option>
                          <option value="Department of Computer Applications">
                            Department of Computer Applications (BCA/MCA)
                          </option>
                          <option value="Faculty of Management & Commerce">
                            Faculty of Management & Commerce (BBA/MBA)
                          </option>
                          <option value="Faculty of Applied Sciences">
                            Faculty of Applied Sciences (B.Sc/M.Sc)
                          </option>
                          <option value="Faculty of Humanities & Social Sciences">
                            Faculty of Humanities & Arts
                          </option>
                          <option value="Faculty of Nursing & Allied Health">
                            Faculty of Nursing & Allied Health
                          </option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Course / Program Enrolled*
                        </label>
                        <input
                          type="text"
                          name="sbuCourse"
                          value={formData.sbuCourse}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={!!visibleErrors.sbuCourse}
                          aria-describedby={visibleErrors.sbuCourse ? "err-sbuCourse" : undefined}
                          placeholder="e.g. B.Tech Computer Science / BCA / BBA"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 aria-invalid:border-red-400 aria-invalid:bg-red-50/40 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                        <FieldError id="err-sbuCourse" message={visibleErrors.sbuCourse} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          NCC Enrolment No*
                        </label>
                        <input
                          type="text"
                          name="sbuRollNo"
                          value={formData.sbuRollNo}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={!!visibleErrors.sbuRollNo}
                          aria-describedby={visibleErrors.sbuRollNo ? "err-sbuRollNo" : undefined}
                          placeholder="e.g. JH24SDA104201"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 aria-invalid:border-red-400 aria-invalid:bg-red-50/40 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                        <FieldError id="err-sbuRollNo" message={visibleErrors.sbuRollNo} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Year of Study & Semester*
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            name="sbuYear"
                            value={formData.sbuYear}
                            onChange={handleChange}
                            className="px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary bg-white focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                          </select>
                          <select
                            name="sbuSemester"
                            value={formData.sbuSemester}
                            onChange={handleChange}
                            className="px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary bg-white focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          >
                            <option value="1st Sem">1st Sem</option>
                            <option value="2nd Sem">2nd Sem</option>
                            <option value="3rd Sem">3rd Sem</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Class 10th (Matric) Percentage (%)*
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="marksPercentage10th"
                          value={formData.marksPercentage10th}
                          onChange={handleChange}
                          placeholder="85.0"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Class 12th / Diploma Percentage (%)*
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="marksPercentage12th"
                          value={formData.marksPercentage12th}
                          onChange={handleChange}
                          placeholder="82.5"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: PHYSICAL & CO-CURRICULAR */}
                {activeStep === 3 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Height in Centimeters (cm)*
                        </label>
                        <input
                          type="number"
                          name="heightCm"
                          value={formData.heightCm}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={!!visibleErrors.heightCm}
                          aria-describedby={visibleErrors.heightCm ? "err-heightCm" : undefined}
                          placeholder="172"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 aria-invalid:border-red-400 aria-invalid:bg-red-50/40 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                        <FieldError id="err-heightCm" message={visibleErrors.heightCm} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Weight in Kilograms (kg)*
                        </label>
                        <input
                          type="number"
                          name="weightKg"
                          value={formData.weightKg}
                          onChange={handleChange}
                          placeholder="64"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Estimated 1600m Run Time
                        </label>
                        <input
                          type="text"
                          name="run1600mTime"
                          value={formData.run1600mTime}
                          onChange={handleChange}
                          placeholder="e.g. 5 min 45 sec"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Max Continuous Push-ups Count
                        </label>
                        <input
                          type="number"
                          name="pushupsCount"
                          value={formData.pushupsCount}
                          onChange={handleChange}
                          placeholder="30"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                        />
                      </div>

                      <div className="md:col-span-2 bg-enrollment-surface border border-enrollment-primary/10 p-4 rounded-2xl space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="hasJuniorCertCheck"
                            name="hasJuniorCertificate"
                            checked={formData.hasJuniorCertificate}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-enrollment-primary/20 text-enrollment-accent focus:ring-enrollment-accent"
                          />
                          <label
                            htmlFor="hasJuniorCertCheck"
                            className="text-sm font-semibold text-enrollment-primary cursor-pointer"
                          >
                            I possess NCC Junior Division/Wing 'A' Certificate from School
                          </label>
                        </div>

                        {formData.hasJuniorCertificate && (
                          <div className="pl-7 pt-1">
                            <label className="block text-xs font-semibold text-enrollment-muted mb-1">
                              Junior Division 'A' Certificate Number:
                            </label>
                            <input
                              type="text"
                              name="juniorCertificateNo"
                              value={formData.juniorCertificateNo}
                              onChange={handleChange}
                              placeholder="e.g. JHR/JD/22/1042"
                              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Highest Sports / Athletics Level
                        </label>
                        <select
                          name="sportsLevel"
                          value={formData.sportsLevel}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary bg-white focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                        >
                          <option value="None">None</option>
                          <option value="College">Inter-College / SBU Level</option>
                          <option value="District">District Championship</option>
                          <option value="State">State Championship</option>
                          <option value="National">National Level Player</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Sports Achievement Details
                        </label>
                        <input
                          type="text"
                          name="sportsDetails"
                          value={formData.sportsDetails}
                          onChange={handleChange}
                          placeholder="e.g. 100m Athletics Bronze Medalist"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                        />
                      </div>
                    </div>

                    {/* Physical Rating Calculator Widget */}
                    <div className={`p-4 rounded-2xl border text-sm ${getPhysicalRating().color}`}>
                      <span className="font-bold">Physical Criteria Status: </span>
                      <span>{getPhysicalRating().rating}</span>
                    </div>
                  </div>
                )}

                {/* STEP 4: BANK DETAILS & ADDRESS */}
                {activeStep === 4 && (
                  <div className="space-y-5">
                    <p className="text-sm text-enrollment-muted leading-relaxed">
                      Bank details are mandated by 19 Jharkhand Battalion for Direct Benefit
                      Transfer (DBT) of camp mess allowances, washing allowances, and travel
                      reimbursements.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Bank Name*
                        </label>
                        <input
                          type="text"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={!!visibleErrors.bankName}
                          aria-describedby={visibleErrors.bankName ? "err-bankName" : undefined}
                          placeholder="e.g. State Bank of India"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 aria-invalid:border-red-400 aria-invalid:bg-red-50/40 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                        <FieldError id="err-bankName" message={visibleErrors.bankName} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Account Number*
                        </label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={!!visibleErrors.accountNumber}
                          aria-describedby={
                            visibleErrors.accountNumber ? "err-accountNumber" : undefined
                          }
                          placeholder="38920194821"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 aria-invalid:border-red-400 aria-invalid:bg-red-50/40 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all"
                          required
                        />
                        <FieldError id="err-accountNumber" message={visibleErrors.accountNumber} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          IFSC Code*
                        </label>
                        <input
                          type="text"
                          name="ifscCode"
                          value={formData.ifscCode}
                          onChange={handleChange}
                          placeholder="SBIN0001234"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all uppercase"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Present Residence Address (Ranchi / Hostel)*
                        </label>
                        <textarea
                          name="presentAddress"
                          value={formData.presentAddress}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={!!visibleErrors.presentAddress}
                          aria-describedby={
                            visibleErrors.presentAddress ? "err-presentAddress" : undefined
                          }
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 aria-invalid:border-red-400 aria-invalid:bg-red-50/40 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all resize-none"
                          required
                        />
                        <FieldError
                          id="err-presentAddress"
                          message={visibleErrors.presentAddress}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-enrollment-primary uppercase tracking-wider">
                          Permanent Address & Pin Code
                        </label>
                        <textarea
                          name="permanentAddress"
                          value={formData.permanentAddress}
                          onChange={handleChange}
                          placeholder="Leave blank if same as Present Address"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-medium text-enrollment-primary placeholder:text-enrollment-placeholder focus:border-enrollment-accent focus:ring-0 focus:outline-hidden transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: DECLARATIONS & PARENT CONSENT */}
                {activeStep === 5 && (
                  <div className="space-y-5">
                    <div className="bg-white border border-enrollment-primary/10 rounded-2xl p-5 space-y-3 text-sm text-enrollment-primary/80 leading-relaxed">
                      <h4 className="font-bold text-enrollment-primary uppercase tracking-wider text-xs">
                        Declaration by Applicant Cadet:
                      </h4>
                      <p>
                        I hereby declare that the details provided above are true to the best of my
                        knowledge. I promise that I will undergo National Cadet Corps training
                        willingly, abide by the rules of 19 Jharkhand Battalion NCC Ranchi, and
                        maintain high standards of discipline.
                      </p>

                      <div className="flex items-start gap-3 pt-3 border-t border-enrollment-primary/10">
                        <input
                          type="checkbox"
                          id="decCheck"
                          name="declarationAccepted"
                          checked={formData.declarationAccepted}
                          onChange={handleChange}
                          className="w-4 h-4 mt-0.5 rounded border-enrollment-primary/20 text-enrollment-accent focus:ring-enrollment-accent"
                        />
                        <label
                          htmlFor="decCheck"
                          className="font-semibold text-enrollment-primary cursor-pointer"
                        >
                          I accept the Cadet Declaration and agree to undergo NCC parades & camps.
                        </label>
                      </div>
                    </div>

                    <div className="bg-white border border-enrollment-primary/10 rounded-2xl p-5 space-y-3 text-sm text-enrollment-primary/80 leading-relaxed">
                      <h4 className="font-bold text-enrollment-primary uppercase tracking-wider text-xs">
                        Parent / Guardian Consent:
                      </h4>
                      <p>
                        I permit my son/daughter/ward to join the Senior Division/Wing NCC at Sarala
                        Birla University under 19 Jharkhand Battalion. I understand that NCC
                        training involves parade drill, physical exercise, rifle firing, and
                        residential camps.
                      </p>

                      <div className="flex items-start gap-3 pt-3 border-t border-enrollment-primary/10">
                        <input
                          type="checkbox"
                          id="parentCheck"
                          name="parentConsentAccepted"
                          checked={formData.parentConsentAccepted}
                          onChange={handleChange}
                          className="w-4 h-4 mt-0.5 rounded border-enrollment-primary/20 text-enrollment-accent focus:ring-enrollment-accent"
                        />
                        <label
                          htmlFor="parentCheck"
                          className="font-semibold text-enrollment-primary cursor-pointer"
                        >
                          Parent / Guardian has consented to NCC enrollment & camp participation.
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Controls */}
                <div className="flex items-center justify-between pt-8 border-t border-slate-100 mb-24">
                  {activeStep > 1 ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={handlePrevStep}
                      className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-enrollment-primary border border-enrollment-primary/10 hover:bg-enrollment-surface rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Step</span>
                    </motion.button>
                  ) : (
                    <div />
                  )}

                  {activeStep < 5 ? (
                    <div
                      className="flex flex-col items-end gap-1.5"
                      onPointerDown={() => {
                        if (!isStepValid) setShowAllErrors(true);
                      }}
                    >
                      <motion.button
                        whileHover={isStepValid ? { scale: 1.03 } : undefined}
                        whileTap={isStepValid ? { scale: 0.96 } : undefined}
                        type="button"
                        onClick={handleNextStep}
                        disabled={!isStepValid}
                        aria-disabled={!isStepValid}
                        className="px-6 py-3 sm:px-7 sm:py-3.5 bg-enrollment-primary hover:bg-enrollment-primary-hover text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-enrollment-primary/15 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-4.5 h-4.5" />
                      </motion.button>
                      {!isStepValid && (
                        <span className="text-[11px] font-semibold text-enrollment-muted">
                          {Object.keys(stepErrors).length} required field
                          {Object.keys(stepErrors).length > 1 ? "s" : ""} left · draft saving
                        </span>
                      )}
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="px-7 py-3.5 sm:px-8 sm:py-4 bg-enrollment-accent hover:bg-enrollment-accent/90 text-white rounded-xl font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-enrollment-accent/20 cursor-pointer disabled:opacity-50 uppercase tracking-wider transition-colors"
                      id="submit-enrollment-form-btn"
                    >
                      {isSubmitting ? (
                        <span>Submitting Application to Battalion...</span>
                      ) : (
                        <>
                          <FileCheck2 className="w-5 h-5 shrink-0" />
                          <span>Submit Official Form 1 Application</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </form>
            </div>
          )}

          <footer className="mt-20 mb-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
            <p>&copy; 2026 Sarala Birla University. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-enrollment-accent transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-enrollment-accent transition-colors">
                Help Center
              </a>
            </div>
          </footer>

          {/* Spacer to clear the fixed AI Cadre Assistant on short viewports */}
          <div className="h-28 sm:h-32" aria-hidden="true" />
        </div>
      </main>

      {/* Reset draft confirmation dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="border-enrollment-primary/10 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-enrollment-primary font-enrollment-display">
              <Trash2 className="w-5 h-5 text-enrollment-accent" aria-hidden="true" />
              Clear saved draft?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-enrollment-muted">
              This will permanently delete your saved enrollment progress from this browser. You
              cannot undo this action and will have to start the application from the beginning.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isResetting}
              className="border-enrollment-primary/20 text-enrollment-primary hover:bg-enrollment-primary/5"
            >
              Keep draft and continue
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isResetting}
              onClick={async () => {
                setIsResetting(true);
                await clearDraft();
                window.location.reload();
              }}
              className="bg-enrollment-accent hover:bg-enrollment-accent/90 text-white"
            >
              {isResetting ? "Clearing…" : "Yes, clear draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
