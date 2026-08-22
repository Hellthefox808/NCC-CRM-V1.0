import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { EnterpriseDataPlatform, type CadetRegisterRecord } from "@backend/services/dataPlatform";
import { NotificationsFeed } from "@frontend/features/NotificationsFeed";
import { CadetDashboardOverview } from "@frontend/features/Cadet/CadetDashboardOverview";
import { ProfileSection } from "@frontend/features/Cadet/ProfileSection";
import { AttendanceSection } from "@frontend/features/Cadet/AttendanceSection";
import { LeaveSection } from "@frontend/features/Cadet/LeaveSection";
import { TrainingSection } from "@frontend/features/Cadet/TrainingSection";
import { ActivitiesSection } from "@frontend/features/Cadet/ActivitiesSection";
import { CertificatesSection } from "@frontend/features/Cadet/CertificatesSection";
import { AchievementsSection } from "@frontend/features/Cadet/AchievementsSection";
import { StudyMaterialSection } from "@frontend/features/Cadet/StudyMaterialSection";
import { SettingsSection } from "@frontend/features/Cadet/SettingsSection";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  Heart,
  HelpCircle,
  Info,
  Layers,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  MessageSquare,
  Phone,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trash2,
  Trophy,
  User,
  UserCheck,
  Users,
  Video,
  X,
} from "lucide-react";
import { BATTALION_DETAILS, PHYSICAL_FITNESS_STANDARDS } from "@/data/nccData";

interface CadetDashboardProps {
  onLogout?: () => void;
}

export type CadetTab =
  | "dashboard"
  | "profile"
  | "attendance"
  | "activities"
  | "training"
  | "certificates"
  | "achievements"
  | "materials"
  | "notifications"
  | "leave"
  | "settings";

