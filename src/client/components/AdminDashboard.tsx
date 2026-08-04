import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";
import { NotificationsFeed } from "./NotificationsFeed";
import { EnterpriseDataPlatform } from "../services/dataPlatform";
import { useRealtimeData } from "../hooks/useRealtimeData";
import { 
  AlertCircle, 
  AlertTriangle,
  Award, 
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2, 
  ChevronDown,
  ChevronRight, 
  Download, 
  Edit3, 
  Eye, 
  FileCheck2, 
  FileSpreadsheet, 
  FileText,
  Filter, 
  GraduationCap,
  Info,
  Layers,
  Lock, 
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Plus,
  Printer,
  RefreshCw, 
  Search, 
  Send,
  Settings,
  Shield,
  ShieldCheck, 
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck, 
  UserPlus,
  Users, 
  X,
  Upload
} from "lucide-react";
import { CadetRecord } from "../types";

interface AdminDashboardProps {
  onOpenPrintableSlip: (record: CadetRecord) => void;
}

// Sub-types for Officer Portal Modules
interface DisciplineEntry {
  id: string;
  cadetId: string;
  cadetName: string;
  type: "Appreciation" | "Reward" | "Warning" | "Punishment";
  title: string;
  date: string;
  remarks: string;
  officerName: string;
}

interface ClassScheduleItem {
  id: string;
  title: string;
  topic: string;
  instructor: string;
  date: string;
  time: string;
  venue: string;
  batchTarget: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

interface BroadcastMessage {
  id: string;
  subject: string;
  body: string;
  target: string;
  sentAt: string;
  recipientCount: number;
  deliveryStatus: string;
  channels: string[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenPrintableSlip
}) => {
  // Navigation active module state
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "batches" | "cadets" | "activities" | "broadcast" | "attendance" | "discipline" | "events" | "reports" | "settings"
  >("dashboard");

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Data states
  const [enrollments, setEnrollments] = useState<CadetRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [batchFilter, setBatchFilter] = useState<string>("All");

  // Selected Cadet for Modals
  const [selectedRecord, setSelectedRecord] = useState<CadetRecord | null>(null);
  const [viewingProfileModal, setViewingProfileModal] = useState<CadetRecord | null>(null);
  const [profileTab, setProfileTab] = useState<"personal" | "academic" | "physical" | "bank" | "attendance">("personal");

  // Status Edit State
  const [editingStatus, setEditingStatus] = useState<string>("Submitted");
  const [editingRemarks, setEditingRemarks] = useState<string>("");
  const [editingRegNo, setEditingRegNo] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Broadcast Form State
  const [broadcastSubject, setBroadcastSubject] = useState<string>("");
  const [broadcastBody, setBroadcastBody] = useState<string>("");
  const [broadcastTarget, setBroadcastTarget] = useState<string>("All Cadets");
  const [broadcastChannels, setBroadcastChannels] = useState<{ email: boolean; app: boolean; sms: boolean }>({
    email: true,
    app: true,
    sms: false
  });
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastMessage[]>([
    {
      id: "MSG-101",
      subject: "Mandatory Parade & Uniform Inspection for Independence Day Prep",
      body: "All SD and SW cadets are hereby instructed to report in full Working Dress No. 2 at SBU Sports Ground on 05 Aug at 06:00 AM sharp. Absence without prior permission from ANO will attract disciplinary action.",
      target: "All Cadets",
      sentAt: "2026-08-01 17:30",
      recipientCount: 54,
      deliveryStatus: "Delivered (100%)",
      channels: ["Email", "In-App Portal"]
    },
    {
      id: "MSG-100",
      subject: "Annual Training Camp (ATC) Document Verification Notice",
      body: "Batch I & Batch II cadets selected for ATC Ranchi must submit their original Medical Unfitness & Parent Consent Certificates to ANO Office by 10 Aug.",
      target: "Batch I & II",
      sentAt: "2026-07-28 11:00",
      recipientCount: 40,
      deliveryStatus: "Delivered (100%)",
      channels: ["Email", "In-App Portal"]
    }
  ]);

  // Attendance CRM State
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedAttendanceBatch, setSelectedAttendanceBatch] = useState<string>("Batch I (3rd Year)");
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, "P" | "A" | "L" | "OD">>({
    "19JHR-SBU-2026-001": "P",
    "19JHR-SBU-2026-002": "P",
    "19JHR-SBU-2026-003": "P",
    "19JHR-SBU-2026-004": "L",
    "19JHR-SBU-2026-005": "P"
  });

  // Classes & Activities Schedule
  const [classes, setClasses] = useState<ClassScheduleItem[]>([
    {
      id: "CLS-001",
      title: "Weapon Training 0.22 Rifle Stripping & Assembly",
      topic: "Part 1: 0.22 Deluxe & Mark IV Rifle Safety Precautions",
      instructor: "Subedar Major A.K. Singh / Havildar Rajveer",
      date: "2026-08-05",
      time: "06:30 AM - 08:00 AM",
      venue: "SBU Parade Ground & Firing Shed",
      batchTarget: "All Batches (SD & SW)",
      status: "Scheduled"
    },
    {
      id: "CLS-002",
      title: "Map Reading & Fieldcraft Navigation",
      topic: "Finding Own Position using Prismatic Compass & Service Protractor",
      instructor: "Capt. Dr. Animesh Roy (ANO)",
      date: "2026-08-08",
      time: "07:00 AM - 08:30 AM",
      venue: "SBU Seminar Hall 2",
      batchTarget: "Batch I & Batch II",
      status: "Scheduled"
    }
  ]);
  const [createClassModal, setCreateClassModal] = useState<boolean>(false);
  const [newClassForm, setNewClassForm] = useState({
    title: "",
    topic: "",
    instructor: "Capt. Dr. Animesh Roy (ANO)",
    date: new Date().toISOString().split("T")[0],
    time: "06:30 AM - 08:00 AM",
    venue: "SBU Parade Ground",
    batchTarget: "All Batches"
  });

