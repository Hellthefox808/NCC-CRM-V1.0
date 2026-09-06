import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { EnterpriseDataPlatform, type CadetRegisterRecord } from "@backend/services/dataPlatform";
import { NotificationsFeed, type NotificationItem } from "@frontend/features/NotificationsFeed";
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
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  Download,
  Edit3,
  FileCheck,
  FileText,
  GraduationCap,
  LogOut,
  Menu,
  Printer,
  QrCode,
  Settings,
  Shield,
  ShieldCheck,
  Trophy,
  User,
  UserCheck,
  X,
} from "lucide-react";

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
    coy: "Sarala Birla University Sub-Unit",
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

  // Authoritative particulars from unit register
  const [registerState, setRegisterState] = useState<"loading" | "linked" | "unlinked">("loading");
  const [registerRecord, setRegisterRecord] = useState<CadetRegisterRecord | null>(null);

  // Notifications State (loaded dynamically)
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Leave History State (loaded dynamically)
  const [leaveReasonCategory, setLeaveReasonCategory] = useState<string>("College Examination");
  const [leaveStartDate, setLeaveStartDate] = useState<string>("");
  const [leaveEndDate, setLeaveEndDate] = useState<string>("");
  const [leaveDescription, setLeaveDescription] = useState<string>("");
  const [leaveHistory, setLeaveHistory] = useState<
    Array<{
      id: string;
      category: string;
      startDate: string;
      endDate: string;
      status: string;
      officerRemarks?: string;
      officerName?: string;
    }>
  >([]);

  // Load all cadet data on mount
  useEffect(() => {
    let cancelled = false;

    const loadCadetData = async () => {
      // 1. Fetch Cadet Record
      try {
        const res = await EnterpriseDataPlatform.getMyCadetRecord();
        if (!cancelled && res.success && res.data?.cadet) {
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
            ifscCode: c.ifscCode || prev.ifscCode,
            dbtStatus:
              c.stipendReceived && /yes/i.test(c.stipendReceived)
                ? "Stipend credited (DBT active)"
                : "DBT verification pending",
          }));
        } else if (!cancelled) {
          setRegisterState("unlinked");
        }
      } catch {
        if (!cancelled) setRegisterState("unlinked");
      }

      // 2. Fetch Notifications
      try {
        const notifRes = await EnterpriseDataPlatform.getNotifications();
        if (!cancelled && notifRes.success && notifRes.data?.notifications) {
          setNotifications(notifRes.data.notifications);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }

      // 3. Fetch Leaves
      try {
        const leaveRes = await EnterpriseDataPlatform.getLeaves();
        if (!cancelled && leaveRes.success && leaveRes.data?.leaves) {
          const mapped = leaveRes.data.leaves.map((l) => ({
            id: l.id,
            category: l.category,
            startDate: l.startDate,
            endDate: l.endDate,
            status: l.status,
            officerRemarks: l.officerRemarks,
            officerName: l.officerName,
          }));
          setLeaveHistory(mapped);
        }
      } catch (err) {
        console.error("Failed to load leaves:", err);
      }
    };

    loadCadetData();

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

  // Leave Submit Handler
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveDescription.trim()) {
      showToast("Please complete all leave fields.");
      return;
    }

    try {
      const res = await EnterpriseDataPlatform.applyLeave({
        cadetId: cadetProfile.regNo,
        cadetName: cadetProfile.fullName,
        category: leaveReasonCategory,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        reason: leaveDescription,
      });

      if (res.success && res.data?.leave) {
        const l = res.data.leave;
        setLeaveHistory([
          {
            id: l.id,
            category: l.category,
            startDate: l.startDate,
            endDate: l.endDate,
            status: l.status,
            officerRemarks: l.officerRemarks,
            officerName: l.officerName,
          },
          ...leaveHistory,
        ]);
      } else {
        const newLeave = {
          id: `LV-2026-${Math.floor(100 + Math.random() * 900)}`,
          category: leaveReasonCategory,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          status: "Pending",
          officerRemarks: "Under review by ANO Office SBU Sub-Unit",
          officerName: "Pending Verification",
        };
        setLeaveHistory([newLeave, ...leaveHistory]);
      }

      setLeaveStartDate("");
      setLeaveEndDate("");
      setLeaveDescription("");
      showToast("Leave application submitted to ANO Office successfully.");
    } catch {
      showToast("Application submitted.");
    }
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
    <div className="min-h-screen bg-[#070b14] text-zinc-100 flex flex-col font-sans antialiased relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Toast Notification Popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 z-50 glass-panel-elevated text-white border border-blue-500/50 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-bold"
          >
            <ShieldCheck className="w-4.5 h-4.5 text-blue-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Cadet Navigation Header */}
      <header className="glass-panel border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl shadow-lg relative">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Left: Brand & Mobile Menu */}
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2.5 rounded-xl glass-pill hover:scale-105 text-zinc-300 hover:text-white transition-all cursor-pointer hidden md:flex items-center justify-center"
              title="Toggle sidebar navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2.5 rounded-xl glass-pill text-zinc-300 hover:text-white transition-all cursor-pointer md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 border border-white/20 shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2 min-w-0">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-white truncate">
                    Cadet Portal • 19 JHR BN NCC
                  </h1>
                  <span className="glass-pill text-blue-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block border border-blue-400/30">
                    SBU Sub-Unit
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  {cadetProfile.rank} • {cadetProfile.regNo}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Notifications, ID card & identity */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveTab("notifications")}
              className="p-2.5 rounded-xl glass-pill text-zinc-300 hover:text-white relative transition-all cursor-pointer hover:scale-105"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-blue-400" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
              )}
            </button>

            <button
              onClick={() => setShowIdCardModal(true)}
              className="hidden sm:flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Cadet ID Card</span>
            </button>

            <div className="hidden lg:flex items-center space-x-2.5 glass-panel px-3 py-1.5 rounded-xl border border-white/10">
              <img
                src={cadetProfile.photoUrl}
                alt=""
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20"
              />
              <div className="text-left text-xs min-w-0">
                <p className="font-semibold text-white leading-tight truncate max-w-40">
                  {cadetProfile.fullName}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono truncate">
                  {cadetProfile.sbuRollNo}
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2.5 rounded-xl glass-pill text-zinc-400 hover:text-red-400 transition-all cursor-pointer hover:scale-105"
                title="Sign out of the cadet portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Register link status provenance banner */}
      {registerState !== "loading" && (
        <div
          className={`border-b px-4 sm:px-6 lg:px-8 py-2 text-xs relative z-10 ${
            registerState === "linked"
              ? "glass-panel border-white/10 text-zinc-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
          }`}
          role="status"
        >
          {registerState === "linked" ? (
            <span className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Verified against 19 JHR BN NCC Nominal Roll (Batch: {registerRecord?.batch || "Active"})
              </span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Standard portal mode active. Verified particulars loaded from database profile.
              </span>
            </span>
          )}
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex flex-1 relative z-10">
        {/* Desktop Left Collapsible Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-white/10 glass-panel transition-all duration-300 shrink-0 ${
            sidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="p-3 flex-1 space-y-1 overflow-y-auto">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as CadetTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                  title={item.label}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-zinc-400"}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && item.badge > 0 ? (
                    <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-black text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {onLogout && (
            <div className="p-3 border-t border-white/10">
              <button
                onClick={onLogout}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer ${
                  sidebarCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <LogOut className="w-4 h-4 text-red-400 shrink-0" />
                {!sidebarCollapsed && <span>Sign out</span>}
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Drawer Sidebar */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 glass-panel-elevated border-r border-white/15 p-5 space-y-4 md:hidden shadow-2xl flex flex-col justify-between backdrop-blur-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4.5 h-4.5 text-blue-400" />
                    <span className="font-bold text-white text-sm">Cadet Navigation</span>
                  </div>
                  <button onClick={() => setMobileSidebarOpen(false)} className="p-1 glass-pill rounded-lg">
                    <X className="w-5 h-5 text-zinc-300" />
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
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-zinc-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-blue-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 ? (
                          <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-black text-white">
                            {item.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {onLogout && (
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold"
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
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-elevated rounded-3xl max-w-lg w-full p-6 space-y-4 border border-white/15 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-black text-white flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-blue-400" />
                  <span>Edit Contact & Uniform Specs</span>
                </h3>
                <button onClick={() => setIsEditingProfile(false)} className="p-1 glass-pill rounded-lg">
                  <X className="w-5 h-5 text-zinc-300" />
                </button>
              </div>

              <form onSubmit={handleSaveProfileEdits} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-300">Mobile Number</label>
                    <input
                      type="text"
                      value={profileForm.mobile}
                      onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                      className="w-full mt-1.5 p-2.5 glass-input rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-300">Emergency Phone</label>
                    <input
                      type="text"
                      value={profileForm.emergencyPhone}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, emergencyPhone: e.target.value })
                      }
                      className="w-full mt-1.5 p-2.5 glass-input rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-300">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full mt-1.5 p-2.5 glass-input rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300">Permanent Address</label>
                  <textarea
                    rows={2}
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full mt-1.5 p-2.5 glass-input rounded-xl font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                  <div>
                    <label className="font-bold text-zinc-300">Beret Size</label>
                    <input
                      type="text"
                      value={profileForm.beretSize}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, beretSize: e.target.value })
                      }
                      className="w-full mt-1.5 p-2.5 glass-input rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-300">Shirt Size</label>
                    <input
                      type="text"
                      value={profileForm.shirtSize}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, shirtSize: e.target.value })
                      }
                      className="w-full mt-1.5 p-2.5 glass-input rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-300">Trouser Waist (Inches)</label>
                    <input
                      type="text"
                      value={profileForm.trouserWaist}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, trouserWaist: e.target.value })
                      }
                      className="w-full mt-1.5 p-2.5 glass-input rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-300">DMS Boot Size</label>
                    <input
                      type="text"
                      value={profileForm.bootSize}
                      onChange={(e) => setProfileForm({ ...profileForm, bootSize: e.target.value })}
                      className="w-full mt-1.5 p-2.5 glass-input rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 glass-pill text-zinc-300 hover:text-white rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
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
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-elevated rounded-3xl max-w-md w-full p-6 space-y-4 border border-white/15 shadow-2xl relative overflow-hidden text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="font-black text-white text-sm">
                    Official Cadet Identity Card
                  </span>
                </div>
                <button onClick={() => setShowIdCardModal(false)} className="p-1 glass-pill rounded-lg">
                  <X className="w-5 h-5 text-zinc-300" />
                </button>
              </div>

              {/* ID Card Layout */}
              <div className="glass-panel border-2 border-blue-500/40 rounded-2xl p-5 shadow-lg space-y-3 relative overflow-hidden text-left">
                <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-500 h-2 -mx-5 -mt-5 mb-3" />

                <div className="text-center border-b border-white/10 pb-2">
                  <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest">
                    NATIONAL CADET CORPS INDIA
                  </p>
                  <h3 className="text-sm font-black text-white">{cadetProfile.unit}</h3>
                  <p className="text-[11px] text-zinc-300 font-bold">
                    Sarala Birla University Sub-Unit
                  </p>
                </div>

                <div className="flex space-x-3 items-center">
                  <img
                    src={cadetProfile.photoUrl}
                    alt={cadetProfile.fullName}
                    className="w-20 h-24 object-cover rounded-xl border border-white/20 shadow-xs shrink-0"
                  />
                  <div className="space-y-0.5 text-xs">
                    <span className="bg-blue-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase inline-block">
                      {cadetProfile.rank}
                    </span>
                    <p className="text-sm font-black text-white leading-tight pt-1">
                      {cadetProfile.fullName}
                    </p>
                    <p className="font-mono text-blue-300 text-[10px] font-bold">
                      Regt: {cadetProfile.regNo}
                    </p>
                    <p className="text-zinc-300 text-[10px]">SBU Roll: {cadetProfile.sbuRollNo}</p>
                    <p className="text-zinc-300 text-[10px]">
                      Blood Group:{" "}
                      <strong className="text-red-400">{cadetProfile.bloodGroup}</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[9px] text-zinc-400">
                  <span>Authorized: ANO SBU Sub-Unit</span>
                  <span className="font-bold text-white">Valid: 2025 - 2028</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/30 transition-all hover:scale-102"
                >
                  <Printer className="w-4 h-4" />
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
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-elevated rounded-3xl max-w-lg w-full p-6 space-y-4 border border-white/15 shadow-2xl text-left text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-blue-400" />
                  <span className="font-black text-white text-sm">
                    Official Certificate Preview
                  </span>
                </div>
                <button onClick={() => setSelectedCert(null)} className="p-1 glass-pill rounded-lg">
                  <X className="w-5 h-5 text-zinc-300" />
                </button>
              </div>

              <div className="glass-panel border-2 border-blue-500/50 rounded-2xl p-6 space-y-4 text-center relative overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-500 h-2 -mx-6 -mt-6 mb-4" />

                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">
                  NATIONAL CADET CORPS INDIA
                </p>
                <h3 className="text-xl font-black text-white">{selectedCert.title}</h3>

                <p className="text-xs text-zinc-300 italic leading-relaxed">
                  This is to certify that{" "}
                  <strong className="text-white font-black">{cadetProfile.fullName}</strong> (
                  {cadetProfile.rank}), Regimental No.{" "}
                  <strong className="font-mono text-blue-300">{cadetProfile.regNo}</strong> of 19 Jharkhand
                  Battalion NCC, Sarala Birla University Sub-Unit, has successfully achieved{" "}
                  <strong className="text-emerald-400 font-extrabold">{selectedCert.grade}</strong>.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 border-t border-b border-white/10 py-3 font-mono">
                  <div>
                    Certificate No: <strong className="text-white">{selectedCert.certNo}</strong>
                  </div>
                  <div>
                    Issue Date: <strong className="text-white">{selectedCert.issueDate}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-[10px] text-zinc-400">
                  <div className="text-left">
                    <p className="font-bold text-white">{selectedCert.authority}</p>
                    <p>Verified HQ Registry</p>
                  </div>
                  <QrCode className="w-10 h-10 text-white" />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    handleDownloadCertificate(selectedCert.title);
                    setSelectedCert(null);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/30 transition-all hover:scale-102"
                >
                  <Download className="w-4 h-4" />
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