export const CadetDashboard: React.FC<CadetDashboardProps> = ({ onLogout }) => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<CadetTab>("dashboard");

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cadet Personal Profile Data (Cadet view)
  const [cadetProfile, setCadetProfile] = useState({
    fullName: "Aman Kumar Sharma",
    rank: "Lance Corporal (L/Cpl)",
    regNo: "JHR/26/SD/19/204801",
    sbuRollNo: "SBU25BTECH042",
    sbuCourse: "B.Tech Computer Science & Engineering",
    sbuYear: "2nd Year (4th Semester)",
    gender: "SD (Male)",
    unit: "19 Jharkhand Battalion NCC, Ranchi",
    coy: "Sarala Birla University Company",
    groupHQ: "NCC Group HQ, Ranchi",
    directorate: "Bihar & Jharkhand Directorate",
    joiningYear: "2025",
    batch: "Batch II (2nd Year)",
    bloodGroup: "O+",
    dob: "2004-08-15",
    mobile: "+91 98765 43210",
    email: "aman.sharma2025@sbu.ac.in",
    fatherName: "Rajesh Kumar Sharma",
    motherName: "Sunita Sharma",
    parentMobile: "+91 98765 00000",
    parentOccupation: "Central Govt Service",
    address: "Qtr No. C-14, Harmu Housing Colony, Ranchi, Jharkhand - 834002",
    emergencyContactName: "Rajesh Kumar Sharma (Father)",
    emergencyContactPhone: "+91 98765 00000",
    // Physical & Medical
    heightCm: "175",
    weightKg: "68",
    bmi: "22.2 (Normal)",
    chestCm: "82 cm (Unexpanded) / 88 cm (Expanded)",
    fitnessStatus: "PASSED (1600m in 5m 45s)",
    medicalRemarks: "Fit for High Altitude & Advanced Camps",
    // Uniform Sizes
    beretSize: "6.75",
    shirtSize: "40",
    trouserWaist: "32",
    bootSize: "8 DMS",
    hackleColor: "Red & Navy Blue",
    // Documents Verification
    aadhaarVerified: true,
    bankPassbookVerified: true,
    collegeIdVerified: true,
    medicalCertVerified: true,
    parentConsentVerified: true,
    // Bank & DBT Details
    bankName: "State Bank of India (SBI)",
    accountNo: "••••••••4819",
    ifscCode: "SBIN0001234",
    dbtStatus: "Linked & Verified (Active)",
    // Photo
    photoUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  });

  // ── Live register data ────────────────────────────────────────────────
  // The cadet's authoritative particulars come from the unit register
  // (`/api/v1/cadets/me`). Demo values above are only a fallback so the
  // dashboard never renders empty while the record loads.
  const [registerState, setRegisterState] = useState<"loading" | "linked" | "unlinked">("loading");
  const [registerRecord, setRegisterRecord] = useState<CadetRegisterRecord | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await EnterpriseDataPlatform.getMyCadetRecord();
      if (cancelled) return;
      if (res.success && res.data?.cadet) {
        const c = res.data.cadet;
        setRegisterRecord(c);
        setRegisterState("linked");
        setCadetProfile((prev) => ({
          ...prev,
          fullName: c.fullName || prev.fullName,
          rank: c.rank || prev.rank,
          regNo: c.enrollmentId || prev.regNo,
          sbuRollNo: c.sbuId || prev.sbuRollNo,
          sbuCourse: [c.course, c.branch].filter(Boolean).join(" · ") || prev.sbuCourse,
          sbuYear:
            [c.semester && `Semester ${c.semester}`, c.section && `Section ${c.section}`]
              .filter(Boolean)
              .join(" · ") || prev.sbuYear,
          gender: c.gender ? `${c.wing || ""} (${c.gender})`.trim() : prev.gender,
          coy: c.institute || prev.coy,
          groupHQ: c.groupHq || prev.groupHQ,
          batch: c.batch || prev.batch,
          bloodGroup: c.bloodGroup || prev.bloodGroup,
          dob: c.dob || prev.dob,
          mobile: c.mobile || prev.mobile,
          email: c.email || prev.email,
          fatherName: c.fatherName || prev.fatherName,
          motherName: c.motherName || prev.motherName,
          address: c.address || prev.address,
          emergencyContactName: c.nokName
            ? `${c.nokName}${c.nokRelationship ? ` (${c.nokRelationship})` : ""}`
            : prev.emergencyContactName,
          identificationMark:
            ("identificationMark" in c ? (c.identificationMark as string) : undefined) ||
            ("identificationMark" in prev ? (prev.identificationMark as string) : undefined),
          ifscCode: c.ifscCode || prev.ifscCode,
          dbtStatus:
            c.stipendReceived && /yes/i.test(c.stipendReceived)
              ? "Stipend credited (DBT active)"
              : "DBT verification pending",
        }));
      } else {
        setRegisterState("unlinked");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Profile Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState({
    mobile: cadetProfile.mobile,
    email: cadetProfile.email,
    emergencyPhone: cadetProfile.emergencyContactPhone,
    address: cadetProfile.address,
    beretSize: cadetProfile.beretSize,
    shirtSize: cadetProfile.shirtSize,
    trouserWaist: cadetProfile.trouserWaist,
    bootSize: cadetProfile.bootSize,
  });

  // ID Card Modal
  const [showIdCardModal, setShowIdCardModal] = useState<boolean>(false);

  // Attendance Data
  const attendanceSummary = {
    totalParades: 32,
    attended: 28,
    absent: 2,
    late: 1,
    leave: 1,
    percentage: 87.5,
    drillPercent: 90,
    classPercent: 85,
    paradePercent: 87.5,
    campPercent: 100,
  };

  const attendanceLog = [
    {
      date: "2026-08-02",
      topic: "Squad Drill & Salute on March",
      instructor: "Subedar Major B.S. Gurung",
      status: "Present",
      remarks: "Turnout A1 Excellent",
    },
    {
      date: "2026-07-28",
      topic: "0.22 Rifle Stripping & Safety Rules",
      instructor: "Havildar Rajveer Singh",
      status: "Present",
      remarks: "Good speed in assembly",
    },
    {
      date: "2026-07-25",
      topic: "Map Reading: Prismatic Compass",
      instructor: "Capt. Dr. Animesh Roy (ANO)",
      status: "Present",
      remarks: "Target grid identified",
    },
    {
      date: "2026-07-20",
      topic: "Obstacle Course & Physical Conditioning",
      instructor: "PI Staff, 19 JHR BN",
      status: "Late",
      remarks: "Arrived 10 mins late",
    },
    {
      date: "2026-07-15",
      topic: "Fieldcraft & Section Formation",
      instructor: "Subedar Major B.S. Gurung",
      status: "Present",
      remarks: "Satisfactory",
    },
    {
      date: "2026-07-10",
      topic: "Disaster Management & First Aid",
      instructor: "Capt. Dr. Animesh Roy (ANO)",
      status: "Leave",
      remarks: "College exam duty — sanctioned",
    },
    {
      date: "2026-07-05",
      topic: "Ceremonial Drill Practice",
      instructor: "PI Staff, 19 JHR BN",
      status: "Present",
      remarks: "Paces verified",
    },
    {
      date: "2026-06-30",
      topic: "Health & Hygiene Lecture",
      instructor: "ANO Office",
      status: "Absent",
      remarks: "Unexcused absence — warning issued",
    },
    {
      date: "2026-06-26",
      topic: "Weapon Training: Aiming & Trigger Control",
      instructor: "Havildar Rajveer Singh",
      status: "Present",
      remarks: "Grouping improved",
    },
    {
      date: "2026-06-21",
      topic: "National Integration & Awareness Talk",
      instructor: "Capt. Dr. Animesh Roy (ANO)",
      status: "Present",
      remarks: "Participated in discussion",
    },
    {
      date: "2026-06-17",
      topic: "Drill: Arms Drill with .22 Rifle",
      instructor: "Subedar Major B.S. Gurung",
      status: "Present",
      remarks: "Steady on inspection",
    },
    {
      date: "2026-06-12",
      topic: "Adventure Training Briefing (Trekking)",
      instructor: "PI Staff, 19 JHR BN",
      status: "Present",
      remarks: "Kit list acknowledged",
    },
    {
      date: "2026-06-07",
      topic: "Social Service: Campus Plantation Drive",
      instructor: "ANO Office",
      status: "Present",
      remarks: "12 saplings planted",
    },
    {
      date: "2026-06-02",
      topic: "Physical Training: 1600m Timed Run",
      instructor: "PI Staff, 19 JHR BN",
      status: "Present",
      remarks: "5 min 45 s — pass",
    },
    {
      date: "2026-05-28",
      topic: "Organisation of NCC & Armed Forces",
      instructor: "Capt. Dr. Animesh Roy (ANO)",
      status: "Present",
      remarks: "Class notes submitted",
    },
    {
      date: "2026-05-23",
      topic: "Drill: Foot Drill Revision",
      instructor: "Subedar Major B.S. Gurung",
      status: "Late",
      remarks: "Late fall-in, uniform correct",
    },
    {
      date: "2026-05-18",
      topic: "Field Signals & Judging Distance",
      instructor: "Havildar Rajveer Singh",
      status: "Present",
      remarks: "Estimates within tolerance",
    },
    {
      date: "2026-05-13",
      topic: "Civil Defence & Fire Fighting Demo",
      instructor: "ANO Office",
      status: "Present",
      remarks: "Extinguisher drill cleared",
    },
    {
      date: "2026-05-08",
      topic: "Personality Development Session",
      instructor: "Capt. Dr. Animesh Roy (ANO)",
      status: "Leave",
      remarks: "Medical leave — certificate on file",
    },
    {
      date: "2026-05-03",
      topic: "Squad Drill & Turnout Inspection",
      instructor: "Subedar Major B.S. Gurung",
      status: "Present",
      remarks: "Boots and brasses A1",
    },
    {
      date: "2026-04-28",
      topic: "Weapon Training Theory: Range Safety",
      instructor: "Havildar Rajveer Singh",
      status: "Present",
      remarks: "Safety precautions recited",
    },
    {
      date: "2026-04-23",
      topic: "Republic Day Camp Debrief",
      instructor: "ANO Office",
      status: "Present",
      remarks: "Attended full session",
    },
    {
      date: "2026-04-18",
      topic: "Obstacle Training: Rope & Ramp",
      instructor: "PI Staff, 19 JHR BN",
      status: "Absent",
      remarks: "Absent without intimation",
    },
    {
      date: "2026-04-13",
      topic: "Introduction to Map Symbols",
      instructor: "Capt. Dr. Animesh Roy (ANO)",
      status: "Present",
      remarks: "Assessment 18/20",
    },
  ];

  // Tasks & Checklist for Cadet
  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Get DMS Boots Polished & Ankle Webbing Blanco Pressed",
      completed: true,
      category: "Parade Prep",
    },
    {
      id: "2",
      title: "Submit Parent Consent Certificate for ATC Ranchi Camp",
      completed: false,
      category: "Camp Documents",
    },
    {
      id: "3",
      title: "Revise 0.22 Deluxe Rifle Safety Precautions for WT Exam",
      completed: false,
      category: "Training",
    },
    {
      id: "4",
      title: "Collect Hackle & Line Dori from CQMS Store",
      completed: true,
      category: "Uniform",
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  // Leave Form State
  const [leaveReasonCategory, setLeaveReasonCategory] = useState<string>("College Examination");
  const [leaveStartDate, setLeaveStartDate] = useState<string>("");
  const [leaveEndDate, setLeaveEndDate] = useState<string>("");
  const [leaveDescription, setLeaveDescription] = useState<string>("");
  const [leaveHistory, setLeaveHistory] = useState([
    {
      id: "LV-2026-089",
      category: "College Mid-Sem Exam",
      startDate: "2026-07-10",
      endDate: "2026-07-12",
      appliedOn: "2026-07-05",
      status: "Approved",
      officerRemarks: "Leave granted for university examination. Report back on 13 July parade.",
      officerName: "Capt. Dr. Animesh Roy (ANO)",
    },
    {
      id: "LV-2026-042",
      category: "Medical Unfitness",
      startDate: "2026-05-18",
      endDate: "2026-05-20",
      appliedOn: "2026-05-17",
      status: "Approved",
      officerRemarks: "Medical certificate verified.",
      officerName: "ANO Office",
    },
  ]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveDescription.trim()) {
      showToast("Please complete all leave fields.");
      return;
    }

    const newLeave = {
      id: `LV-2026-${Math.floor(100 + Math.random() * 900)}`,
      category: leaveReasonCategory,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      appliedOn: new Date().toISOString().split("T")[0],
      status: "Pending",
      officerRemarks: "Under review by ANO Office SBU Company",
      officerName: "Pending Verification",
    };

    setLeaveHistory([newLeave, ...leaveHistory]);
    setLeaveStartDate("");
    setLeaveEndDate("");
    setLeaveDescription("");
    showToast("Leave application submitted to ANO Office successfully.");
  };

  // Practice Quiz State (Classes & Training)
  const [quizAnswer, setQuizAnswer] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const quizQuestions = [
    {
      question: "What is the effective firing range of 0.22 Deluxe Rifle?",
      options: ["25 Yards", "100 Yards", "300 Yards", "500 Meters"],
      correct: 0,
      explanation: "The effective range of 0.22 Deluxe Rifle is 25 Yards (23 Meters).",
    },
    {
      question: "In Squad Drill, how many paces are taken in 'Tez Chal' (Quick March) per minute?",
      options: ["110 Paces/min", "120 Paces/min", "140 Paces/min", "90 Paces/min"],
      correct: 1,
      explanation:
        "Standard marching speed for SD male cadets in Quick March is 120 paces per minute.",
    },
    {
      question: "Which angle is formed between feet in 'Savdhan' position?",
      options: ["30 Degrees", "45 Degrees", "60 Degrees", "90 Degrees"],
      correct: 0,
      explanation:
        "In Savdhan (Attention), the heels are together and toes are separated at an angle of 30 degrees.",
    },
  ];

  // Certificate Verification Modal State
  const [selectedCert, setSelectedCert] = useState<{
    title: string;
    certNo: string;
    issueDate: string;
    authority: string;
    grade: string;
  } | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: "N1",
      title: "Mandatory Parade & Uniform Inspection for Independence Day",
      body: "All SD and SW cadets must report in full Working Dress No. 2 at SBU Sports Ground on 05 Aug at 06:00 AM sharp.",
      date: "2026-08-01 17:30",
      read: false,
      priority: "High",
      category: "Parade Order",
    },
    {
      id: "N2",
      title: "ATC Ranchi Camp Document Verification Notice",
      body: "Cadets selected for ATC Ranchi must submit original Parent Consent and Medical Fitness certificates by 10 Aug.",
      date: "2026-07-28 11:00",
      read: false,
      priority: "Urgent",
      category: "Camp Notice",
    },
    {
      id: "N3",
      title: "Special Drill & Weapon Handling Class Scheduled",
      body: "Subedar Major B.S. Gurung will conduct hands-on 0.22 rifle stripping class on Friday morning.",
      date: "2026-07-24 14:15",
      read: true,
      priority: "Normal",
      category: "Training",
    },
  ]);

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read.");
  };

  // Save Profile Edits
  const handleSaveProfileEdits = (e: React.FormEvent) => {
    e.preventDefault();
    setCadetProfile({
      ...cadetProfile,
      mobile: profileForm.mobile,
      email: profileForm.email,
      emergencyContactPhone: profileForm.emergencyPhone,
      address: profileForm.address,
      beretSize: profileForm.beretSize,
      shirtSize: profileForm.shirtSize,
      trouserWaist: profileForm.trouserWaist,
      bootSize: profileForm.bootSize,
    });
    setIsEditingProfile(false);
    showToast("Profile details updated successfully.");
  };

  // Trigger Certificate Download Confetti
  const handleDownloadCertificate = (certTitle: string) => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
    showToast(`Downloading verified PDF for ${certTitle}...`);
  };

  // Sidebar navigation menu options
  const navMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "profile", label: "My Profile", icon: User },
    { id: "attendance", label: "My Attendance", icon: UserCheck },
    { id: "activities", label: "Activities & Events", icon: Calendar },
    { id: "training", label: "Classes & Training", icon: BookOpen },
    { id: "certificates", label: "Certificates", icon: FileCheck },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "materials", label: "Study Material", icon: GraduationCap },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      badge: notifications.filter((n) => !n.read).length,
    },
    { id: "leave", label: "Leave / Permission", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30 text-foreground flex flex-col font-sans antialiased">
      {/* Toast Notification Popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-22 left-1/2 z-50 surface-inverse px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-medium"
          >
            <ShieldCheck className="w-4.5 h-4.5 text-accent-on-inverse shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Cadet Navigation Header — glass command bar on the design system */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="h-1 w-full brand-gradient" aria-hidden="true" />
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand & Mobile Menu */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer hidden md:flex items-center justify-center"
              title="Toggle sidebar navigation"
              aria-label="Toggle sidebar navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer md:hidden"
              aria-label="Open cadet navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-sm font-semibold tracking-tight text-foreground truncate font-display">
                    Cadet Portal · 19 JHR BN NCC
                  </h1>
                  <span className="hidden sm:inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    SBU Company
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate numeric">
                  {cadetProfile.rank} · {cadetProfile.regNo}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Notifications, ID card & identity */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("notifications")}
              className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground relative transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive ring-2 ring-card" />
              )}
            </button>

            <button
              onClick={() => setShowIdCardModal(true)}
              className="hidden sm:flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Cadet ID card</span>
            </button>

            <div className="hidden lg:flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-1.5">
              <img
                src={cadetProfile.photoUrl}
                alt=""
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
              <div className="text-left text-xs min-w-0">
                <p className="font-semibold text-foreground leading-tight truncate max-w-40">
                  {cadetProfile.fullName}
                </p>
                <p className="text-[10px] text-muted-foreground numeric truncate">
                  {cadetProfile.sbuRollNo}
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title="Sign out of the cadet portal"
                aria-label="Sign out of the cadet portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Register link status — real data provenance for the cadet */}
      {registerState !== "loading" && (
        <div
          className={`border-b px-4 sm:px-6 lg:px-8 py-2.5 text-xs ${
            registerState === "linked"
              ? "border-border bg-muted/40 text-muted-foreground"
              : "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
          }`}
          role="status"
        >
          {registerState === "linked" ? (
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              Particulars verified against the {registerRecord?.batch ?? "unit"} nominal roll
              {registerRecord?.anoName ? ` · ANO ${registerRecord.anoName}` : ""}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              This login is not yet linked to a cadet record. Sign in with your SBU ID or NCC
              enrollment number to load your verified particulars.
            </span>
          )}
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Collapsible Sidebar */}
        <aside
          className={`bg-card border-r border-border transition-all duration-300 hidden md:flex flex-col shrink-0 ${
            sidebarCollapsed ? "w-18" : "w-64"
          }`}
          aria-label="Cadet sections"
        >
          <div className="p-3 flex-1 space-y-1 overflow-y-auto">
            {!sidebarCollapsed && (
              <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Workspace
              </p>
            )}
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as CadetTab)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && item.badge > 0 ? (
                    <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground numeric">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-border">
            {onLogout ? (
              <button
                onClick={onLogout}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer ${
                  sidebarCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Sign out</span>}
              </button>
            ) : null}
          </div>
        </aside>

        {/* Mobile Drawer Sidebar */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border p-5 space-y-4 md:hidden shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4.5 h-4.5 text-primary" />
                    <span className="font-semibold text-foreground text-sm font-display">
                      Cadet navigation
                    </span>
                  </div>
                  <button onClick={() => setMobileSidebarOpen(false)} aria-label="Close navigation">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as CadetTab);
                          setMobileSidebarOpen(false);
                        }}
                        aria-current={isActive ? "page" : undefined}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors text-left ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 ? (
                          <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground numeric">
                            {item.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {onLogout && (
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card text-[13px] font-medium text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* TAB 1: CADET DASHBOARD */}
          {activeTab === "dashboard" && (
            <CadetDashboardOverview
              cadetProfile={cadetProfile}
              attendanceSummary={attendanceSummary}
              tasks={tasks}
              toggleTask={toggleTask}
              notifications={notifications}
              setActiveTab={(tab) => setActiveTab(tab as CadetTab)}
              setShowIdCardModal={setShowIdCardModal}
            />
          )}

          {/* TAB 2: MY PROFILE */}
          {activeTab === "profile" && (
            <ProfileSection
              cadetProfile={cadetProfile}
              setIsEditingProfile={setIsEditingProfile}
              setShowIdCardModal={setShowIdCardModal}
            />
          )}

          {/* TAB 3: MY ATTENDANCE */}
          {activeTab === "attendance" && (
            <AttendanceSection
              attendanceSummary={attendanceSummary}
              attendanceLog={attendanceLog}
              showToast={showToast}
            />
          )}

          {/* TAB 4: ACTIVITIES & EVENTS */}
          {activeTab === "activities" && <ActivitiesSection />}

          {/* TAB 5: CLASSES & TRAINING */}
          {activeTab === "training" && (
            <TrainingSection
              quizQuestions={quizQuestions}
              quizAnswer={quizAnswer}
              setQuizAnswer={setQuizAnswer}
              quizSubmitted={quizSubmitted}
              setQuizSubmitted={setQuizSubmitted}
              showToast={showToast}
            />
          )}

          {/* TAB 6: CERTIFICATES */}
          {activeTab === "certificates" && (
            <CertificatesSection
              setSelectedCert={setSelectedCert}
              handleDownloadCertificate={handleDownloadCertificate}
            />
          )}

          {/* TAB 7: ACHIEVEMENTS */}
          {/* TAB 7: ACHIEVEMENTS */}
          {activeTab === "achievements" && <AchievementsSection />}

          {/* TAB 8: STUDY MATERIAL */}
          {activeTab === "materials" && <StudyMaterialSection showToast={showToast} />}

          {/* TAB 9: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <NotificationsFeed
              onActionClick={(actionType, n) => {
                if (actionType === "quiz") {
                  setActiveTab("training");
                  showToast(`Navigated to Practice Quiz for "${n.title}"`);
                } else if (actionType === "schedule") {
                  setActiveTab("activities");
                  showToast("Navigated to Parade & Events Schedule");
                } else if (actionType === "upload") {
                  setActiveTab("leave");
                  showToast("Navigated to Document Submission & Leave Area");
                } else if (actionType === "syllabus") {
                  setActiveTab("materials");
                  showToast("Navigated to Study Materials & Handbooks");
                } else {
                  showToast(`Acknowledged: ${n.title}`);
                }
              }}
              showToast={showToast}
            />
          )}

          {/* TAB 10: LEAVE / PERMISSION */}
          {activeTab === "leave" && (
            <LeaveSection
              leaveReasonCategory={leaveReasonCategory}
              setLeaveReasonCategory={setLeaveReasonCategory}
              leaveStartDate={leaveStartDate}
              setLeaveStartDate={setLeaveStartDate}
              leaveEndDate={leaveEndDate}
              setLeaveEndDate={setLeaveEndDate}
              leaveDescription={leaveDescription}
              setLeaveDescription={setLeaveDescription}
              handleApplyLeave={handleApplyLeave}
              leaveHistory={leaveHistory}
            />
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === "settings" && <SettingsSection showToast={showToast} />}
        </main>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-zinc-200 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="text-lg font-black text-zinc-900 flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  <span>Edit Contact & Uniform Specs</span>
                </h3>
                <button onClick={() => setIsEditingProfile(false)}>
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSaveProfileEdits} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-700">Mobile Number</label>
                    <input
                      type="text"
                      value={profileForm.mobile}
                      onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                      className="w-full mt-1 p-2 border border-zinc-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700">Emergency Phone</label>
                    <input
                      type="text"
                      value={profileForm.emergencyPhone}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, emergencyPhone: e.target.value })
                      }
                      className="w-full mt-1 p-2 border border-zinc-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-700">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full mt-1 p-2 border border-zinc-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700">Permanent Address</label>
                  <textarea
                    rows={2}
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full mt-1 p-2 border border-zinc-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
                  <div>
                    <label className="font-bold text-zinc-700">Beret Size</label>
                    <input
                      type="text"
                      value={profileForm.beretSize}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, beretSize: e.target.value })
                      }
                      className="w-full mt-1 p-2 border border-zinc-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700">Shirt Size</label>
                    <input
                      type="text"
                      value={profileForm.shirtSize}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, shirtSize: e.target.value })
                      }
                      className="w-full mt-1 p-2 border border-zinc-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-700">Trouser Waist (Inches)</label>
                    <input
                      type="text"
                      value={profileForm.trouserWaist}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, trouserWaist: e.target.value })
                      }
                      className="w-full mt-1 p-2 border border-zinc-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700">DMS Boot Size</label>
                    <input
                      type="text"
                      value={profileForm.bootSize}
                      onChange={(e) => setProfileForm({ ...profileForm, bootSize: e.target.value })}
                      className="w-full mt-1 p-2 border border-zinc-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#18181B] text-white rounded-xl font-bold hover:bg-[#09090B] cursor-pointer"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ID Card Modal */}
      <AnimatePresence>
        {showIdCardModal && (
          <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-zinc-200 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-[#18181B]" />
                  <span className="font-black text-zinc-900 text-sm">
                    Official Cadet Identity Card
                  </span>
                </div>
                <button onClick={() => setShowIdCardModal(false)}>
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* ID Card Layout */}
              <div className="bg-white border-2 border-zinc-900 rounded-2xl p-5 shadow-lg space-y-3 relative overflow-hidden text-left">
                <div className="bg-gradient-to-r from-zinc-900 via-red-700 to-sky-600 h-3 -mx-5 -mt-5 mb-3" />

                <div className="text-center border-b border-zinc-200 pb-2">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                    NATIONAL CADET CORPS INDIA
                  </p>
                  <h3 className="text-sm font-black text-zinc-900">{cadetProfile.unit}</h3>
                  <p className="text-[11px] text-zinc-900 font-bold">
                    Sarala Birla University Company
                  </p>
                </div>

                <div className="flex space-x-3 items-center">
                  <img
                    src={cadetProfile.photoUrl}
                    alt={cadetProfile.fullName}
                    className="w-20 h-24 object-cover rounded-xl border-2 border-zinc-900 shadow-xs shrink-0"
                  />
                  <div className="space-y-0.5 text-xs">
                    <span className="bg-blue-500 text-zinc-950 font-black text-[9px] px-1.5 py-0.2 rounded uppercase inline-block">
                      {cadetProfile.rank}
                    </span>
                    <p className="text-sm font-black text-zinc-900 leading-tight">
                      {cadetProfile.fullName}
                    </p>
                    <p className="font-mono text-zinc-800 text-[10px] font-bold">
                      Regt: {cadetProfile.regNo}
                    </p>
                    <p className="text-zinc-600 text-[10px]">SBU Roll: {cadetProfile.sbuRollNo}</p>
                    <p className="text-zinc-600 text-[10px]">
                      Blood Group:{" "}
                      <strong className="text-red-700">{cadetProfile.bloodGroup}</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-[9px] text-zinc-500">
                  <span>Authorized: ANO SBU Coy</span>
                  <span className="font-bold text-zinc-900">Valid: 2025 - 2028</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full py-2 bg-[#18181B] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-blue-500" />
                  <span>Print Cadet Identity Card</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Verification Certificate View Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-zinc-200 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="font-black text-zinc-900 text-sm">
                    Official Certificate Preview
                  </span>
                </div>
                <button onClick={() => setSelectedCert(null)}>
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="bg-zinc-50 border-2 border-blue-500/80 rounded-2xl p-6 space-y-4 text-center relative overflow-hidden">
                <div className="bg-gradient-to-r from-zinc-900 via-red-700 to-sky-600 h-2 -mx-6 -mt-6 mb-4" />

                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  NATIONAL CADET CORPS INDIA
                </p>
                <h3 className="text-xl font-black text-zinc-900">{selectedCert.title}</h3>

                <p className="text-xs text-zinc-700 italic">
                  This is to certify that{" "}
                  <strong className="text-zinc-900 font-black">{cadetProfile.fullName}</strong> (
                  {cadetProfile.rank}), Regimental No.{" "}
                  <strong className="font-mono">{cadetProfile.regNo}</strong> of 19 Jharkhand
                  Battalion NCC, Sarala Birla University Company, has successfully achieved{" "}
                  <strong className="text-emerald-800 font-extrabold">{selectedCert.grade}</strong>.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 border-t border-b border-zinc-200 py-3 font-mono">
                  <div>
                    Certificate No: <strong className="text-zinc-900">{selectedCert.certNo}</strong>
                  </div>
                  <div>
                    Issue Date: <strong className="text-zinc-900">{selectedCert.issueDate}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-[10px] text-zinc-500">
                  <div className="text-left">
                    <p className="font-bold text-zinc-800">{selectedCert.authority}</p>
                    <p>Verified HQ Registry</p>
                  </div>
                  <QrCode className="w-10 h-10 text-zinc-800" />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    handleDownloadCertificate(selectedCert.title);
                    setSelectedCert(null);
                  }}
                  className="w-full py-2 bg-[#18181B] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Download Verified PDF Copy</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