  // Discipline Entries State
  const [disciplineEntries, setDisciplineEntries] = useState<DisciplineEntry[]>([
    {
      id: "DISC-01",
      cadetId: "19JHR-SBU-2026-001",
      cadetName: "Aman Kumar Sharma",
      type: "Appreciation",
      title: "Commendation for Best Parade Drill Leadership",
      date: "2026-07-26",
      remarks: "Demonstrated exceptional word of command during Kargil Vijay Diwas parade at SBU.",
      officerName: "Capt. Dr. Animesh Roy (ANO)"
    },
    {
      id: "DISC-02",
      cadetId: "19JHR-SBU-2026-003",
      cadetName: "Rahul Singh Munda",
      type: "Reward",
      title: "1st Position 1600m Battalion Athletics Selection",
      date: "2026-07-22",
      remarks: "Clocked 5 min 30 sec in 1600m run. Awarded Battalion Sports Badge.",
      officerName: "Commanding Officer 19 JHR BN"
    }
  ]);
  const [createDisciplineModal, setCreateDisciplineModal] = useState<boolean>(false);
  const [newDisciplineForm, setNewDisciplineForm] = useState({
    cadetId: "",
    type: "Appreciation" as "Appreciation" | "Reward" | "Warning" | "Punishment",
    title: "",
    remarks: ""
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Real-time WebSocket Event Handlers
  const handleRealtimeEnrollmentSubmitted = useCallback((record: CadetRecord) => {
    setEnrollments((prev) => {
      const exists = prev.some((e) => e.id === record.id);
      if (exists) return prev;
      return [record, ...prev];
    });
    showToast(`⚡ REAL-TIME EVENT: New cadet application received from ${record.fullName} (${record.sbuCourse})`);
  }, [showToast]);

  const handleRealtimeStatusUpdated = useCallback((record: CadetRecord) => {
    setEnrollments((prev) => prev.map((e) => (e.id === record.id ? record : e)));
  }, []);

  const { isConnected, latencyMs, activePresenceCount } = useRealtimeData({
    channels: ["cadre:enrollments", "cadre:notifications", "cadre:presence"],
    onEnrollmentSubmitted: handleRealtimeEnrollmentSubmitted,
    onStatusUpdated: handleRealtimeStatusUpdated
  });

  // Fetch Enrollments from Enterprise Data Platform Engine
  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const res = await EnterpriseDataPlatform.getEnrollments();
      if (res.success && res.data?.enrollments) {
        setEnrollments(res.data.enrollments);
      }
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Filter Logic
  const filteredCadets = enrollments.filter(e => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      e.fullName.toLowerCase().includes(query) ||
      e.id.toLowerCase().includes(query) ||
      e.sbuRollNo.toLowerCase().includes(query) ||
      e.sbuCourse.toLowerCase().includes(query) ||
      (e.enrollmentNo && e.enrollmentNo.toLowerCase().includes(query));

    const matchesGender = genderFilter === "All" || e.gender === genderFilter;
    const matchesStatus = statusFilter === "All" || e.status === statusFilter;

    // Batch mapping based on Year
    let cadetBatch = "Batch III (1st Year)";
    if (e.sbuYear.includes("3rd")) cadetBatch = "Batch I (3rd Year)";
    else if (e.sbuYear.includes("2nd")) cadetBatch = "Batch II (2nd Year)";

    const matchesBatch = batchFilter === "All" || cadetBatch.includes(batchFilter);

    return matchesQuery && matchesGender && matchesStatus && matchesBatch;
  });

  // Metrics
  const totalApps = enrollments.length;
  const sdCount = enrollments.filter(e => e.gender === "SD").length;
  const swCount = enrollments.filter(e => e.gender === "SW").length;
  const enrolledCount = enrollments.filter(e => e.status === "Enrolled" || e.status === "Selected").length;
  const pendingCount = enrollments.filter(e => e.status === "Submitted" || e.status === "Physical Scheduled").length;

  // Status Update Handler using Enterprise Data Platform Engine
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setIsUpdating(true);
    try {
      const res = await EnterpriseDataPlatform.updateStatus({
        id: selectedRecord.id,
        status: editingStatus,
        remarks: editingRemarks,
        enrollmentNo: editingRegNo
      });

      if (res.success) {
        showToast(`Status updated successfully for ${selectedRecord.fullName}`);
        setSelectedRecord(null);
        fetchEnrollments();
      }
    } catch (err: any) {
      console.error("Failed to update status:", err);
      showToast(`Error updating status: ${err.message || "Failed"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Broadcast Notice Handler using Real-time Dispatch
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastBody.trim()) {
      showToast("Please provide subject and message body.");
      return;
    }

    const activeChannels = [];
    if (broadcastChannels.email) activeChannels.push("Email");
    if (broadcastChannels.app) activeChannels.push("In-App Portal");
    if (broadcastChannels.sms) activeChannels.push("SMS");

    try {
      const res = await EnterpriseDataPlatform.broadcastNotice({
        title: broadcastSubject,
        body: broadcastBody,
        category: "Parade Order",
        priority: "HIGH" as any
      });

      if (res.success) {
        const newMsg: BroadcastMessage = {
          id: res.data?.notification.id || `MSG-${Math.floor(100 + Math.random() * 900)}`,
          subject: broadcastSubject,
          body: broadcastBody,
          target: broadcastTarget,
          sentAt: new Date().toISOString().replace("T", " ").slice(0, 16),
          recipientCount: enrollments.length || 54,
          deliveryStatus: "Delivered (100%)",
          channels: activeChannels
        };

        setBroadcastHistory([newMsg, ...broadcastHistory]);
        setBroadcastSubject("");
        setBroadcastBody("");
        showToast(`📢 Realtime Broadcast Dispatched to ${broadcastTarget} & Synced across WebSockets!`);
      }
    } catch (err: any) {
      showToast(`Broadcast Error: ${err.message || "Failed to dispatch notice"}`);
    }
  };

  // Create Class Submit
  const handleCreateClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassForm.title.trim()) return;

    const newItem: ClassScheduleItem = {
      id: `CLS-${Math.floor(100 + Math.random() * 900)}`,
      title: newClassForm.title,
      topic: newClassForm.topic,
      instructor: newClassForm.instructor,
      date: newClassForm.date,
      time: newClassForm.time,
      venue: newClassForm.venue,
      batchTarget: newClassForm.batchTarget,
      status: "Scheduled"
    };

    setClasses([newItem, ...classes]);
    setCreateClassModal(false);
    showToast("New training class session scheduled successfully.");
  };

  // Create Discipline Submit
  const handleCreateDisciplineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCadet = enrollments.find(e => e.id === newDisciplineForm.cadetId);
    if (!targetCadet || !newDisciplineForm.title) return;

    const newEntry: DisciplineEntry = {
      id: `DISC-${Math.floor(100 + Math.random() * 900)}`,
      cadetId: targetCadet.id,
      cadetName: targetCadet.fullName,
      type: newDisciplineForm.type,
      title: newDisciplineForm.title,
      date: new Date().toISOString().split("T")[0],
      remarks: newDisciplineForm.remarks,
      officerName: "Capt. Dr. Animesh Roy (ANO)"
    };

    setDisciplineEntries([newEntry, ...disciplineEntries]);
    setCreateDisciplineModal(false);
    showToast(`Discipline record recorded for ${targetCadet.fullName}`);
  };

  // Excel Master Download
  const handleDownloadExcel = () => {
    window.open("/api/export-excel", "_blank");
    showToast("Downloading 19 JHR BN Master Nominal Roll Excel workbook...");
  };

  const navMenuItems = [
    { id: "dashboard", label: "Overview Dashboard", icon: BarChart3 },
    { id: "batches", label: "Batches & Wings", icon: Layers },
    { id: "cadets", label: "Cadet Database (CRM)", icon: Users },
    { id: "activities", label: "Classes & Drill Schedule", icon: BookOpen },
    { id: "broadcast", label: "Broadcast & Notices", icon: Megaphone },
    { id: "attendance", label: "Attendance Sheet Grid", icon: UserCheck },
    { id: "discipline", label: "Discipline & Awards", icon: Award },
    { id: "events", label: "Events & Camps Calendar", icon: Calendar },
    { id: "reports", label: "Reports & Excel Export", icon: FileSpreadsheet },
    { id: "settings", label: "Officer Portal Settings", icon: Settings }
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

      {/* Top Officer Header Bar */}
      <header className="bg-[#001733] text-white border-b border-yellow-500/30 sticky top-0 z-40 shadow-xl">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Sidebar Toggle */}
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
                    19 JHR BN NCC • Officer Portal
                  </h1>
                  <span className="bg-yellow-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                    ANO Office • SBU
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Commanding Officer & Cadre Administrative System
                </p>
              </div>
            </div>
          </div>

          {/* Right: Officer Profile, Sync Indicator & Actions */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="hidden lg:flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>HQ Server Live</span>
            </div>

            <button
              onClick={() => setActiveTab("broadcast")}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 relative transition-colors cursor-pointer"
              title="Broadcast Messages"
            >
              <Bell className="w-4 h-4 text-yellow-400" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
            </button>

            <div className="hidden sm:flex items-center space-x-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-xs">
                AR
              </div>
              <div className="text-left text-xs">
                <p className="font-extrabold text-white leading-tight">Capt. Dr. Animesh Roy</p>
                <p className="text-[10px] text-yellow-300">ANO - SBU Company</p>
              </div>
            </div>

            <button
              onClick={handleDownloadExcel}
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-950" />
              <span className="hidden md:inline">Master Nominal Roll</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Body */}
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
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-yellow-400 text-slate-950 shadow-md font-black"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-yellow-400"}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => window.location.reload()}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer ${
                sidebarCollapsed ? "justify-center px-0" : ""
              }`}
            >
              <LogOut className="w-4 h-4 text-red-400 shrink-0" />
              {!sidebarCollapsed && <span>Officer Logout</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Drawer Navigation */}
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
                    <span className="font-black text-white text-sm">Officer Navigation</span>
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
                        className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? "bg-yellow-400 text-slate-950 font-black"
                            : "text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-yellow-400"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-xl text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Portal</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-[#002147] via-[#001838] to-[#001026] text-white rounded-2xl p-6 border border-yellow-500/40 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center space-x-2 bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                      <span>19 Jharkhand Battalion NCC • SBU Coy</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      Officer Command & Cadre Overview
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Real-time Nominal Roll, Parade Attendance, DBT Allowances & Discipline Control.
                    </p>
                  </div>

                  {/* Quick Action Grid */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveTab("broadcast")}
                      className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
                    >
                      <Megaphone className="w-4 h-4 text-slate-950" />
                      <span>New Broadcast</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("attendance")}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-white/20 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-yellow-400" />
                      <span>Take Attendance</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("cadets")}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-white/20 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-yellow-400" />
                      <span>View All Cadets</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-yellow-400 transition-all">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Total Applications</span>
                    <Users className="w-5 h-5 text-[#002147]" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-slate-900">{totalApps}</span>
                    <span className="text-xs text-emerald-600 font-extrabold">Live SBU Database</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">SD (Male): {sdCount} • SW (Female): {swCount}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-yellow-400 transition-all">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Enrolled Cadets</span>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-emerald-700">{enrolledCount}</span>
                    <span className="text-xs text-slate-500 font-semibold">Active Ranks</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Allocated Regimental Numbers</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-yellow-400 transition-all">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Present Today</span>
                    <UserCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-slate-900">92%</span>
                    <span className="text-xs text-blue-600 font-extrabold">Parade Ground</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">46 Cadets Attended Morning Drill</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-yellow-400 transition-all">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Pending Processing</span>
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-amber-600">{pendingCount}</span>
                    <span className="text-xs text-amber-600 font-extrabold">Requires Review</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Physical Test & Document Verification</p>
                </div>

              </div>

              {/* Attendance & Recent Registrations Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 cols: Recent Registrations CRM Preview */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">Recent Cadet Registrations</h3>
                      <p className="text-xs text-slate-500">Applications submitted for 19 JHR BN NCC SBU Coy</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("cadets")}
                      className="text-xs font-black text-[#002147] hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-3">App ID</th>
                          <th className="py-3 px-3">Cadet Name</th>
                          <th className="py-3 px-3">Wing</th>
                          <th className="py-3 px-3">Course / Roll</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {enrollments.slice(0, 5).map((e) => (
                          <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-mono text-slate-600 font-bold">{e.id}</td>
                            <td className="py-3 px-3">
                              <p className="font-extrabold text-slate-900">{e.fullName}</p>
                              <p className="text-[10px] text-slate-500">{e.mobile}</p>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                e.gender === "SD" ? "bg-blue-100 text-blue-900" : "bg-pink-100 text-pink-900"
                              }`}>
                                {e.gender}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-bold text-slate-800">{e.sbuCourse}</p>
                              <p className="text-[10px] text-slate-500">{e.sbuRollNo}</p>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                e.status === "Enrolled" || e.status === "Selected"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : "bg-amber-100 text-amber-800 border border-amber-300"
                              }`}>
                                {e.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right space-x-1">
                              <button
                                onClick={() => setViewingProfileModal(e)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                title="View Full Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRecord(e);
                                  setEditingStatus(e.status);
                                  setEditingRemarks(e.officerRemarks || "");
                                  setEditingRegNo(e.enrollmentNo || "");
                                }}
                                className="p-1.5 rounded-lg bg-[#002147] hover:bg-[#001838] text-yellow-400 cursor-pointer"
                                title="Update Status"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right 1 col: Upcoming Classes & Broadcast Quick Widget */}
                <div className="space-y-6">
                  
                  {/* Scheduled Classes */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-yellow-500" />
                        <span>Upcoming Drill & Classes</span>
                      </h4>
                      <button
                        onClick={() => setActiveTab("activities")}
                        className="text-[11px] font-bold text-blue-700 hover:underline"
                      >
                        Schedule
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {classes.slice(0, 2).map((c) => (
                        <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                          <p className="font-extrabold text-slate-900">{c.title}</p>
                          <p className="text-[11px] text-slate-600">{c.topic}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                            <span>📅 {c.date} • {c.time}</span>
                            <span className="font-bold text-[#002147]">{c.venue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Broadcast History Summary */}
                  <div className="bg-[#001733] text-white rounded-2xl p-5 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h4 className="font-black text-yellow-400 text-sm flex items-center space-x-2">
                        <Megaphone className="w-4 h-4" />
                        <span>Latest Officer Broadcast</span>
                      </h4>
                      <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded font-bold">
                        Auto Dispatched
                      </span>
                    </div>

                    {broadcastHistory[0] && (
                      <div className="space-y-1.5 text-xs">
                        <p className="font-extrabold text-white">{broadcastHistory[0].subject}</p>
                        <p className="text-[11px] text-slate-300 line-clamp-2">{broadcastHistory[0].body}</p>
                        <div className="text-[10px] text-yellow-300/80 pt-1 flex justify-between">
                          <span>Target: {broadcastHistory[0].target}</span>
                          <span>{broadcastHistory[0].sentAt}</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: BATCHES & WINGS */}
          {activeTab === "batches" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Batch & Wing Structure</h2>
                    <p className="text-xs text-slate-500">19 Jharkhand Battalion NCC Senior Division (Male) & Senior Wing (Female) Cadre</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Batch I */}
                  <div className="bg-slate-50 border-2 border-yellow-400/60 rounded-2xl p-5 space-y-4 relative shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-yellow-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                          Senior Batch
                        </span>
                        <h3 className="text-lg font-black text-slate-900 pt-1">Batch I (3rd Year)</h3>
                        <p className="text-xs text-slate-600 font-bold">'C' Certificate Cadets</p>
                      </div>
                      <Award className="w-6 h-6 text-yellow-500" />
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Total Cadets:</span>
                        <span className="font-extrabold text-slate-900">18 Cadets</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Avg Parade Attendance:</span>
                        <span className="font-extrabold text-emerald-700">94.2%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Senior Ranks:</span>
                        <span className="font-bold text-slate-800">SUO, JUO, CQMS, SGT</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setBatchFilter("Batch I");
                        setActiveTab("cadets");
                      }}
                      className="w-full py-2 bg-[#002147] hover:bg-[#001838] text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Filter Batch I Cadets
                    </button>
                  </div>

                  {/* Batch II */}
                  <div className="bg-slate-50 border border-slate-300 rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-slate-200 text-slate-800 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                          Intermediate Batch
                        </span>
                        <h3 className="text-lg font-black text-slate-900 pt-1">Batch II (2nd Year)</h3>
                        <p className="text-xs text-slate-600 font-bold">'B' Certificate Cadets</p>
                      </div>
                      <ShieldCheck className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Total Cadets:</span>
                        <span className="font-extrabold text-slate-900">22 Cadets</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Avg Parade Attendance:</span>
                        <span className="font-extrabold text-emerald-700">89.5%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Ranks:</span>
                        <span className="font-bold text-slate-800">L/Cpl, Cpl, SGT</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setBatchFilter("Batch II");
                        setActiveTab("cadets");
                      }}
                      className="w-full py-2 bg-[#002147] hover:bg-[#001838] text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Filter Batch II Cadets
                    </button>
                  </div>

                  {/* Batch III */}
                  <div className="bg-slate-50 border border-slate-300 rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                          Junior Probationers
                        </span>
                        <h3 className="text-lg font-black text-slate-900 pt-1">Batch III (1st Year)</h3>
                        <p className="text-xs text-slate-600 font-bold">New Enrolled Cadets</p>
                      </div>
                      <GraduationCap className="w-6 h-6 text-emerald-600" />
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Total Cadets:</span>
                        <span className="font-extrabold text-slate-900">14 Cadets</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Avg Parade Attendance:</span>
                        <span className="font-extrabold text-emerald-700">91.0%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Ranks:</span>
                        <span className="font-bold text-slate-800">Cadet Probationers</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setBatchFilter("Batch III");
                        setActiveTab("cadets");
                      }}
                      className="w-full py-2 bg-[#002147] hover:bg-[#001838] text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Filter Batch III Cadets
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CADET DATABASE (CRM) */}
          {activeTab === "cadets" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Cadet Master Database (CRM)</h2>
                    <p className="text-xs text-slate-500">
                      Search, view profiles, update regimental status, and manage DBT bank accounts
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownloadExcel}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Excel</span>
                    </button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase">Search Cadet</label>
                    <div className="relative mt-1">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Name, Roll, Aadhaar, Mobile..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase">Wing / Gender</label>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
                    >
                      <option value="All">All Wings (SD & SW)</option>
                      <option value="SD">Senior Division (SD - Male)</option>
                      <option value="SW">Senior Wing (SW - Female)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase">Enrollment Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Submitted">Submitted (Online)</option>
                      <option value="Physical Scheduled">Physical Scheduled</option>
                      <option value="Medical Cleared">Medical Cleared</option>
                      <option value="Selected">Selected</option>
                      <option value="Enrolled">Enrolled</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase">Batch Year</label>
                    <select
                      value={batchFilter}
                      onChange={(e) => setBatchFilter(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
                    >
                      <option value="All">All Batches</option>
                      <option value="Batch I">Batch I (3rd Year)</option>
                      <option value="Batch II">Batch II (2nd Year)</option>
                      <option value="Batch III">Batch III (1st Year)</option>
                    </select>
                  </div>
                </div>

                {/* Cadet Data Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#001733] text-white font-black uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">S.No</th>
                        <th className="py-3.5 px-4">Regimental No / App ID</th>
                        <th className="py-3.5 px-4">Cadet Name</th>
                        <th className="py-3.5 px-4">Wing</th>
                        <th className="py-3.5 px-4">SBU Course & Roll</th>
                        <th className="py-3.5 px-4">Fitness Score</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredCadets.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500 font-bold">
                            No cadets found matching search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredCadets.map((cadet, idx) => (
                          <tr key={cadet.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-600">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              <p className="text-xs font-extrabold text-[#002147]">
                                {cadet.enrollmentNo || cadet.id}
                              </p>
                              <p className="text-[10px] text-slate-500">App: {cadet.id}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-black text-slate-900 text-sm">{cadet.fullName}</p>
                              <p className="text-[10px] text-slate-500">📱 {cadet.mobile}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded font-black text-[10px] ${
                                cadet.gender === "SD" ? "bg-blue-100 text-blue-900" : "bg-pink-100 text-pink-900"
                              }`}>
                                {cadet.gender === "SD" ? "Senior Div (SD)" : "Senior Wing (SW)"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-extrabold text-slate-800">{cadet.sbuCourse}</p>
                              <p className="text-[10px] text-slate-500">{cadet.sbuRollNo} • {cadet.sbuYear}</p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-semibold">
                              <p>🏃 1600m: {cadet.run1600mTime}</p>
                              <p className="text-[10px] text-slate-500">Pushups: {cadet.pushupsCount}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                cadet.status === "Enrolled"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : cadet.status === "Selected"
                                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                                  : "bg-amber-100 text-amber-800 border border-amber-300"
                              }`}>
                                {cadet.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1.5">
                              <button
                                onClick={() => setViewingProfileModal(cadet)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                                title="View Full Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Profile</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRecord(cadet);
                                  setEditingStatus(cadet.status);
                                  setEditingRemarks(cadet.officerRemarks || "");
                                  setEditingRegNo(cadet.enrollmentNo || "");
                                }}
                                className="px-2.5 py-1.5 bg-[#002147] hover:bg-[#001838] text-yellow-400 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                                title="Update Status & Regimental Number"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Status</span>
                              </button>
                              <button
                                onClick={() => onOpenPrintableSlip(cadet)}
                                className="px-2 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                                title="Print Application Slip"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: ACTIVITIES & CLASSES SCHEDULE */}
          {activeTab === "activities" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Parade & Training Class Schedule</h2>
                    <p className="text-xs text-slate-500">Manage Drill Parades, Weapon Training, Map Reading & Classroom Sessions</p>
                  </div>

                  <button
                    onClick={() => setCreateClassModal(true)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>Schedule New Class</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.map((cls) => (
                    <div key={cls.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 relative">
                      <div className="flex justify-between items-start">
                        <span className="bg-[#002147] text-yellow-400 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                          {cls.batchTarget}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {cls.status}
                        </span>
                      </div>

                      <h3 className="font-black text-slate-900 text-base">{cls.title}</h3>
                      <p className="text-xs text-slate-600 font-medium">{cls.topic}</p>

                      <div className="space-y-1 text-xs text-slate-700 pt-2 border-t border-slate-200">
                        <p>👤 <strong>Instructor:</strong> {cls.instructor}</p>
                        <p>📅 <strong>Date & Time:</strong> {cls.date} • {cls.time}</p>
                        <p>📍 <strong>Venue:</strong> {cls.venue}</p>
                      </div>

                      <div className="pt-2 flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setActiveTab("attendance");
                            showToast(`Attendance mode selected for ${cls.title}`);
                          }}
                          className="px-3 py-1.5 bg-[#002147] text-yellow-400 rounded-lg text-xs font-bold"
                        >
                          Mark Class Attendance
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BROADCAST & NOTICES */}
          {activeTab === "broadcast" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Battalion Broadcast Engine</h2>
                  <p className="text-xs text-slate-500">
                    Send single message dispatched simultaneously via Email, Cadet Portal, and SMS alerts
                  </p>
                </div>

                {/* Broadcast Form */}
                <form onSubmit={handleSendBroadcast} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-800 uppercase">Target Audience</label>
                      <select
                        value={broadcastTarget}
                        onChange={(e) => setBroadcastTarget(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                      >
                        <option value="All Cadets">All Cadets (SD & SW)</option>
                        <option value="Batch I (3rd Year)">Batch I (3rd Year 'C' Cert)</option>
                        <option value="Batch II (2nd Year)">Batch II (2nd Year 'B' Cert)</option>
                        <option value="Batch III (1st Year)">Batch III (1st Year Probationers)</option>
                        <option value="Senior Ranks Only">Senior Rank Holders Only (SUO/JUO/SGT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-800 uppercase">Delivery Channels</label>
                      <div className="flex items-center space-x-4 mt-2 text-xs font-bold">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={broadcastChannels.email}
                            onChange={(e) => setBroadcastChannels({ ...broadcastChannels, email: e.target.checked })}
                            className="rounded text-yellow-500 focus:ring-yellow-400"
                          />
                          <span>Direct Email</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={broadcastChannels.app}
                            onChange={(e) => setBroadcastChannels({ ...broadcastChannels, app: e.target.checked })}
                            className="rounded text-yellow-500 focus:ring-yellow-400"
                          />
                          <span>Cadet Portal</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={broadcastChannels.sms}
                            onChange={(e) => setBroadcastChannels({ ...broadcastChannels, sms: e.target.checked })}
                            className="rounded text-yellow-500 focus:ring-yellow-400"
                          />
                          <span>SMS Alert</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-800 uppercase">Broadcast Subject / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Mandatory Parade & Uniform Inspection Notice..."
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-yellow-400 outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-800 uppercase">Message Content / Instructions</label>
                    <textarea
                      rows={4}
                      placeholder="Enter detailed instructions for cadets regarding parade dress code, timings, venue, document submission..."
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-md cursor-pointer uppercase tracking-wider"
                  >
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Dispatch Broadcast Now</span>
                  </button>
                </form>

                {/* History */}
                <div className="space-y-3">
                  <h3 className="font-black text-slate-900 text-base">Sent Broadcast History</h3>
                  <div className="space-y-3">
                    {broadcastHistory.map((msg) => (
                      <div key={msg.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black text-[#002147]">{msg.id}</span>
                            <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded">
                              Target: {msg.target}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-bold">{msg.sentAt}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{msg.subject}</h4>
                        <p className="text-xs text-slate-700 leading-relaxed">{msg.body}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                          <span>Recipients: {msg.recipientCount} Cadets</span>
                          <span className="text-emerald-700 font-extrabold">Status: {msg.deliveryStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Live Cadets Feed Preview */}
              <div className="pt-2">
                <div className="bg-amber-100/60 border border-amber-300 rounded-2xl p-4 mb-4 text-xs font-bold text-amber-950 flex items-center space-x-2">
                  <Megaphone className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Officer Live Preview: Active Notifications & Reminders Feed Dispatched to Cadet Portals</span>
                </div>
                <NotificationsFeed showToast={showToast} />
              </div>

            </div>
          )}

          {/* TAB 6: ATTENDANCE CRM GRID */}
          {activeTab === "attendance" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Daily & Monthly Parade Attendance CRM</h2>
                    <p className="text-xs text-slate-500">Interactive spreadsheet grid with Excel import/export support</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        showToast("Marked all cadets as Present (P) for " + attendanceDate);
                      }}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={handleDownloadExcel}
                      className="px-3.5 py-2 bg-[#002147] hover:bg-[#001838] text-yellow-400 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Export Grid
                    </button>
                  </div>
                </div>

                {/* Attendance Date & Batch Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-xs font-black text-slate-800 uppercase">Parade Date</label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-800 uppercase">Batch Selection</label>
                    <select
                      value={selectedAttendanceBatch}
                      onChange={(e) => setSelectedAttendanceBatch(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="Batch I (3rd Year)">Batch I (3rd Year 'C' Cert)</option>
                      <option value="Batch II (2nd Year)">Batch II (2nd Year 'B' Cert)</option>
                      <option value="Batch III (1st Year)">Batch III (1st Year Probationers)</option>
                    </select>
                  </div>
                </div>

                {/* Attendance Marking Grid */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#001733] text-white font-black uppercase">
                      <tr>
                        <th className="py-3 px-4">Cadet ID</th>
                        <th className="py-3 px-4">Cadet Name</th>
                        <th className="py-3 px-4">Wing</th>
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Parade Status ({attendanceDate})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {enrollments.map((cadet) => {
                        const status = attendanceRecords[cadet.id] || "P";
                        return (
                          <tr key={cadet.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">{cadet.id}</td>
                            <td className="py-3 px-4 font-black text-slate-900">{cadet.fullName}</td>
                            <td className="py-3 px-4 font-bold">{cadet.gender}</td>
                            <td className="py-3 px-4 text-slate-600">{cadet.sbuCourse}</td>
                            <td className="py-3 px-4">
                              <div className="inline-flex space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-300">
                                <button
                                  type="button"
                                  onClick={() => setAttendanceRecords({ ...attendanceRecords, [cadet.id]: "P" })}
                                  className={`px-3 py-1 rounded text-xs font-black cursor-pointer ${
                                    status === "P" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-700 hover:bg-slate-200"
                                  }`}
                                >
                                  P (Present)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAttendanceRecords({ ...attendanceRecords, [cadet.id]: "A" })}
                                  className={`px-3 py-1 rounded text-xs font-black cursor-pointer ${
                                    status === "A" ? "bg-red-600 text-white shadow-xs" : "text-slate-700 hover:bg-slate-200"
                                  }`}
                                >
                                  A (Absent)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAttendanceRecords({ ...attendanceRecords, [cadet.id]: "L" })}
                                  className={`px-3 py-1 rounded text-xs font-black cursor-pointer ${
                                    status === "L" ? "bg-amber-500 text-slate-950 shadow-xs" : "text-slate-700 hover:bg-slate-200"
                                  }`}
                                >
                                  L (Late)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAttendanceRecords({ ...attendanceRecords, [cadet.id]: "OD" })}
                                  className={`px-3 py-1 rounded text-xs font-black cursor-pointer ${
                                    status === "OD" ? "bg-blue-600 text-white shadow-xs" : "text-slate-700 hover:bg-slate-200"
                                  }`}
                                >
                                  OD (Camp Duty)
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DISCIPLINE & AWARDS */}
          {activeTab === "discipline" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Cadet Discipline & Commendations</h2>
                    <p className="text-xs text-slate-500">Record Appreciations, Best Parade Badges, Warnings & Remarks</p>
                  </div>

                  <button
                    onClick={() => setCreateDisciplineModal(true)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>Add Discipline Record</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {disciplineEntries.map((entry) => (
                    <div key={entry.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          entry.type === "Appreciation" || entry.type === "Reward"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                        }`}>
                          {entry.type}
                        </span>
                        <span className="text-[11px] text-slate-500 font-bold">{entry.date}</span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base">{entry.title}</h3>
                      <p className="text-xs text-slate-700"><strong>Cadet:</strong> {entry.cadetName} ({entry.cadetId})</p>
                      <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">{entry.remarks}</p>
                      <p className="text-[10px] text-slate-500 text-right">Recorded by: {entry.officerName}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: EVENTS & NOTICES */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h2 className="text-2xl font-black text-slate-900">Events & Camps Management</h2>
                <p className="text-xs text-slate-500">Publish Annual Training Camps, Firing Selection, RDC Trials & Institutional Events</p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Upcoming Camps 2026</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <p className="font-extrabold text-[#002147] text-sm">Combined Annual Training Camp (CATC-III)</p>
                      <p className="text-slate-600">Location: Khel Gaon Ground, Ranchi</p>
                      <p className="text-slate-500 pt-1">Dates: 15 Aug - 24 Aug 2026 • 25 Vacancies</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <p className="font-extrabold text-[#002147] text-sm">Pre-RDC Selection Camp Phase I</p>
                      <p className="text-slate-600">Location: 19 JHR BN HQ, Namkum, Ranchi</p>
                      <p className="text-slate-500 pt-1">Dates: 01 Sep - 10 Sep 2026 • 12 Vacancies</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: REPORTS & EXCEL EXPORT */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h2 className="text-2xl font-black text-slate-900">Reports & Audit Downloads</h2>
                <p className="text-xs text-slate-500">Generate Battalion Nominal Roll, DBT Bank Account Workbooks, and Parade Attendance Logs</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-700" />
                    <h3 className="font-black text-slate-900 text-base">Master Nominal Roll (.XLSX)</h3>
                    <p className="text-xs text-slate-600">Contains Nominal Roll, Bank DBT details for Camp Allowances, Next of Kin & Address sheets.</p>
                    <button
                      onClick={handleDownloadExcel}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Master Nominal Roll</span>
                    </button>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <Printer className="w-8 h-8 text-[#002147]" />
                    <h3 className="font-black text-slate-900 text-base">Printable Enrollment Slips</h3>
                    <p className="text-xs text-slate-600">Generate individual or batch official enrollment confirmation slips for SBU & Battalion archives.</p>
                    <button
                      onClick={() => {
                        if (enrollments[0]) onOpenPrintableSlip(enrollments[0]);
                      }}
                      className="w-full py-2.5 bg-[#002147] hover:bg-[#001838] text-yellow-400 rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Sample Slip</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h2 className="text-2xl font-black text-slate-900">Officer Portal Settings</h2>
                <p className="text-xs text-slate-500">Associate NCC Officer (ANO) Credentials & System Configuration</p>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <p><strong>Officer Name:</strong> Capt. Dr. Animesh Roy</p>
                  <p><strong>Designation:</strong> Associate NCC Officer (ANO) - SBU Company</p>
                  <p><strong>Battalion:</strong> 19 Jharkhand Battalion NCC, Ranchi</p>
                  <p><strong>Directorate:</strong> Bihar and Jharkhand Directorate</p>
                  <p><strong>Institution:</strong> Sarala Birla University, Ranchi</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: VIEW CADET PROFILE MODAL */}
      {viewingProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="bg-[#002147] text-yellow-400 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                  {viewingProfileModal.gender === "SD" ? "Senior Division (Male)" : "Senior Wing (Female)"}
                </span>
                <h3 className="text-2xl font-black text-slate-900 pt-1">{viewingProfileModal.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono">Regimental No: {viewingProfileModal.enrollmentNo || "Pending Allocation"}</p>
              </div>
              <button
                onClick={() => setViewingProfileModal(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-tabs */}
            <div className="flex border-b border-slate-200 space-x-2 text-xs font-bold">
              <button
                onClick={() => setProfileTab("personal")}
                className={`pb-2 px-3 border-b-2 cursor-pointer ${
                  profileTab === "personal" ? "border-yellow-500 text-slate-900 font-black" : "border-transparent text-slate-500"
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setProfileTab("academic")}
                className={`pb-2 px-3 border-b-2 cursor-pointer ${
                  profileTab === "academic" ? "border-yellow-500 text-slate-900 font-black" : "border-transparent text-slate-500"
                }`}
              >
                Academic SBU
              </button>
              <button
                onClick={() => setProfileTab("physical")}
                className={`pb-2 px-3 border-b-2 cursor-pointer ${
                  profileTab === "physical" ? "border-yellow-500 text-slate-900 font-black" : "border-transparent text-slate-500"
                }`}
              >
                Fitness & Sports
              </button>
              <button
                onClick={() => setProfileTab("bank")}
                className={`pb-2 px-3 border-b-2 cursor-pointer ${
                  profileTab === "bank" ? "border-yellow-500 text-slate-900 font-black" : "border-transparent text-slate-500"
                }`}
              >
                Bank DBT
              </button>
            </div>

            {/* Profile Tab Content */}
            <div className="space-y-3 text-xs">
              {profileTab === "personal" && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p><strong>Mobile:</strong> {viewingProfileModal.mobile}</p>
                  <p><strong>Email:</strong> {viewingProfileModal.email}</p>
                  <p><strong>Aadhaar:</strong> {viewingProfileModal.aadhaarNumber}</p>
                  <p><strong>DOB:</strong> {viewingProfileModal.dob}</p>
                  <p><strong>Blood Group:</strong> {viewingProfileModal.bloodGroup}</p>
                  <p><strong>Father's Name:</strong> {viewingProfileModal.fatherName}</p>
                  <p><strong>Mother's Name:</strong> {viewingProfileModal.motherName}</p>
                  <p><strong>Identification Mark:</strong> {viewingProfileModal.identificationMark}</p>
                  <p className="col-span-2"><strong>Present Address:</strong> {viewingProfileModal.presentAddress}</p>
                </div>
              )}

              {profileTab === "academic" && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p><strong>SBU Course:</strong> {viewingProfileModal.sbuCourse}</p>
                  <p><strong>SBU Roll No:</strong> {viewingProfileModal.sbuRollNo}</p>
                  <p><strong>Department:</strong> {viewingProfileModal.sbuDepartment}</p>
                  <p><strong>Year / Semester:</strong> {viewingProfileModal.sbuYear} / {viewingProfileModal.sbuSemester}</p>
                  <p><strong>10th Percentage:</strong> {viewingProfileModal.marksPercentage10th}%</p>
                  <p><strong>12th Percentage:</strong> {viewingProfileModal.marksPercentage12th}%</p>
                </div>
              )}

              {profileTab === "physical" && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p><strong>1600m Run Time:</strong> {viewingProfileModal.run1600mTime}</p>
                  <p><strong>Pushups Count:</strong> {viewingProfileModal.pushupsCount}</p>
                  <p><strong>Height:</strong> {viewingProfileModal.heightCm} cm</p>
                  <p><strong>Weight:</strong> {viewingProfileModal.weightKg} kg</p>
                  <p><strong>Junior 'A' Cert:</strong> {viewingProfileModal.hasJuniorCertificate ? "Yes (" + viewingProfileModal.juniorCertificateNo + ")" : "No"}</p>
                  <p><strong>Sports Level:</strong> {viewingProfileModal.sportsLevel}</p>
                </div>
              )}

              {profileTab === "bank" && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p><strong>Bank Name:</strong> {viewingProfileModal.bankName}</p>
                  <p><strong>Account Number:</strong> {viewingProfileModal.accountNumber}</p>
                  <p><strong>IFSC Code:</strong> {viewingProfileModal.ifscCode}</p>
                  <p><strong>Guardian Name:</strong> {viewingProfileModal.guardianName}</p>
                  <p><strong>Guardian Mobile:</strong> {viewingProfileModal.guardianMobile}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => {
                  onOpenPrintableSlip(viewingProfileModal);
                  setViewingProfileModal(null);
                }}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl font-black text-xs cursor-pointer flex items-center space-x-1"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Slip</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE STATUS & REGIMENTAL NUMBER */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Update Cadet Status</h3>
                <p className="text-xs text-slate-500">{selectedRecord.fullName} ({selectedRecord.id})</p>
              </div>
              <button onClick={() => setSelectedRecord(null)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="font-black text-slate-800 uppercase">Processing Status</label>
                <select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Submitted">Submitted (Under Scrutiny)</option>
                  <option value="Physical Scheduled">Physical Test Scheduled</option>
                  <option value="Medical Cleared">Medical Test Cleared</option>
                  <option value="Selected">Selected for Enrollment</option>
                  <option value="Enrolled">Enrolled (Regimental No Allocated)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase">NCC Regimental Number (If Enrolled)</label>
                <input
                  type="text"
                  placeholder="e.g. JHR/26/SD/19/204801"
                  value={editingRegNo}
                  onChange={(e) => setEditingRegNo(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase">Officer Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Enter remarks regarding fitness, ground test performance, medical clearance..."
                  value={editingRemarks}
                  onChange={(e) => setEditingRemarks(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-[#002147] hover:bg-[#001838] text-yellow-400 rounded-xl font-black shadow-md cursor-pointer"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: CREATE CLASS / PARADE MODAL */}
      {createClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-lg">Schedule Parade / Classroom Session</h3>
              <button onClick={() => setCreateClassModal(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateClassSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-black text-slate-800 uppercase">Class Title</label>
                <input
                  type="text"
                  placeholder="e.g. Weapon Training 0.22 Rifle Safety"
                  value={newClassForm.title}
                  onChange={(e) => setNewClassForm({ ...newClassForm, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase">Syllabus Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Map Reading: Finding own position using protractor"
                  value={newClassForm.topic}
                  onChange={(e) => setNewClassForm({ ...newClassForm, topic: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-800 uppercase">Date</label>
                  <input
                    type="date"
                    value={newClassForm.date}
                    onChange={(e) => setNewClassForm({ ...newClassForm, date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-800 uppercase">Time</label>
                  <input
                    type="text"
                    value={newClassForm.time}
                    onChange={(e) => setNewClassForm({ ...newClassForm, time: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase">Venue</label>
                <input
                  type="text"
                  value={newClassForm.venue}
                  onChange={(e) => setNewClassForm({ ...newClassForm, venue: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateClassModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-400 text-slate-950 rounded-xl font-black shadow-md"
                >
                  Schedule Session
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 4: CREATE DISCIPLINE RECORD MODAL */}
      {createDisciplineModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-lg">Add Discipline / Award Entry</h3>
              <button onClick={() => setCreateDisciplineModal(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateDisciplineSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-black text-slate-800 uppercase">Select Cadet</label>
                <select
                  value={newDisciplineForm.cadetId}
                  onChange={(e) => setNewDisciplineForm({ ...newDisciplineForm, cadetId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                  required
                >
                  <option value="">Select Cadet...</option>
                  {enrollments.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.id}) - {c.sbuCourse}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-800 uppercase">Entry Type</label>
                  <select
                    value={newDisciplineForm.type}
                    onChange={(e) => setNewDisciplineForm({ ...newDisciplineForm, type: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Appreciation">Appreciation</option>
                    <option value="Reward">Reward / Badge</option>
                    <option value="Warning">Warning</option>
                    <option value="Punishment">Punishment / Extra Drill</option>
                  </select>
                </div>
                <div>
                  <label className="font-black text-slate-800 uppercase">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Best Drill Commendation"
                    value={newDisciplineForm.title}
                    onChange={(e) => setNewDisciplineForm({ ...newDisciplineForm, title: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase">Officer Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Enter details of incident or commendation..."
                  value={newDisciplineForm.remarks}
                  onChange={(e) => setNewDisciplineForm({ ...newDisciplineForm, remarks: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateDisciplineModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002147] text-yellow-400 rounded-xl font-black shadow-md"
                >
                  Record Entry
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
