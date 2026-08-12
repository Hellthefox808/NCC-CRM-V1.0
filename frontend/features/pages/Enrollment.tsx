import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  CreditCard,
  FileCheck2,
  FileText,
  GraduationCap,
  Info,
  Printer,
  ShieldCheck,
  Trash2,
  User,
  Phone,
  Mail,
  Calendar,
  Building,
  Upload,
  Camera,
  Activity,
  Edit2,
  CheckCheck,
  Zap,
  MapPin,
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

// Format helpers
const formatAadhaar = (val: string) => {
  const digits = val.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

const formatIFSC = (val: string) => {
  return val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
};

const getBankFromIFSC = (ifsc: string) => {
  const code = ifsc.toUpperCase();
  if (code.startsWith("SBIN")) return "State Bank of India (SBI)";
  if (code.startsWith("PUNB")) return "Punjab National Bank (PNB)";
  if (code.startsWith("HDFC")) return "HDFC Bank Ltd";
  if (code.startsWith("ICIC")) return "ICICI Bank";
  if (code.startsWith("BARB")) return "Bank of Baroda";
  if (code.startsWith("CNRB")) return "Canara Bank";
  if (code.startsWith("BKID")) return "Bank of India";
  if (code.startsWith("UBIN")) return "Union Bank of India";
  if (code.length >= 4) return "Bank Code Identified";
  return "";
};

const formatPhone = (val: string) => {
  return val.replace(/\D/g, "").slice(0, 10);
};

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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Form State
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
    sbuDepartment: "Faculty of Engineering & Technology",
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

  // ---- Draft persistence ----
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

  useEffect(() => {
    let cancelled = false;
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
    } else if (name === "aadhaarNumber") {
      setFormData((prev) => ({ ...prev, [name]: formatAadhaar(value) }));
    } else if (name === "ifscCode") {
      const formatted = formatIFSC(value);
      const bankHint = getBankFromIFSC(formatted);
      setFormData((prev) => ({
        ...prev,
        ifscCode: formatted,
        bankName: bankHint && !prev.bankName ? bankHint : prev.bankName,
      }));
    } else if (name === "mobile" || name === "guardianMobile") {
      setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Passport photo must be smaller than 5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Sample Demo Autofill
  const handleFillDemoData = () => {
    setFormData({
      fullName: "RAHUL KUMAR SHARMA",
      gender: "SD",
      dob: "2005-04-14",
      aadhaarNumber: "8492 1049 3921",
      mobile: "9835123456",
      email: "rahul.sharma@sbu.ac.in",
      fatherName: "SURESH PRASAD SHARMA",
      motherName: "SUNITA SHARMA",
      bloodGroup: "B+",
      heightCm: "174",
      weightKg: "68",
      identificationMark: "Small scar on forehead",

      sbuDepartment: "Department of Computer Applications",
      sbuCourse: "BCA (Bachelor of Computer Applications)",
      sbuRollNo: "JH24SDA104901",
      sbuYear: "1st Year",
      sbuSemester: "1st Sem",
      marksPercentage10th: "88.4",
      marksPercentage12th: "85.2",

      run1600mTime: "5 min 30 sec",
      pushupsCount: "35",
      hasJuniorCertificate: true,
      juniorCertificateNo: "JHR/JD/22/40192",
      sportsLevel: "District",
      sportsDetails: "District Level Athletics 400m Runner Up",

      presentAddress: "Room 204, SBU Hostel B, Namkum Campus, Ranchi",
      permanentAddress: "Main Road, Near Town Hall, Hazaribagh, Jharkhand",
      pinCode: "834010",
      bankName: "State Bank of India",
      accountNumber: "38921049281",
      ifscCode: "SBIN0001234",

      guardianName: "SURESH PRASAD SHARMA",
      guardianRelation: "Father",
      guardianMobile: "9431109876",

      declarationAccepted: true,
      parentConsentAccepted: true,
    });
    setTouched({});
    setErrorMessage("");
  };

  // Instant Physical & BMI Calculation
  const getBmiDetails = () => {
    const h = Number(formData.heightCm) / 100;
    const w = Number(formData.weightKg);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const bmi = (w / (h * h)).toFixed(1);
    const bmiNum = Number(bmi);
    let status = "Normal Weight";
    let color = "text-emerald-700 bg-emerald-50 border-emerald-300";
    if (bmiNum < 18.5) {
      status = "Underweight";
      color = "text-amber-700 bg-amber-50 border-amber-300";
    } else if (bmiNum > 24.9) {
      status = "Overweight";
      color = "text-amber-700 bg-amber-50 border-amber-300";
    }
    return { bmi, status, color };
  };

  const getPhysicalRating = () => {
    const height = Number(formData.heightCm) || 0;
    const runSec = formData.run1600mTime.includes("5 min") ? 5 : 6;
    if (formData.gender === "SD") {
      if (height >= 170 && runSec <= 5)
        return {
          rating: "Grade A — Fit for Senior Division (SD)",
          color: "text-emerald-800 bg-emerald-50 border-emerald-300",
        };
      if (height >= 168)
        return { rating: "Eligible for Senior Division", color: "text-blue-800 bg-blue-50 border-blue-300" };
      return {
        rating: "Height Relaxation Subject to State/Tribal Norms",
        color: "text-amber-800 bg-amber-50 border-amber-300",
      };
    } else {
      if (height >= 152)
        return {
          rating: "Eligible for Senior Wing (SW)",
          color: "text-emerald-800 bg-emerald-50 border-emerald-300",
        };
      return {
        rating: "Height Relaxation as per Army Norms",
        color: "text-amber-800 bg-amber-50 border-amber-300",
      };
    }
  };

  // Form completion percentage
  const getCompletionPercentage = () => {
    const requiredFields = [
      "fullName",
      "dob",
      "aadhaarNumber",
      "mobile",
      "email",
      "fatherName",
      "sbuCourse",
      "sbuRollNo",
      "marksPercentage10th",
      "marksPercentage12th",
      "heightCm",
      "weightKg",
      "bankName",
      "accountNumber",
      "ifscCode",
      "presentAddress",
    ];
    let filled = 0;
    requiredFields.forEach((f) => {
      if (String(formData[f as keyof typeof formData] || "").trim().length > 0) filled++;
    });
    return Math.round((filled / requiredFields.length) * 100);
  };

  // Step Validation
  const validateStep = (step: number, data: typeof formData): Record<string, string> => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!data.fullName.trim())
        e.fullName = "Enter cadet's full name as on Aadhaar card.";
      const aadhaar = data.aadhaarNumber.replace(/\s/g, "");
      if (!aadhaar) e.aadhaarNumber = "Aadhaar number is required for Form 1 verification.";
      else if (!/^\d{12}$/.test(aadhaar)) e.aadhaarNumber = "Aadhaar must be exactly 12 digits.";
      const mobile = data.mobile.replace(/\s/g, "");
      if (!mobile) e.mobile = "A mobile number is required for official battalion alerts.";
      else if (!/^[6-9]\d{9}$/.test(mobile))
        e.mobile = "Enter a valid 10-digit Indian mobile number.";
      if (!data.fatherName.trim())
        e.fatherName = "Father's full name is required.";
      if (!data.dob) e.dob = "Date of birth is required.";
    }
    if (step === 2) {
      if (!data.sbuCourse.trim())
        e.sbuCourse = "Enter your SBU course / program name.";
      if (!data.sbuRollNo.trim())
        e.sbuRollNo = "Enter your SBU enrolment / roll number.";
      if (!data.marksPercentage10th)
        e.marksPercentage10th = "Matriculation (10th) percentage is required.";
      if (!data.marksPercentage12th)
        e.marksPercentage12th = "Intermediate (12th) percentage is required.";
    }
    if (step === 3) {
      const h = Number(data.heightCm);
      if (!data.heightCm.toString().trim()) e.heightCm = "Height is required for PET benchmark.";
      else if (!Number.isFinite(h) || h < 140 || h > 220)
        e.heightCm = "Enter a height between 140 cm and 220 cm.";
      const w = Number(data.weightKg);
      if (!data.weightKg.toString().trim()) e.weightKg = "Weight is required for PET benchmark.";
      else if (!Number.isFinite(w) || w < 30 || w > 150)
        e.weightKg = "Enter weight between 30 kg and 150 kg.";
    }
    if (step === 4) {
      if (!data.bankName.trim())
        e.bankName = "Bank name is required for camp allowance DBT.";
      const acct = data.accountNumber.replace(/\s/g, "");
      if (!acct) e.accountNumber = "Account number is required for DBT transfer.";
      else if (!/^\d{9,18}$/.test(acct)) e.accountNumber = "Account number must be 9–18 digits.";
      if (!data.ifscCode.trim() || data.ifscCode.length < 11)
        e.ifscCode = "Valid 11-character IFSC code is required.";
      if (!data.presentAddress.trim())
        e.presentAddress = "Present address in Ranchi / hostel is required.";
    }
    return e;
  };

  const stepErrors = validateStep(activeStep, formData);
  const isStepValid = Object.keys(stepErrors).length === 0;
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
        className="flex items-start gap-1.5 text-[11px] font-semibold text-red-600 leading-snug mt-1"
      >
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px text-red-500" aria-hidden="true" />
        <span>{message}</span>
      </p>
    ) : null;

  const handleNextStep = () => {
    setErrorMessage("");
    const errs = validateStep(activeStep, formData);
    if (Object.keys(errs).length > 0) {
      setShowAllErrors(true);
      setErrorMessage(
        `Please resolve ${Object.keys(errs).length} required field${Object.keys(errs).length > 1 ? "s" : ""} on this step to continue. Your draft is still safe.`,
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
        "Please check both Cadet Declaration and Parent/Guardian Consent checkboxes to proceed.",
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
        throw new Error(res.error || "Failed to submit cadet enrollment application.");
      }

      await clearDraft();
      setSubmittedRecord(res.data.enrollment);
      onSuccessSubmitted?.(res.data.enrollment);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
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
      title: "Personal Identification & Bio-Data",
      description: "Enter your official identity details as printed on your Aadhaar Card.",
    },
    {
      num: 2,
      label: "Academic",
      title: "Sarala Birla University Academic Details",
      description: "Share your program, roll number, and matriculation / intermediate marks.",
    },
    {
      num: 3,
      label: "Physical",
      title: "Physical Fitness & Co-Curricular Profile",
      description: "Enter height, weight, run speed, and NCC Junior Certificate or sports history.",
    },
    {
      num: 4,
      label: "Bank & Address",
      title: "Bank Account DBT & Residence Address",
      description: "Mandatory bank account for camp allowance transfers and local residence.",
    },
    {
      num: 5,
      label: "Review & Consent",
      title: "Application Review & Declarations",
      description: "Review your completed Form 1 application details and sign consent statements.",
    },
  ];

  const currentStep = steps.find((s) => s.num === activeStep) || steps[0];
  const completionPct = getCompletionPercentage();
  const bmiInfo = getBmiDetails();

  const stepRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const desktopStepRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const handleStepperKeyDown = (
    e: React.KeyboardEvent,
    orientation: "vertical" | "horizontal",
    refs: React.MutableRefObject<Record<number, HTMLButtonElement | null>> = stepRefs,
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
    }

    if (target !== null) {
      e.preventDefault();
      setActiveStep(target);
      requestAnimationFrame(() => refs.current[target as number]?.focus());
    }
  };

  return (
    <section
      className="min-h-screen w-full flex bg-slate-50 font-sans text-slate-900"
      id="enrollment-section"
    >
      {/* Left Hero Sidebar */}
      <aside className="hidden lg:flex w-[40%] bg-zinc-950 p-8 xl:p-12 flex-col justify-between sticky top-0 h-screen overflow-hidden relative">
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-105 contrast-110 saturate-[1.1]"
          style={{ backgroundImage: `url('/sbu-campus-front.jpg')` }}
          role="img"
          aria-label="Sarala Birla University Campus, Ranchi"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0a1c0f]/40 to-black/85" />

        <div className="relative z-10 bg-[#07130a]/85 backdrop-blur-xl border border-emerald-500/30 p-6 sm:p-8 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] ring-1 ring-white/10 my-auto">
          {/* SBU & NCC Crest Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-13 h-13 rounded-full bg-white p-1 shadow-xl border-2 border-emerald-400 flex items-center justify-center shrink-0"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_5fO3j9MhxWCOALUorfuM3nZcChQfc2949oaRRyjpIQ&s=10"
                  alt="Sarala Birla University Emblem"
                  className="w-full h-full object-contain rounded-full"
                />
              </motion.div>
              <div className="h-7 w-0.5 bg-white/30" />
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-13 h-13 rounded-full bg-white p-1 shadow-xl border-2 border-amber-400 flex items-center justify-center shrink-0"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZDvUjTIPyVWknpreMHXnyKTvz7-P_uljpSxjPHcXXw&s=10"
                  alt="19 JHR BN NCC Crest"
                  className="w-full h-full object-contain rounded-full"
                />
              </motion.div>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-extrabold tracking-[0.2em] uppercase">
                19 Jharkhand Battalion NCC
              </span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Cadet Enrollment
              <br />
              <span className="text-emerald-400 font-serif italic font-normal">Form 1 Portal</span>
            </h1>

            <div className="mt-3 inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 rounded-full text-emerald-300 font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sarala Birla University, Ranchi</span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <nav aria-label="Enrollment steps" className="mt-6">
            <div
              role="tablist"
              aria-orientation="vertical"
              onKeyDown={(e) => handleStepperKeyDown(e, "vertical", desktopStepRefs)}
              className="space-y-4 relative"
            >
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/20" />
              {steps.map((s) => {
                const isActive = activeStep === s.num;
                const isCompleted = activeStep > s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    ref={(el) => {
                      desktopStepRefs.current[s.num] = el;
                    }}
                    disabled={!isCompleted && !isActive}
                    onClick={() => isCompleted && setActiveStep(s.num)}
                    className={`relative flex items-center gap-3.5 group w-full text-left rounded-xl outline-none transition-all duration-200 ${
                      isCompleted
                        ? "opacity-100 cursor-pointer"
                        : isActive
                          ? "opacity-100"
                          : "opacity-50 cursor-default"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full z-10 flex items-center justify-center font-bold text-xs transition-colors duration-200 ${
                        isActive
                          ? "bg-emerald-500 text-white ring-4 ring-emerald-500/30 shadow-lg shadow-emerald-500/50"
                          : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-white/20 text-white/70"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      ) : (
                        s.num
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-xs font-bold transition-colors ${
                          isActive ? "text-white" : isCompleted ? "text-white/90" : "text-white/60"
                        }`}
                      >
                        {s.label}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                        {isCompleted ? "Completed" : isActive ? "Current Step" : "Upcoming"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="relative z-10 text-white/70 text-[11px] font-mono uppercase tracking-[0.16em] flex items-center justify-between">
          <span>Unity · Discipline · Duty</span>
          <span className="text-emerald-400 font-bold">2026-27</span>
        </div>
      </aside>

      {/* Main Right Form Panel */}
      <main className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto bg-white lg:rounded-l-[40px] shadow-2xl z-20">
        <div className="max-w-2xl mx-auto pb-32">
          {/* Top Form Header with Progress Pill & Demo Button */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200">
                {completionPct}%
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Form Progress</p>
                <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFillDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-xs font-bold border border-amber-300/40 transition-all cursor-pointer shadow-xs"
              title="Autofill valid sample data for quick previewing"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Autofill Sample Data</span>
            </button>
          </div>

          {submittedRecord ? (
            /* Successful Submission View */
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner">
                  <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                    Application Submitted Successfully!
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Registered with 19 Jharkhand Battalion NCC, Ranchi
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-emerald-500/20 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                      Tracking Application ID
                    </p>
                    <p className="text-xl font-black text-slate-900 tracking-wide font-mono">
                      {submittedRecord.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                      Cadet Full Name
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      {submittedRecord.fullName} ({submittedRecord.gender})
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                      SBU Roll Number
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {submittedRecord.sbuRollNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                      Current Status
                    </p>
                    <span className="inline-block bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full text-xs border border-emerald-300">
                      {submittedRecord.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 font-bold">Physical Test Instructions:</strong>{" "}
                  Please print your Form 1 application slip below. Bring original 10th/12th marksheets,
                  Aadhaar card, SBU Student ID card, Bank passbook photocopy, and medical fitness certificate
                  to SBU Sports Ground on parade day at 06:00 AM.
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onOpenPrintableSlip?.(submittedRecord)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Form 1 Slip</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openStatusModalWithQuery?.(submittedRecord.id)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Track Status Online</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    await clearDraft();
                    setSubmittedRecord(null);
                    setActiveStep(1);
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold px-5 py-3 rounded-xl text-sm cursor-pointer"
                >
                  Submit Another
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
                        aria-selected={isActive}
                        disabled={!isCompleted && !isActive}
                        onClick={() => isCompleted && setActiveStep(s.num)}
                        className={`shrink-0 min-w-[28px] h-7 px-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                          isActive
                            ? "bg-emerald-600 text-white scale-105"
                            : isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(activeStep / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Draft Restored Banner */}
              {draftRestored && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900"
                >
                  <Info className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-medium">
                    Resumed your saved draft (Step {activeStep}). Aadhaar and bank details are not saved for security.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowResetDialog(true)}
                    className="ml-auto font-bold text-xs uppercase underline cursor-pointer"
                  >
                    Clear Draft
                  </button>
                </motion.div>
              )}

              {/* Step Header */}
              <header className="mb-2">
                <span className="text-emerald-600 font-extrabold text-xs tracking-widest uppercase">
                  Step {String(activeStep).padStart(2, "0")} of {String(steps.length).padStart(2, "0")}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
                  {currentStep.title}
                </h2>
                <p className="text-slate-500 text-sm mt-1">{currentStep.description}</p>
              </header>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-sm font-semibold flex items-center gap-2.5 shadow-xs">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`step-${activeStep}`}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* STEP 1: PERSONAL DETAILS */}
                    {activeStep === 1 && (
                      <div className="space-y-5">
                        {/* Photo Dropzone */}
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 transition-all">
                          <div className="relative w-20 h-24 rounded-xl bg-slate-200 border-2 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
                            {photoPreview ? (
                              <img src={photoPreview} alt="Cadet preview" className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="w-7 h-7 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                              Cadet Passport Photo (Optional Preview)
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Will be rendered on your official Form 1 printable slip. Max 5 MB.
                            </p>
                            <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{photoPreview ? "Change Photo" : "Upload Passport Photo"}</span>
                              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Full Name of Cadet (BLOCK Letters)*
                            </label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                              <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                aria-invalid={!!visibleErrors.fullName}
                                placeholder="e.g. RAJESH KUMAR MAHATO"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all uppercase"
                                required
                              />
                            </div>
                            <FieldError id="err-fullName" message={visibleErrors.fullName} />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Division / Wing (Gender)*
                            </label>
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 bg-white focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                            >
                              <option value="SD">Senior Division (SD - Male Cadet)</option>
                              <option value="SW">Senior Wing (SW - Female Cadet)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Date of Birth*
                            </label>
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                              <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                aria-invalid={!!visibleErrors.dob}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                                required
                              />
                            </div>
                            <FieldError id="err-dob" message={visibleErrors.dob} />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                12-Digit Aadhaar Card Number*
                              </label>
                              {formData.aadhaarNumber.replace(/\s/g, "").length === 12 && (
                                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCheck className="w-3.5 h-3.5" /> 12 Digits Verified
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              name="aadhaarNumber"
                              value={formData.aadhaarNumber}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              aria-invalid={!!visibleErrors.aadhaarNumber}
                              placeholder="8472 1928 4012"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-mono font-bold tracking-wider text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                              required
                            />
                            <FieldError id="err-aadhaarNumber" message={visibleErrors.aadhaarNumber} />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Mobile Number (WhatsApp)*
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                              <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                aria-invalid={!!visibleErrors.mobile}
                                placeholder="9835123456"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                                required
                              />
                            </div>
                            <FieldError id="err-mobile" message={visibleErrors.mobile} />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Email Address*
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="cadet@sbu.ac.in"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Father's Full Name*
                            </label>
                            <input
                              type="text"
                              name="fatherName"
                              value={formData.fatherName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              aria-invalid={!!visibleErrors.fatherName}
                              placeholder="Father's Full Name"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                              required
                            />
                            <FieldError id="err-fatherName" message={visibleErrors.fatherName} />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Mother's Full Name*
                            </label>
                            <input
                              type="text"
                              name="motherName"
                              value={formData.motherName}
                              onChange={handleChange}
                              placeholder="Mother's Full Name"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Blood Group*
                            </label>
                            <select
                              name="bloodGroup"
                              value={formData.bloodGroup}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 bg-white focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                            >
                              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                                <option key={bg} value={bg}>
                                  {bg}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Identification Mark (Scar/Mole)
                            </label>
                            <input
                              type="text"
                              name="identificationMark"
                              value={formData.identificationMark}
                              onChange={handleChange}
                              placeholder="e.g. Mole on right cheek"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: ACADEMIC DETAILS */}
                    {activeStep === 2 && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Faculty / Department at SBU Ranchi*
                            </label>
                            <div className="relative">
                              <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                              <select
                                name="sbuDepartment"
                                value={formData.sbuDepartment}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 bg-white focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                              >
                                <option value="Faculty of Engineering & Technology">
                                  Faculty of Engineering & Technology (B.Tech/Diploma)
                                </option>
                                <option value="Department of Computer Applications">
                                  Department of Computer Applications (BCA/MCA)
                                </option>
                                <option value="Faculty of Management & Commerce">
                                  Faculty of Management & Commerce (BBA/MBA/B.Com)
                                </option>
                                <option value="Faculty of Applied Sciences">
                                  Faculty of Applied Sciences (B.Sc/M.Sc)
                                </option>
                                <option value="Faculty of Humanities & Social Sciences">
                                  Faculty of Humanities & Arts (BA/MA)
                                </option>
                                <option value="Faculty of Nursing & Allied Health">
                                  Faculty of Nursing & Allied Health
                                </option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Course / Program Name*
                            </label>
                            <div className="relative">
                              <GraduationCap className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                              <input
                                type="text"
                                name="sbuCourse"
                                value={formData.sbuCourse}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                aria-invalid={!!visibleErrors.sbuCourse}
                                placeholder="e.g. BCA / B.Tech Computer Science"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                                required
                              />
                            </div>
                            <FieldError id="err-sbuCourse" message={visibleErrors.sbuCourse} />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              SBU Enrolment / Roll No*
                            </label>
                            <input
                              type="text"
                              name="sbuRollNo"
                              value={formData.sbuRollNo}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              aria-invalid={!!visibleErrors.sbuRollNo}
                              placeholder="e.g. JH24SDA104201"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-mono font-bold text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all uppercase"
                              required
                            />
                            <FieldError id="err-sbuRollNo" message={visibleErrors.sbuRollNo} />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Year of Study & Semester*
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <select
                                name="sbuYear"
                                value={formData.sbuYear}
                                onChange={handleChange}
                                className="px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 bg-white focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                              >
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                              </select>
                              <select
                                name="sbuSemester"
                                value={formData.sbuSemester}
                                onChange={handleChange}
                                className="px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 bg-white focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                              >
                                <option value="1st Sem">1st Sem</option>
                                <option value="2nd Sem">2nd Sem</option>
                                <option value="3rd Sem">3rd Sem</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Class 10th (Matric) Marks (%)*
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              name="marksPercentage10th"
                              value={formData.marksPercentage10th}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              aria-invalid={!!visibleErrors.marksPercentage10th}
                              placeholder="85.0"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                              required
                            />
                            <FieldError id="err-marksPercentage10th" message={visibleErrors.marksPercentage10th} />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Class 12th / Diploma Marks (%)*
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              name="marksPercentage12th"
                              value={formData.marksPercentage12th}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              aria-invalid={!!visibleErrors.marksPercentage12th}
                              placeholder="82.5"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                              required
                            />
                            <FieldError id="err-marksPercentage12th" message={visibleErrors.marksPercentage12th} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: PHYSICAL & CO-CURRICULAR */}
                    {activeStep === 3 && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Height in Centimeters (cm)*
                            </label>
                            <input
                              type="number"
                              name="heightCm"
                              value={formData.heightCm}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              aria-invalid={!!visibleErrors.heightCm}
                              placeholder="172"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                              required
                            />
                            <FieldError id="err-heightCm" message={visibleErrors.heightCm} />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Weight in Kilograms (kg)*
                            </label>
                            <input
                              type="number"
                              name="weightKg"
                              value={formData.weightKg}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              aria-invalid={!!visibleErrors.weightKg}
                              placeholder="64"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                              required
                            />
                            <FieldError id="err-weightKg" message={visibleErrors.weightKg} />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              1600m Run Time Estimate
                            </label>
                            <input
                              type="text"
                              name="run1600mTime"
                              value={formData.run1600mTime}
                              onChange={handleChange}
                              placeholder="e.g. 5 min 45 sec"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Max Continuous Push-ups Count
                            </label>
                            <input
                              type="number"
                              name="pushupsCount"
                              value={formData.pushupsCount}
                              onChange={handleChange}
                              placeholder="30"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Live Physical & BMI Widget */}
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                            <Activity className="w-4 h-4 text-emerald-600" />
                            <span>Physical Fitness Calculator</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className={`p-3 rounded-xl border ${getPhysicalRating().color}`}>
                              <p className="font-bold">PET Physical Grade:</p>
                              <p className="font-extrabold mt-0.5">{getPhysicalRating().rating}</p>
                            </div>
                            {bmiInfo ? (
                              <div className={`p-3 rounded-xl border ${bmiInfo.color}`}>
                                <p className="font-bold">Calculated BMI Index:</p>
                                <p className="font-extrabold mt-0.5">
                                  {bmiInfo.bmi} kg/m² ({bmiInfo.status})
                                </p>
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center">
                                Enter height & weight to calculate BMI.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="hasJuniorCertCheck"
                              name="hasJuniorCertificate"
                              checked={formData.hasJuniorCertificate}
                              onChange={handleChange}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <label
                              htmlFor="hasJuniorCertCheck"
                              className="text-xs font-extrabold text-slate-900 cursor-pointer"
                            >
                              I possess NCC Junior Division/Wing 'A' Certificate from School
                            </label>
                          </div>

                          {formData.hasJuniorCertificate && (
                            <div className="pl-7 pt-1">
                              <label className="block text-xs font-bold text-slate-600 mb-1">
                                Junior Division 'A' Certificate Number:
                              </label>
                              <input
                                type="text"
                                name="juniorCertificateNo"
                                value={formData.juniorCertificateNo}
                                onChange={handleChange}
                                placeholder="e.g. JHR/JD/22/1042"
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all uppercase"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Highest Sports / Athletics Level
                            </label>
                            <select
                              name="sportsLevel"
                              value={formData.sportsLevel}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 bg-white focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                            >
                              <option value="None">None</option>
                              <option value="College">Inter-College / SBU Level</option>
                              <option value="District">District Championship</option>
                              <option value="State">State Championship</option>
                              <option value="National">National Level Player</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Sports Achievement Details
                            </label>
                            <input
                              type="text"
                              name="sportsDetails"
                              value={formData.sportsDetails}
                              onChange={handleChange}
                              placeholder="e.g. 100m Sprint Silver Medalist"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: BANK DETAILS & ADDRESS */}
                    {activeStep === 4 && (
                      <div className="space-y-5">
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed font-medium">
                          <strong>DBT Mandate:</strong> Bank account details are required by 19 Jharkhand Battalion
                          for Direct Benefit Transfer (DBT) of camp allowances, mess stipends, and travel reimbursements.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                IFSC Code*
                              </label>
                              {getBankFromIFSC(formData.ifscCode) && (
                                <span className="text-[10px] font-bold text-emerald-600">
                                  {getBankFromIFSC(formData.ifscCode)}
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              name="ifscCode"
                              value={formData.ifscCode}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              aria-invalid={!!visibleErrors.ifscCode}
                              placeholder="SBIN0001234"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-mono font-bold tracking-wider text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all uppercase"
                              required
                            />
                            <FieldError id="err-ifscCode" message={visibleErrors.ifscCode} />
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Bank Name*
                            </label>
                            <div className="relative">
                              <CreditCard className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                              <input
                                type="text"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                aria-invalid={!!visibleErrors.bankName}
                                placeholder="e.g. State Bank of India"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                                required
                              />
                            </div>
                            <FieldError id="err-bankName" message={visibleErrors.bankName} />
                          </div>

                          <div className="space-y-1.5 md:col-span-3">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Account Number*
                            </label>
                            <input
                              type="text"
                              name="accountNumber"
                              value={formData.accountNumber}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              aria-invalid={!!visibleErrors.accountNumber}
                              placeholder="38920194821"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-mono font-bold tracking-wider text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all"
                              required
                            />
                            <FieldError id="err-accountNumber" message={visibleErrors.accountNumber} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Present Address (Ranchi / Hostel)*
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                              <textarea
                                name="presentAddress"
                                value={formData.presentAddress}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                aria-invalid={!!visibleErrors.presentAddress}
                                rows={3}
                                placeholder="House / Hostel No, SBU Campus / Area, Ranchi"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 aria-invalid:border-red-400 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all resize-none"
                                required
                              />
                            </div>
                            <FieldError id="err-presentAddress" message={visibleErrors.presentAddress} />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Permanent Address & PIN Code
                            </label>
                            <textarea
                              name="permanentAddress"
                              value={formData.permanentAddress}
                              onChange={handleChange}
                              rows={3}
                              placeholder="Leave blank if same as Present Address"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: REVIEW & CONSENT */}
                    {activeStep === 5 && (
                      <div className="space-y-6">
                        {/* Interactive Application Summary Review Grid */}
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 md:p-6 space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                              <FileText className="w-4 h-4 text-emerald-600" />
                              <span>Review Your Application Summary</span>
                            </h3>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                              Form 1 Preview
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 relative">
                              <button
                                type="button"
                                onClick={() => setActiveStep(1)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Edit Personal Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <p className="text-slate-400 font-extrabold uppercase">1. Personal</p>
                              <p className="font-bold text-slate-900 mt-1">{formData.fullName || "—"}</p>
                              <p className="text-slate-500">Gender: {formData.gender} · DOB: {formData.dob || "—"}</p>
                              <p className="text-slate-500">Aadhaar: {formData.aadhaarNumber ? `XXXX XXXX ${formData.aadhaarNumber.slice(-4)}` : "—"}</p>
                              <p className="text-slate-500">Mobile: {formData.mobile || "—"}</p>
                            </div>

                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 relative">
                              <button
                                type="button"
                                onClick={() => setActiveStep(2)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Edit Academic Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <p className="text-slate-400 font-extrabold uppercase">2. Academic</p>
                              <p className="font-bold text-slate-900 mt-1">{formData.sbuCourse || "—"}</p>
                              <p className="text-slate-500">Roll No: {formData.sbuRollNo || "—"}</p>
                              <p className="text-slate-500">10th Marks: {formData.marksPercentage10th}% · 12th Marks: {formData.marksPercentage12th}%</p>
                            </div>

                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 relative">
                              <button
                                type="button"
                                onClick={() => setActiveStep(3)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Edit Physical Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <p className="text-slate-400 font-extrabold uppercase">3. Physical</p>
                              <p className="font-bold text-slate-900 mt-1">Height: {formData.heightCm} cm · Weight: {formData.weightKg} kg</p>
                              <p className="text-slate-500">PET Grade: {getPhysicalRating().rating}</p>
                              <p className="text-slate-500">Junior 'A' Cert: {formData.hasJuniorCertificate ? formData.juniorCertificateNo : "No"}</p>
                            </div>

                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 relative">
                              <button
                                type="button"
                                onClick={() => setActiveStep(4)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Edit Bank Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <p className="text-slate-400 font-extrabold uppercase">4. Bank & Address</p>
                              <p className="font-bold text-slate-900 mt-1">{formData.bankName || "—"}</p>
                              <p className="text-slate-500">Account: {formData.accountNumber ? `XXXX${formData.accountNumber.slice(-4)}` : "—"}</p>
                              <p className="text-slate-500">IFSC: {formData.ifscCode || "—"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Declarations & Consent */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-sm text-slate-700 leading-relaxed shadow-xs">
                          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                            <Award className="w-4 h-4 text-emerald-600" />
                            <span>Declaration by Applicant Cadet:</span>
                          </h4>
                          <p className="text-xs text-slate-600">
                            I hereby declare that all details provided above are true to the best of my knowledge.
                            I promise that I will undergo National Cadet Corps training willingly, abide by the rules of 19 Jharkhand Battalion NCC Ranchi, and maintain high standards of discipline.
                          </p>

                          <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                            <input
                              type="checkbox"
                              id="decCheck"
                              name="declarationAccepted"
                              checked={formData.declarationAccepted}
                              onChange={handleChange}
                              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <label htmlFor="decCheck" className="font-bold text-xs text-slate-900 cursor-pointer">
                              I accept the Cadet Declaration and agree to undergo NCC parades & camps.
                            </label>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-sm text-slate-700 leading-relaxed shadow-xs">
                          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Parent / Guardian Consent:</span>
                          </h4>
                          <p className="text-xs text-slate-600">
                            I permit my son/daughter/ward to join Senior Division/Wing NCC at Sarala Birla University
                            under 19 Jharkhand Battalion. I understand training includes drill, physical exercise, rifle firing, and residential camps.
                          </p>

                          <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                            <input
                              type="checkbox"
                              id="parentCheck"
                              name="parentConsentAccepted"
                              checked={formData.parentConsentAccepted}
                              onChange={handleChange}
                              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <label htmlFor="parentCheck" className="font-bold text-xs text-slate-900 cursor-pointer">
                              Parent / Guardian has consented to NCC enrollment & camp participation.
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Stepper Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  {activeStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-5 py-3 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Step</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {activeStep < 5 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!isStepValid}
                      className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-4.5 h-4.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-600/30 cursor-pointer disabled:opacity-50 uppercase tracking-wider transition-colors"
                      id="submit-enrollment-form-btn"
                    >
                      {isSubmitting ? (
                        <span>Submitting to Battalion...</span>
                      ) : (
                        <>
                          <FileCheck2 className="w-5 h-5" />
                          <span>Submit Form 1 Application</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          <footer className="mt-16 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
            <p>&copy; 2026 Sarala Birla University. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-emerald-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-emerald-600 transition-colors">
                Help Center
              </a>
            </div>
          </footer>
        </div>
      </main>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-slate-900">
              <Trash2 className="w-5 h-5 text-red-500" />
              Clear saved draft?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This will permanently delete your saved enrollment draft. You will start the form fresh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Keep Draft</AlertDialogCancel>
            <AlertDialogAction
              disabled={isResetting}
              onClick={async () => {
                setIsResetting(true);
                await clearDraft();
                window.location.reload();
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isResetting ? "Clearing..." : "Yes, Clear Draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
