import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { NotificationsFeed } from "./NotificationsFeed";
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
  X 
} from "lucide-react";
import { BATTALION_DETAILS, PHYSICAL_FITNESS_STANDARDS } from "../data/nccData";

interface CadetDashboardProps {
  onLogout?: () => void;
}

export const CadetDashboard: React.FC<CadetDashboardProps> = ({ onLogout }) => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<
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
    | "settings"
  >("dashboard");

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
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
  });

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
    bootSize: cadetProfile.bootSize
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
    campPercent: 100
  };

  const attendanceLog = [
    { date: "2026-08-02", topic: "Squad Drill & Salute on March", instructor: "Subedar Major AI / PI Staff", status: "Present", remarks: "Turnout A1 Excellent" },
    { date: "2026-07-28", topic: "0.22 Rifle Stripping & Safety Rules", instructor: "Havildar Rajveer", status: "Present", remarks: "Good Speed in Assembly" },
    { date: "2026-07-25", topic: "Map Reading: Prismatic Compass", instructor: "Capt. Dr. Animesh Roy", status: "Present", remarks: "Target Grid Identified" },
    { date: "2026-07-20", topic: "Obstacle Course & Physical Conditioning", instructor: "PI Staff", status: "Late", remarks: "Arrived 10 mins late" },
    { date: "2026-07-15", topic: "Fieldcraft & Section Formation", instructor: "Subedar Major AI", status: "Present", remarks: "Satisfactory" },
    { date: "2026-07-10", topic: "Disaster Management & First Aid", instructor: "Capt. Dr. Animesh Roy", status: "Leave", remarks: "College Exam Duty" },
    { date: "2026-07-05", topic: "Ceremonial Drill Practice", instructor: "PI Staff", status: "Present", remarks: "Paces verified" },
    { date: "2026-06-30", topic: "Health & Hygiene Lecture", instructor: "ANO Office", status: "Absent", remarks: "Unexcused Absence" }
  ];

  // Tasks & Checklist for Cadet
  const [tasks, setTasks] = useState([
    { id: "1", title: "Get DMS Boots Polished & Ankle Webbing Blanco Pressed", completed: true, category: "Parade Prep" },
    { id: "2", title: "Submit Parent Consent Certificate for ATC Ranchi Camp", completed: false, category: "Camp Documents" },
    { id: "3", title: "Revise 0.22 Deluxe Rifle Safety Precautions for WT Exam", completed: false, category: "Training" },
    { id: "4", title: "Collect Hackle & Line Dori from CQMS Store", completed: true, category: "Uniform" }
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
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
      officerName: "Capt. Dr. Animesh Roy (ANO)"
    },
    {
      id: "LV-2026-042",
      category: "Medical Unfitness",
      startDate: "2026-05-18",
      endDate: "2026-05-20",
      appliedOn: "2026-05-17",
      status: "Approved",
      officerRemarks: "Medical certificate verified.",
      officerName: "ANO Office"
    }
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
      officerName: "Pending Verification"
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
      explanation: "The effective range of 0.22 Deluxe Rifle is 25 Yards (23 Meters)."
    },
    {
      question: "In Squad Drill, how many paces are taken in 'Tez Chal' (Quick March) per minute?",
      options: ["110 Paces/min", "120 Paces/min", "140 Paces/min", "90 Paces/min"],
      correct: 1,
      explanation: "Standard marching speed for SD male cadets in Quick March is 120 paces per minute."
    },
    {
      question: "Which angle is formed between feet in 'Savdhan' position?",
      options: ["30 Degrees", "45 Degrees", "60 Degrees", "90 Degrees"],
      correct: 0,
      explanation: "In Savdhan (Attention), the heels are together and toes are separated at an angle of 30 degrees."
    }
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
      category: "Parade Order"
    },
    {
      id: "N2",
      title: "ATC Ranchi Camp Document Verification Notice",
      body: "Cadets selected for ATC Ranchi must submit original Parent Consent and Medical Fitness certificates by 10 Aug.",
      date: "2026-07-28 11:00",
      read: false,
      priority: "Urgent",
      category: "Camp Notice"
    },
    {
      id: "N3",
      title: "Special Drill & Weapon Handling Class Scheduled",
      body: "Subedar Major B.S. Gurung will conduct hands-on 0.22 rifle stripping class on Friday morning.",
      date: "2026-07-24 14:15",
      read: true,
      priority: "Normal",
      category: "Training"
    }
  ]);

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
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
      bootSize: profileForm.bootSize
    });
    setIsEditingProfile(false);
    showToast("Profile details updated successfully.");
  };

  // Trigger Certificate Download Confetti
  const handleDownloadCertificate = (certTitle: string) => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
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
    { id: "notifications", label: "Notifications", icon: Bell, badge: notifications.filter(n => !n.read).length },
    { id: "leave", label: "Leave / Permission", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Toast Notification Popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-22 left-1/2 z-50 bg-[#001733] text-white border-2 border-yellow-400 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-bold"
          >
            <ShieldCheck className="w-5 h-5 text-yellow-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Cadet Navigation Header */}
      <header className="bg-[#001733] text-white border-b border-yellow-500/30 sticky top-0 z-40 shadow-xl">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Mobile Menu */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer hidden md:flex items-center justify-center"
              title="Toggle Sidebar Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 border-2 border-yellow-400 shrink-0 flex items-center justify-center overflow-hidden">
                <Shield className="w-6 h-6 text-[#002147]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight text-white">
                    19 JHR BN NCC • Cadet Portal
                  </h1>
                  <span className="bg-yellow-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                    SBU Company
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  {cadetProfile.rank} • Regt No: {cadetProfile.regNo}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Notifications, Quick Actions & Profile Badge */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveTab("notifications")}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 relative transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-yellow-400" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#001733] animate-ping" />
              )}
            </button>

            <button
              onClick={() => setShowIdCardModal(true)}
              className="hidden sm:flex bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-slate-950" />
              <span>Cadet ID Card</span>
            </button>

            <div className="flex items-center space-x-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl">
              <img
                src={cadetProfile.photoUrl}
                alt={cadetProfile.fullName}
                className="w-7 h-7 rounded-full object-cover border border-yellow-400 shrink-0"
              />
              <div className="text-left text-xs hidden lg:block">
                <p className="font-extrabold text-white leading-tight">{cadetProfile.fullName}</p>
                <p className="text-[10px] text-yellow-300">{cadetProfile.sbuRollNo}</p>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors cursor-pointer"
                title="Logout Cadet Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* Desktop Left Collapsible Sidebar */}
        <aside
          className={`bg-[#001229] border-r border-yellow-500/20 text-slate-200 transition-all duration-300 hidden md:flex flex-col shrink-0 ${
            sidebarCollapsed ? "w-18" : "w-64"
          }`}
        >
          <div className="p-4 flex-1 space-y-1.5 overflow-y-auto">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-yellow-400 text-slate-950 shadow-md font-black"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                  title={item.label}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-yellow-400"}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && item.badge > 0 ? (
                    <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/10">
            {onLogout ? (
              <button
                onClick={onLogout}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer ${
                  sidebarCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <LogOut className="w-4 h-4 text-red-400 shrink-0" />
                {!sidebarCollapsed && <span>Logout Cadet Portal</span>}
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
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[#001229] border-r border-yellow-500/30 p-5 space-y-4 md:hidden shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    <span className="font-black text-white text-sm">Cadet Navigation</span>
                  </div>
                  <button onClick={() => setMobileSidebarOpen(false)}>
                    <X className="w-5 h-5 text-slate-300" />
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
                          setActiveTab(item.id as any);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? "bg-yellow-400 text-slate-950 font-black"
                            : "text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-yellow-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 ? (
                          <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
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
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-xl text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout Cadet Portal</span>
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
            <div className="space-y-6">
              
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-[#002147] via-[#001838] to-[#001026] text-white rounded-2xl p-6 border border-yellow-500/40 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  <div className="flex items-center space-x-4">
                    <img
                      src={cadetProfile.photoUrl}
                      alt={cadetProfile.fullName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-yellow-400 shadow-md shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span className="bg-yellow-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                          {cadetProfile.rank}
                        </span>
                        <span className="bg-white/10 text-yellow-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-white/20">
                          {cadetProfile.batch}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        Welcome back, {cadetProfile.fullName}!
                      </h2>
                      <p className="text-xs text-slate-300">
                        {cadetProfile.unit} • Sarala Birla University Company
                      </p>
                      <p className="text-[11px] text-yellow-300 font-mono font-bold">
                        Regt No: {cadetProfile.regNo} • SBU Roll: {cadetProfile.sbuRollNo}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveTab("leave")}
                      className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-slate-950" />
                      <span>Apply Leave</span>
                    </button>
                    <button
                      onClick={() => setShowIdCardModal(true)}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-white/20 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-yellow-400" />
                      <span>Download ID Card</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("attendance")}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-white/20 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-yellow-400" />
                      <span>View Attendance</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* KPI Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-yellow-400 transition-all">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Parade Attendance</span>
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-emerald-700">{attendanceSummary.percentage}%</span>
                    <span className="text-xs text-slate-500 font-semibold">Requirement ≥75%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{attendanceSummary.attended} of {attendanceSummary.totalParades} Sessions Attended</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-yellow-400 transition-all">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Certificates & Rank</span>
                    <Award className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-slate-900">L/Cpl</span>
                    <span className="text-xs text-yellow-600 font-bold">'B' Exam Eligible</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">'A' Cert Alpha Grade • 2 Awards</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-yellow-400 transition-all">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Camp Status</span>
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-blue-700">ATC Ranchi</span>
                    <span className="text-xs text-blue-600 font-extrabold">Nominated</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Reporting 15 Aug • Namkum Cantt</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-yellow-400 transition-all">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Physical Fitness</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-slate-900">100%</span>
                    <span className="text-xs text-emerald-600 font-bold">Passed</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">1600m Run in 5m 45s • Height 175cm</p>
                </div>

              </div>

              {/* Main Content Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Upcoming Parades, Camps & Preparation Tasks */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Next Scheduled Parade & Camp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Upcoming Parade Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                          Next Parade Drill
                        </span>
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">Squad Drill & Arms Inspection</h4>
                        <p className="text-xs text-slate-600">05 August 2026 • 06:30 AM Sharp</p>
                      </div>

                      <div className="space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <p className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>Venue: SBU Sports Ground & Parade Deck</span>
                        </p>
                        <p className="flex items-center space-x-2">
                          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>Instructor: Subedar Major B.S. Gurung</span>
                        </p>
                        <p className="flex items-center space-x-2">
                          <Shield className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                          <span>Uniform: Working Dress No. 2 (Khaki & DMS)</span>
                        </p>
                      </div>
                    </div>

                    {/* Upcoming Camp Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                          Upcoming Battalion Camp
                        </span>
                        <Award className="w-4 h-4 text-emerald-600" />
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">Annual Training Camp (ATC Ranchi)</h4>
                        <p className="text-xs text-slate-600">15 Aug - 24 Aug 2026 (10 Days)</p>
                      </div>

                      <div className="space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <p className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>Namkum Military Station, Ranchi</span>
                        </p>
                        <p className="flex items-center space-x-2">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Nomination Status: Confirmed & Verified</span>
                        </p>
                        <p className="flex items-center space-x-2">
                          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>Action: Medical & Parent Consent Submitted</span>
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Assigned Parade Preparation Tasks */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                          <span>Parade Preparation Checklist</span>
                        </h3>
                        <p className="text-xs text-slate-500">Personal tasks for upcoming inspection & camp</p>
                      </div>
                      <span className="text-xs font-extrabold text-slate-600">
                        {tasks.filter(t => t.completed).length} of {tasks.length} Completed
                      </span>
                    </div>

                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                            task.completed
                              ? "bg-emerald-50/60 border-emerald-200 text-emerald-900 line-through"
                              : "bg-slate-50 border-slate-200 text-slate-800 hover:border-yellow-400"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border font-bold ${
                              task.completed ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-400 bg-white"
                            }`}>
                              {task.completed && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <span className="font-bold">{task.title}</span>
                          </div>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-extrabold uppercase">
                            {task.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity Timeline */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <h3 className="font-black text-slate-900 text-base">Recent Activity Timeline</h3>
                    
                    <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                      
                      <div className="relative">
                        <span className="absolute -left-8 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200" />
                        <p className="text-xs font-extrabold text-slate-900">Attended Squad Drill Parade (02 Aug 2026)</p>
                        <p className="text-[11px] text-slate-500">Marked PRESENT (Grade A1 Turnout) by PI Staff B.S. Gurung</p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-8 top-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-200" />
                        <p className="text-xs font-extrabold text-slate-900">Leave Application Approved (28 Jul 2026)</p>
                        <p className="text-[11px] text-slate-500">College Exam leave request for 10-12 July approved by ANO Office</p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-8 top-0.5 w-4 h-4 rounded-full bg-yellow-500 border-2 border-white ring-2 ring-yellow-200" />
                        <p className="text-xs font-extrabold text-slate-900">Promoted to Lance Corporal (L/Cpl)</p>
                        <p className="text-[11px] text-slate-500">Rank badge conferred by Commanding Officer 19 JHR BN NCC</p>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Right 1 Col: Recent Notifications & Quick Study Snippets */}
                <div className="space-y-6">
                  
                  {/* Notifications Preview Widget */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-yellow-500" />
                        <span>Officer Notices</span>
                      </h4>
                      <button
                        onClick={() => setActiveTab("notifications")}
                        className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {notifications.slice(0, 2).map((n) => (
                        <div key={n.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="font-extrabold text-slate-900">{n.title}</span>
                            <span className="bg-red-100 text-red-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                              {n.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-slate-400 pt-1">{n.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Syllabus / Exam Prep Quick Snippet */}
                  <div className="bg-[#001733] text-white rounded-2xl p-5 shadow-md space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h4 className="font-black text-yellow-400 text-sm flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>'B' Cert Exam Prep</span>
                      </h4>
                      <span className="text-[10px] bg-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded">
                        2026 Batch
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="font-extrabold text-white">Weapon Training (0.22 Rifle)</p>
                      <p className="text-[11px] text-slate-300">
                        Mag capacity: 5 rounds • Calibre: 0.22 inch • Muzzle velocity: 2700 ft/sec.
                      </p>
                      <button
                        onClick={() => setActiveTab("materials")}
                        className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl font-extrabold text-xs transition-all cursor-pointer mt-2"
                      >
                        Open Full Study Materials
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MY PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={cadetProfile.photoUrl}
                      alt={cadetProfile.fullName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-yellow-400 shadow-md"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-2xl font-black text-slate-900">{cadetProfile.fullName}</h2>
                        <span className="bg-yellow-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase">
                          {cadetProfile.rank}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-600 font-bold mt-1">
                        Regimental No: {cadetProfile.regNo}
                      </p>
                      <p className="text-xs text-slate-500">
                        {cadetProfile.coy} • {cadetProfile.sbuCourse}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="bg-[#002147] hover:bg-[#001838] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-4 h-4 text-yellow-400" />
                      <span>Edit Contact & Sizes</span>
                    </button>
                    <button
                      onClick={() => setShowIdCardModal(true)}
                      className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <QrCode className="w-4 h-4 text-slate-950" />
                      <span>Print ID Card</span>
                    </button>
                  </div>
                </div>

                {/* Profile Grid Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Personal Info */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-2">
                      <User className="w-4 h-4 text-yellow-500" />
                      <span>Personal Details</span>
                    </h3>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between"><span className="text-slate-500">Full Name:</span><span className="font-bold">{cadetProfile.fullName}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Gender & Wing:</span><span className="font-bold">{cadetProfile.gender}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Date of Birth:</span><span className="font-bold">{cadetProfile.dob}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Blood Group:</span><span className="font-bold text-red-600">{cadetProfile.bloodGroup}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Mobile Phone:</span><span className="font-bold">{cadetProfile.mobile}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Email:</span><span className="font-bold text-blue-700">{cadetProfile.email}</span></div>
                    </div>
                  </div>

                  {/* Official NCC Info (Read-only) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-2">
                      <Shield className="w-4 h-4 text-[#002147]" />
                      <span>NCC Official Information</span>
                      <Lock className="w-3.5 h-3.5 text-slate-400 ml-auto" title="Officer Read-Only" />
                    </h3>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between"><span className="text-slate-500">Battalion Unit:</span><span className="font-bold text-slate-900">{cadetProfile.unit}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Company Unit:</span><span className="font-bold">{cadetProfile.coy}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Group HQ:</span><span className="font-bold">{cadetProfile.groupHQ}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Directorate:</span><span className="font-bold">{cadetProfile.directorate}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Enrollment Batch:</span><span className="font-bold text-emerald-800">{cadetProfile.batch}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Joining Year:</span><span className="font-bold">{cadetProfile.joiningYear}</span></div>
                    </div>
                  </div>

                  {/* University Details */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span>University Credentials</span>
                    </h3>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between"><span className="text-slate-500">University:</span><span className="font-bold">Sarala Birla University</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">SBU Roll No:</span><span className="font-mono font-bold text-slate-900">{cadetProfile.sbuRollNo}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Course / Branch:</span><span className="font-bold">{cadetProfile.sbuCourse}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Year / Semester:</span><span className="font-bold">{cadetProfile.sbuYear}</span></div>
                    </div>
                  </div>

                  {/* Physical Fitness & Medical */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Physical & Medical Parameters</span>
                    </h3>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between"><span className="text-slate-500">Height / Weight:</span><span className="font-bold">{cadetProfile.heightCm} cm / {cadetProfile.weightKg} kg</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">BMI Rating:</span><span className="font-bold text-emerald-700">{cadetProfile.bmi}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Chest Circumference:</span><span className="font-bold">{cadetProfile.chestCm}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Physical Test Score:</span><span className="font-bold text-emerald-800">{cadetProfile.fitnessStatus}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Medical Fitness:</span><span className="font-bold text-slate-900">{cadetProfile.medicalRemarks}</span></div>
                    </div>
                  </div>

                  {/* Uniform Size Specifications */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Uniform Size Specifications</span>
                    </h3>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between"><span className="text-slate-500">Beret Size:</span><span className="font-bold">{cadetProfile.beretSize}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Khaki Shirt Size:</span><span className="font-bold">{cadetProfile.shirtSize}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Trouser Waist:</span><span className="font-bold">{cadetProfile.trouserWaist}"</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">DMS Boots Size:</span><span className="font-bold">{cadetProfile.bootSize}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Hackle Color:</span><span className="font-bold">{cadetProfile.hackleColor}</span></div>
                    </div>
                  </div>

                  {/* Document & Bank Account Verification */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>DBT & Verified Documents</span>
                    </h3>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between items-center"><span className="text-slate-500">Aadhaar Verification:</span><span className="font-bold text-emerald-700">Verified ✓</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-500">Bank Passbook (DBT):</span><span className="font-bold text-emerald-700">Verified ✓</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-500">Parent Consent Form:</span><span className="font-bold text-emerald-700">Verified ✓</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-500">Bank Account No:</span><span className="font-mono font-bold">{cadetProfile.accountNo}</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-500">Bank IFSC:</span><span className="font-mono font-bold">{cadetProfile.ifscCode}</span></div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: MY ATTENDANCE */}
          {activeTab === "attendance" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Parade & Drill Attendance CRM</h2>
                    <p className="text-xs text-slate-500">19 JHR BN NCC SBU Company Official Attendance Record</p>
                  </div>

                  <button
                    onClick={() => {
                      confetti({ particleCount: 50 });
                      showToast("Generating official parade attendance report PDF...");
                    }}
                    className="bg-[#002147] hover:bg-[#001838] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-yellow-400" />
                    <span>Download Attendance Report</span>
                  </button>
                </div>

                {/* Score Meters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-slate-500 text-[11px] font-bold uppercase">Overall Attendance</p>
                    <p className="text-3xl font-black text-emerald-700">{attendanceSummary.percentage}%</p>
                    <p className="text-[10px] text-emerald-800 font-bold">Eligible for 'B' & 'C' Exams</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-slate-500 text-[11px] font-bold uppercase">Parades Attended</p>
                    <p className="text-3xl font-black text-slate-900">{attendanceSummary.attended} / {attendanceSummary.totalParades}</p>
                    <p className="text-[10px] text-slate-500">Total Mandatory Drills</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-slate-500 text-[11px] font-bold uppercase">Absences & Late</p>
                    <p className="text-3xl font-black text-amber-600">{attendanceSummary.absent} Abs • {attendanceSummary.late} Late</p>
                    <p className="text-[10px] text-slate-500">Excused: {attendanceSummary.leave} Leave</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-slate-500 text-[11px] font-bold uppercase">Camp Attendance</p>
                    <p className="text-3xl font-black text-blue-700">{attendanceSummary.campPercent}%</p>
                    <p className="text-[10px] text-blue-700 font-bold">CATC-I Ranchi Completed</p>
                  </div>

                </div>

                {/* Category Percentages */}
                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h3 className="font-extrabold text-slate-900 text-sm">Attendance Breakdown by Activity Category</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>Squad & Ceremonial Drill:</span>
                        <span>{attendanceSummary.drillPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${attendanceSummary.drillPercent}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>Weapon Training & Theory Classes:</span>
                        <span>{attendanceSummary.classPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${attendanceSummary.classPercent}%` }} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Attendance Log Table */}
                <div className="space-y-3">
                  <h3 className="font-black text-slate-900 text-base">Parade Sessions History</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                          <th className="p-3">Date</th>
                          <th className="p-3">Parade Subject / Topic</th>
                          <th className="p-3">Instructor / PI Staff</th>
                          <th className="p-3">Turnout & Status</th>
                          <th className="p-3">Officer Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendanceLog.map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-800">{log.date}</td>
                            <td className="p-3 font-extrabold text-slate-900">{log.topic}</td>
                            <td className="p-3 text-slate-600">{log.instructor}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                log.status === "Present"
                                  ? "bg-emerald-100 text-emerald-900"
                                  : log.status === "Late"
                                  ? "bg-amber-100 text-amber-900"
                                  : log.status === "Leave"
                                  ? "bg-blue-100 text-blue-900"
                                  : "bg-red-100 text-red-900"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 italic">{log.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: ACTIVITIES & EVENTS */}
          {activeTab === "activities" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Activities, Camps & Social Drives</h2>
                  <p className="text-xs text-slate-500">Participate in 19 JHR BN NCC camps, shooting trials, and university community events</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Event 1 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        Nominated
                      </span>
                      <Calendar className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Annual Training Camp (ATC Ranchi 2026)</h3>
                    <p className="text-xs text-slate-600">10-day intensive military training camp covering firing, map reading, obstacle course & parade drill.</p>
                    <div className="text-xs text-slate-700 space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                      <p><strong>Dates:</strong> 15 Aug - 24 Aug 2026</p>
                      <p><strong>Venue:</strong> Namkum Military Garrison, Ranchi</p>
                      <p><strong>Kit Required:</strong> Khaki Uniform 2 sets, DMS Boots, Webbing Belt, Mess Tin, Bedding</p>
                    </div>
                  </div>

                  {/* Event 2 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        Upcoming Event
                      </span>
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Swachh Bharat & Mega Blood Donation Drive</h3>
                    <p className="text-xs text-slate-600">Social service initiative organized by SBU NCC Company in collaboration with RIMS Ranchi.</p>
                    <div className="text-xs text-slate-700 space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                      <p><strong>Date:</strong> 12 August 2026 • 09:00 AM</p>
                      <p><strong>Venue:</strong> SBU Main Auditorium & Health Center</p>
                      <p><strong>Duty:</strong> Volunteer & Blood Donor Cadet List</p>
                    </div>
                  </div>

                </div>

                {/* Event Photo Gallery */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h3 className="font-black text-slate-900 text-base">NCC Cadre Event Photo Gallery</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1 text-center">
                      <img
                        src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80"
                        alt="Parade Ground Drill"
                        className="w-full h-32 object-cover rounded-xl border border-slate-300 shadow-2xs hover:scale-105 transition-transform"
                      />
                      <p className="text-[11px] font-bold text-slate-800">Ceremonial Drill Practice</p>
                    </div>

                    <div className="space-y-1 text-center">
                      <img
                        src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80"
                        alt="Firing Range Training"
                        className="w-full h-32 object-cover rounded-xl border border-slate-300 shadow-2xs hover:scale-105 transition-transform"
                      />
                      <p className="text-[11px] font-bold text-slate-800">0.22 Rifle Firing Range</p>
                    </div>

                    <div className="space-y-1 text-center">
                      <img
                        src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=400&q=80"
                        alt="Kargil Vijay Diwas"
                        className="w-full h-32 object-cover rounded-xl border border-slate-300 shadow-2xs hover:scale-105 transition-transform"
                      />
                      <p className="text-[11px] font-bold text-slate-800">Kargil Vijay Diwas Guard</p>
                    </div>

                    <div className="space-y-1 text-center">
                      <img
                        src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=400&q=80"
                        alt="Trekking Expedition"
                        className="w-full h-32 object-cover rounded-xl border border-slate-300 shadow-2xs hover:scale-105 transition-transform"
                      />
                      <p className="text-[11px] font-bold text-slate-800">Netarhat Trekking Camp</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: CLASSES & TRAINING */}
          {activeTab === "training" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Classes, Syllabus & Practice Quiz</h2>
                  <p className="text-xs text-slate-500">Weapon Training, Map Reading, Fieldcraft and 'B' & 'C' Certificate Exam Syllabus</p>
                </div>

                {/* Practice Quiz Card */}
                <div className="bg-slate-50 border-2 border-yellow-400/60 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <span>Interactive Practice Quiz ('B' Certificate Prep)</span>
                    </h3>
                    <span className="text-xs font-mono font-bold bg-yellow-400 text-slate-950 px-2 py-0.5 rounded">
                      3 Questions
                    </span>
                  </div>

                  <div className="space-y-4">
                    {quizQuestions.map((q, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <p className="font-extrabold text-slate-900">{idx + 1}. {q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswer[idx] === optIdx;
                            const isCorrect = q.correct === optIdx;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => !quizSubmitted && setQuizAnswer({ ...quizAnswer, [idx]: optIdx })}
                                className={`p-2 rounded-lg text-left font-bold transition-all border ${
                                  quizSubmitted
                                    ? isCorrect
                                      ? "bg-emerald-100 border-emerald-500 text-emerald-900"
                                      : isSelected
                                      ? "bg-red-100 border-red-500 text-red-900"
                                      : "bg-slate-50 border-slate-200 text-slate-600"
                                    : isSelected
                                    ? "bg-[#002147] text-white border-[#002147]"
                                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 italic">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}

                    <div className="pt-2 flex justify-between items-center">
                      {!quizSubmitted ? (
                        <button
                          onClick={() => {
                            setQuizSubmitted(true);
                            confetti({ particleCount: 40 });
                            showToast("Quiz submitted! Review explanations below.");
                          }}
                          className="bg-[#002147] hover:bg-[#001838] text-white font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
                        >
                          Submit Answers
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setQuizSubmitted(false);
                            setQuizAnswer({});
                          }}
                          className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
                        >
                          Retry Quiz
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Common Words of Command Guide */}
                <div className="space-y-3">
                  <h3 className="font-black text-slate-900 text-base">Essential Hindi Words of Command (Parade Drill)</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="font-black text-[#002147]">सावधान (SAVDHAN)</p>
                      <p className="text-[11px] text-slate-600">Attention position, heels together, feet at 30° angle.</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="font-black text-[#002147]">विश्राम (VISHRAM)</p>
                      <p className="text-[11px] text-slate-600">Stand at ease, left foot moved 12 inches to the left.</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="font-black text-[#002147]">तेज चल (TEZ CHAL)</p>
                      <p className="text-[11px] text-slate-600">Quick march at 120 paces/minute starting left foot.</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="font-black text-[#002147]">सलामी शस्त्र (SALAMI SHASTRA)</p>
                      <p className="text-[11px] text-slate-600">Present Arms salute for Dignitaries & Officers above Major.</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="font-black text-[#002147]">दाहिने मुड़ (DAHINE VUR)</p>
                      <p className="text-[11px] text-slate-600">Right turn at 90 degrees on right heel and left toe.</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="font-black text-[#002147]">विसर्जन (VISARJAN)</p>
                      <p className="text-[11px] text-slate-600">Dismissal of parade with salute to presiding officer.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: CERTIFICATES */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Official Certificates & Awards</h2>
                  <p className="text-xs text-slate-500">Issued by 19 Jharkhand Battalion NCC & Bihar-Jharkhand Directorate</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Cert 1 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <Award className="w-8 h-8 text-yellow-500" />
                      <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        Grade 'Alpha'
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900">NCC 'A' Certificate</h3>
                    <p className="text-xs text-slate-600">Passed Junior Division exam with distinction in firing and drill proficiency.</p>
                    <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                      <p>Cert Serial: JHR/2025/A-10482</p>
                      <p>Issue Date: 15 March 2025</p>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => setSelectedCert({
                          title: "NCC 'A' Certificate",
                          certNo: "JHR/2025/A-10482",
                          issueDate: "15 March 2025",
                          authority: "Commanding Officer 19 JHR BN NCC",
                          grade: "Alpha (Distinction)"
                        })}
                        className="flex-1 py-2 bg-[#002147] text-white rounded-xl text-xs font-bold hover:bg-[#001838] cursor-pointer"
                      >
                        Verify & View
                      </button>
                      <button
                        onClick={() => handleDownloadCertificate("NCC 'A' Certificate")}
                        className="py-2 px-3 bg-yellow-400 text-slate-950 rounded-xl text-xs font-bold hover:bg-yellow-300 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Cert 2 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <ShieldCheck className="w-8 h-8 text-blue-600" />
                      <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        Camp Certificate
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Combined Annual Training Camp (CATC-I)</h3>
                    <p className="text-xs text-slate-600">Completed 10 days CATC at Namkum Military Station with 1600m athletics badge.</p>
                    <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                      <p>Cert Serial: CATC-I/2025/SBU-08</p>
                      <p>Issue Date: 28 October 2025</p>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => setSelectedCert({
                          title: "Combined Annual Training Camp (CATC-I)",
                          certNo: "CATC-I/2025/SBU-08",
                          issueDate: "28 October 2025",
                          authority: "Camp Commandant CATC-I Namkum",
                          grade: "Completed with Merit"
                        })}
                        className="flex-1 py-2 bg-[#002147] text-white rounded-xl text-xs font-bold hover:bg-[#001838] cursor-pointer"
                      >
                        Verify & View
                      </button>
                      <button
                        onClick={() => handleDownloadCertificate("CATC-I Camp Certificate")}
                        className="py-2 px-3 bg-yellow-400 text-slate-950 rounded-xl text-xs font-bold hover:bg-yellow-300 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 7: ACHIEVEMENTS */}
          {activeTab === "achievements" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Awards, Medals & Badges</h2>
                  <p className="text-xs text-slate-500">Recognitions awarded during battalion drills, sports selections & shooting trials</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-400/20 text-yellow-600 flex items-center justify-center mx-auto">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-slate-900 text-sm">Best Turned Out Cadet</h3>
                    <p className="text-xs text-slate-600">Awarded for flawless uniform turnout, boots polish & drill precision at Kargil Vijay Diwas Parade.</p>
                    <span className="text-[10px] bg-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded-full inline-block">
                      July 2026
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <Star className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-slate-900 text-sm">1600m Battalion Athletics Winner</h3>
                    <p className="text-xs text-slate-600">Clocked 5 min 45 sec in 1.6 KM run selection test among 54 cadets at SBU Ground.</p>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-2 py-0.5 rounded-full inline-block">
                      Gold Medal
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                      <Target className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-slate-900 text-sm">0.22 Rifle Firing Marksman</h3>
                    <p className="text-xs text-slate-600">Scored 45/50 in grouping shot practice at Namkum Firing Range.</p>
                    <span className="text-[10px] bg-blue-100 text-blue-900 font-black px-2 py-0.5 rounded-full inline-block">
                      Marksman Badge
                    </span>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 8: STUDY MATERIAL */}
          {activeTab === "materials" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Study Materials & Question Banks</h2>
                  <p className="text-xs text-slate-500">Official Directorate Handbooks for 'A', 'B' & 'C' Certificate Examinations</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900 text-sm">NCC Cadet Common Subjects Handbook 2026</p>
                      <p className="text-xs text-slate-500">Drill, Leadership, Disaster Management, Health & Hygiene (PDF 12 MB)</p>
                    </div>
                    <button
                      onClick={() => showToast("Downloading Common Subjects Handbook PDF...")}
                      className="p-2.5 rounded-xl bg-[#002147] text-yellow-400 hover:bg-[#001838] cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900 text-sm">Weapon Training 0.22 Rifle & SLR Guide</p>
                      <p className="text-xs text-slate-500">Stripping, Assembly, Safety Rules & Firing Positions Diagram (PDF 8 MB)</p>
                    </div>
                    <button
                      onClick={() => showToast("Downloading Weapon Training Guide PDF...")}
                      className="p-2.5 rounded-xl bg-[#002147] text-yellow-400 hover:bg-[#001838] cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900 text-sm">Map Reading & Prismatic Compass Manual</p>
                      <p className="text-xs text-slate-500">Finding Own Position, Grid References, Bearings calculation (PDF 10 MB)</p>
                    </div>
                    <button
                      onClick={() => showToast("Downloading Map Reading Manual PDF...")}
                      className="p-2.5 rounded-xl bg-[#002147] text-yellow-400 hover:bg-[#001838] cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900 text-sm">'B' Certificate Solved Sample Question Bank</p>
                      <p className="text-xs text-slate-500">10-year past papers with answer key for Army Wing (PDF 6 MB)</p>
                    </div>
                    <button
                      onClick={() => showToast("Downloading Solved Sample Papers PDF...")}
                      className="p-2.5 rounded-xl bg-[#002147] text-yellow-400 hover:bg-[#001838] cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

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
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Parade Leave & Exemption Requests</h2>
                  <p className="text-xs text-slate-500">Submit official absence permission for university exams, medical unfitness or emergency</p>
                </div>

                {/* Apply Form */}
                <form onSubmit={handleApplyLeave} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-yellow-500" />
                    <span>Submit New Leave Application</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 uppercase">Reason Category</label>
                      <select
                        value={leaveReasonCategory}
                        onChange={(e) => setLeaveReasonCategory(e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
                      >
                        <option value="College Examination">College Examination / Test</option>
                        <option value="Medical Unfitness">Medical Unfitness / Illness</option>
                        <option value="Family Emergency">Family Emergency</option>
                        <option value="University Sports Event">University Sports Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 uppercase">Start Date</label>
                      <input
                        type="date"
                        value={leaveStartDate}
                        onChange={(e) => setLeaveStartDate(e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 uppercase">End Date</label>
                      <input
                        type="date"
                        value={leaveEndDate}
                        onChange={(e) => setLeaveEndDate(e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase">Detailed Explanation</label>
                    <textarea
                      rows={2}
                      placeholder="Specify subject of examination or medical reason..."
                      value={leaveDescription}
                      onChange={(e) => setLeaveDescription(e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#002147] hover:bg-[#001838] text-yellow-400 font-black px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Leave Application to ANO Office</span>
                  </button>
                </form>

                {/* History Table */}
                <div className="space-y-3">
                  <h3 className="font-black text-slate-900 text-base">Leave Application History</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                          <th className="p-3">App ID</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Date Range</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Officer Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leaveHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-800">{item.id}</td>
                            <td className="p-3 font-extrabold text-slate-900">{item.category}</td>
                            <td className="p-3 font-semibold text-slate-700">{item.startDate} to {item.endDate}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                item.status === "Approved"
                                  ? "bg-emerald-100 text-emerald-900"
                                  : item.status === "Pending"
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-red-100 text-red-900"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 italic">{item.officerRemarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Cadet Account Settings</h2>
                  <p className="text-xs text-slate-500">Manage security, notification alerts, and portal preferences</p>
                </div>

                <div className="max-w-xl space-y-6">
                  
                  {/* Change Password */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-yellow-600" />
                      <span>Change Portal Password</span>
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="font-bold text-slate-700">Current Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700">New Password</label>
                        <input
                          type="password"
                          placeholder="Minimum 8 characters"
                          className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                      <button
                        onClick={() => showToast("Password updated successfully.")}
                        className="py-2 px-4 bg-[#002147] text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-[#001838]"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Notification Toggles */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span>Alert Preferences</span>
                    </h3>

                    <div className="space-y-2 text-xs">
                      <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                        <span className="font-bold text-slate-800">Parade SMS Reminders</span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#002147]" />
                      </label>

                      <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                        <span className="font-bold text-slate-800">Officer Broadcast Emails</span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#002147]" />
                      </label>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-yellow-500" />
                  <span>Edit Contact & Uniform Specs</span>
                </h3>
                <button onClick={() => setIsEditingProfile(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveProfileEdits} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Mobile Number</label>
                    <input
                      type="text"
                      value={profileForm.mobile}
                      onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                      className="w-full mt-1 p-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Emergency Phone</label>
                    <input
                      type="text"
                      value={profileForm.emergencyPhone}
                      onChange={(e) => setProfileForm({ ...profileForm, emergencyPhone: e.target.value })}
                      className="w-full mt-1 p-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Permanent Address</label>
                  <textarea
                    rows={2}
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="font-bold text-slate-700">Beret Size</label>
                    <input
                      type="text"
                      value={profileForm.beretSize}
                      onChange={(e) => setProfileForm({ ...profileForm, beretSize: e.target.value })}
                      className="w-full mt-1 p-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Shirt Size</label>
                    <input
                      type="text"
                      value={profileForm.shirtSize}
                      onChange={(e) => setProfileForm({ ...profileForm, shirtSize: e.target.value })}
                      className="w-full mt-1 p-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Trouser Waist (Inches)</label>
                    <input
                      type="text"
                      value={profileForm.trouserWaist}
                      onChange={(e) => setProfileForm({ ...profileForm, trouserWaist: e.target.value })}
                      className="w-full mt-1 p-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">DMS Boot Size</label>
                    <input
                      type="text"
                      value={profileForm.bootSize}
                      onChange={(e) => setProfileForm({ ...profileForm, bootSize: e.target.value })}
                      className="w-full mt-1 p-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#002147] text-white rounded-xl font-bold hover:bg-[#001838] cursor-pointer"
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
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-[#002147]" />
                  <span className="font-black text-slate-900 text-sm">Official Cadet Identity Card</span>
                </div>
                <button onClick={() => setShowIdCardModal(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* ID Card Layout */}
              <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-lg space-y-3 relative overflow-hidden text-left">
                <div className="bg-gradient-to-r from-blue-900 via-red-700 to-sky-600 h-3 -mx-5 -mt-5 mb-3" />

                <div className="text-center border-b border-slate-200 pb-2">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">NATIONAL CADET CORPS INDIA</p>
                  <h3 className="text-sm font-black text-slate-900">{cadetProfile.unit}</h3>
                  <p className="text-[11px] text-blue-900 font-bold">Sarala Birla University Company</p>
                </div>

                <div className="flex space-x-3 items-center">
                  <img
                    src={cadetProfile.photoUrl}
                    alt={cadetProfile.fullName}
                    className="w-20 h-24 object-cover rounded-xl border-2 border-slate-900 shadow-xs shrink-0"
                  />
                  <div className="space-y-0.5 text-xs">
                    <span className="bg-yellow-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded uppercase inline-block">
                      {cadetProfile.rank}
                    </span>
                    <p className="text-sm font-black text-slate-900 leading-tight">{cadetProfile.fullName}</p>
                    <p className="font-mono text-slate-800 text-[10px] font-bold">Regt: {cadetProfile.regNo}</p>
                    <p className="text-slate-600 text-[10px]">SBU Roll: {cadetProfile.sbuRollNo}</p>
                    <p className="text-slate-600 text-[10px]">Blood Group: <strong className="text-red-700">{cadetProfile.bloodGroup}</strong></p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500">
                  <span>Authorized: ANO SBU Coy</span>
                  <span className="font-bold text-slate-900">Valid: 2025 - 2028</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full py-2 bg-[#002147] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-yellow-400" />
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
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="font-black text-slate-900 text-sm">Official Certificate Preview</span>
                </div>
                <button onClick={() => setSelectedCert(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="bg-slate-50 border-2 border-yellow-400/80 rounded-2xl p-6 space-y-4 text-center relative overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 via-red-700 to-sky-600 h-2 -mx-6 -mt-6 mb-4" />

                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">NATIONAL CADET CORPS INDIA</p>
                <h3 className="text-xl font-black text-slate-900">{selectedCert.title}</h3>
                
                <p className="text-xs text-slate-700 italic">
                  This is to certify that <strong className="text-slate-900 font-black">{cadetProfile.fullName}</strong> ({cadetProfile.rank}), Regimental No. <strong className="font-mono">{cadetProfile.regNo}</strong> of 19 Jharkhand Battalion NCC, Sarala Birla University Company, has successfully achieved <strong className="text-emerald-800 font-extrabold">{selectedCert.grade}</strong>.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 border-t border-b border-slate-200 py-3 font-mono">
                  <div>Certificate No: <strong className="text-slate-900">{selectedCert.certNo}</strong></div>
                  <div>Issue Date: <strong className="text-slate-900">{selectedCert.issueDate}</strong></div>
                </div>

                <div className="flex justify-between items-center pt-2 text-[10px] text-slate-500">
                  <div className="text-left">
                    <p className="font-bold text-slate-800">{selectedCert.authority}</p>
                    <p>Verified HQ Registry</p>
                  </div>
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    handleDownloadCertificate(selectedCert.title);
                    setSelectedCert(null);
                  }}
                  className="w-full py-2 bg-[#002147] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-yellow-400" />
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
