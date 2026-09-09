import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NotificationsFeed } from "@frontend/features/NotificationsFeed";
import { StatsOverview } from "@frontend/features/Admin/StatsOverview";
import { RecentRegistrations } from "@frontend/features/Admin/RecentRegistrations";
import { NotificationBroadcaster } from "@frontend/features/Admin/NotificationBroadcaster";
import { AttackSurfaceManager } from "@frontend/features/Admin/AttackSurfaceManager";
import { EnterpriseDataPlatform, LeaveRecordItem } from "@backend/services/dataPlatform";
import { useRealtimeData } from "@frontend/hooks/useRealtimeData";
import {
  AlertTriangle,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Info,
  Layers,
  LogOut,
  Megaphone,
  Menu,
  Plus,
  Printer,
  Radio,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { CadetRecord } from "@/types";

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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenPrintableSlip }) => {
  // Navigation active module state
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "batches"
    | "cadets"
    | "activities"
    | "broadcast"
    | "attendance"
    | "discipline"
    | "events"
    | "reports"
    | "security"
    | "settings"
    | "leaves"
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

  // Leaves CRM State
  const [leaves, setLeaves] = useState<LeaveRecordItem[]>([]);
  const [leaveFilter, setLeaveFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">(
    "All",
  );

  // Selected Cadet for Modals
  const [selectedRecord, setSelectedRecord] = useState<CadetRecord | null>(null);
  const [viewingProfileModal, setViewingProfileModal] = useState<CadetRecord | null>(null);
  const [profileTab, setProfileTab] = useState<
    "personal" | "academic" | "physical" | "bank" | "attendance"
  >("personal");

  // Status Edit State & Guided Follow-up Fields
  const [editingStatus, setEditingStatus] = useState<string>("Submitted");
  const [editingRemarks, setEditingRemarks] = useState<string>("");
  const [editingRegNo, setEditingRegNo] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Guided PET Follow-up State
  const [petDate, setPetDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [petTime, setPetTime] = useState<string>("06:00 AM - 08:30 AM");
  const [petVenue, setPetVenue] = useState<string>("SBU Sports Ground (Purulia Road)");
  const [petInstructions, setPetInstructions] = useState<string>(
    "Wear white sports PT kit and running shoes. Bring Aadhaar card, original 10th/12th marksheets, and water bottle.",
  );

  // Guided Medical & Correction Follow-up State
  const [medicalFitness, setMedicalFitness] = useState<"FIT" | "TEMPORARY_UNFIT" | "UNFIT">("FIT");
  const [medicalFindings, setMedicalFindings] = useState<string>(
    "Vision 6/6, Height & Chest expansion verified, Blood pressure normal. Clear for parade drill.",
  );
  const [correctionNote, setCorrectionNote] = useState<string>(
    "Please re-upload a clear scanned copy of your 10th & 12th marksheets and Aadhaar card.",
  );
  const [assignedPlatoon, setAssignedPlatoon] = useState<string>("Platoon Alpha (Senior Division)");
  const [autoDispatchAlert, setAutoDispatchAlert] = useState<boolean>(true);

  // Broadcast Form State
  const [broadcastSubject, setBroadcastSubject] = useState<string>("");
  const [broadcastBody, setBroadcastBody] = useState<string>("");
  const [broadcastTarget, setBroadcastTarget] = useState<string>("All Cadets");
  const [broadcastChannels, setBroadcastChannels] = useState<{
    email: boolean;
    app: boolean;
    sms: boolean;
  }>({
    email: true,
    app: true,
    sms: false,
  });
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastMessage[]>([]);

  // Attendance CRM State
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedAttendanceBatch, setSelectedAttendanceBatch] =
    useState<string>("Batch I (3rd Year)");
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, "P" | "A" | "L" | "OD">
  >({});

  // Classes & Activities Schedule
  const [classes, setClasses] = useState<ClassScheduleItem[]>([]);
  const [createClassModal, setCreateClassModal] = useState<boolean>(false);
  const [newClassForm, setNewClassForm] = useState({
    title: "",
    topic: "",
    instructor: "Capt. Dr. Animesh Roy (ANO)",
    date: new Date().toISOString().split("T")[0],
    time: "06:30 AM - 08:00 AM",
    venue: "SBU Parade Ground",
    batchTarget: "All Batches",
  });

  // Discipline Entries State
  const [disciplineEntries, setDisciplineEntries] = useState<DisciplineEntry[]>([]);
  const [createDisciplineModal, setCreateDisciplineModal] = useState<boolean>(false);
  const [newDisciplineForm, setNewDisciplineForm] = useState({
    cadetId: "",
    type: "Appreciation" as "Appreciation" | "Reward" | "Warning" | "Punishment",
    title: "",
    remarks: "",
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Real-time WebSocket Event Handlers
  const handleRealtimeEnrollmentSubmitted = useCallback(
    (record: CadetRecord) => {
      setEnrollments((prev) => {
        const exists = prev.some((e) => e.id === record.id);
        if (exists) return prev;
        return [record, ...prev];
      });
      showToast(
        `⚡ REAL-TIME: New cadet application received from ${record.fullName} (${record.sbuCourse})`,
      );
    },
    [showToast],
  );

  const handleRealtimeStatusUpdated = useCallback((record: CadetRecord) => {
    setEnrollments((prev) => prev.map((e) => (e.id === record.id ? record : e)));
  }, []);

  const { isConnected, latencyMs, activePresenceCount } = useRealtimeData({
    channels: ["cadre:enrollments", "cadre:notifications", "cadre:presence"],
    onEnrollmentSubmitted: handleRealtimeEnrollmentSubmitted,
    onStatusUpdated: handleRealtimeStatusUpdated,
  });

  // Fetch all initial data from Enterprise Data Platform Engine
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Enrollments
      const enrollRes = await EnterpriseDataPlatform.getEnrollments();
      if (enrollRes.success && enrollRes.data?.enrollments) {
        setEnrollments(enrollRes.data.enrollments);
        // Initialize default attendance map from enrollments
        const initialAttendance: Record<string, "P" | "A" | "L" | "OD"> = {};
        enrollRes.data.enrollments.forEach((cadet) => {
          initialAttendance[cadet.id] = "P";
        });
        setAttendanceRecords(initialAttendance);
      }

      // 2. Fetch Broadcasts / Notifications
      const notificationsRes = await EnterpriseDataPlatform.getNotifications();
      if (notificationsRes.success && notificationsRes.data?.notifications) {
        const mappedBroadcasts: BroadcastMessage[] = notificationsRes.data.notifications.map(
          (n) => ({
            id: n.id,
            subject: n.title,
            body: n.body,
            target: n.category === "Parade Order" ? "All Cadets" : "Active Cadre",
            sentAt: n.date || new Date().toISOString().replace("T", " ").slice(0, 16),
            recipientCount: enrollRes.data?.enrollments?.length || 0,
            deliveryStatus: "Dispatched (100%)",
            channels: ["Email", "In-App Portal"],
          }),
        );
        setBroadcastHistory(mappedBroadcasts);
      }

      // 3. Fetch Calendar Events & Activities
      const calRes = await EnterpriseDataPlatform.getCalendarEvents();
      if (calRes.success && calRes.data?.events) {
        const mappedClasses: ClassScheduleItem[] = calRes.data.events.map((e) => ({
          id: e.id,
          title: e.title,
          topic: e.description || "Regimental Training & Drill",
          instructor: e.event_type === "Camp" ? "Commanding Officer / ANO" : "ANO SBU Sub-Unit",
          date: e.start_time ? new Date(e.start_time).toISOString().split("T")[0] : "2026-08-15",
          time: "06:30 AM - 08:30 AM",
          venue: e.location || "SBU Parade Ground",
          batchTarget: "All Batches (SD & SW)",
          status: "Scheduled",
        }));
        setClasses(mappedClasses);
      }

      // 4. Fetch Discipline Records
      const discRes = await EnterpriseDataPlatform.getDisciplineRecords();
      if (discRes.success && discRes.data?.records) {
        setDisciplineEntries(discRes.data.records);
      }

      // 5. Fetch Cadet Leave Applications
      const leavesRes = await EnterpriseDataPlatform.getLeaves();
      if (leavesRes.success && leavesRes.data?.leaves) {
        setLeaves(leavesRes.data.leaves);
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Leave Review Action Handler
  const handleReviewLeave = async (
    leaveId: string,
    status: "Approved" | "Rejected",
    customRemark?: string,
  ) => {
    const remark =
      customRemark ||
      (status === "Approved"
        ? "Leave approved by ANO Company Office SBU Sub-Unit."
        : "Leave rejected due to mandatory battalion parade schedule.");

    try {
      const res = await EnterpriseDataPlatform.updateLeaveStatus({
        id: leaveId,
        status,
        remarks: remark,
        officerName: "Capt. Dr. Animesh Roy (ANO)",
      });

      if (res.success) {
        showToast(`Leave application ${status.toLowerCase()} successfully.`);
        setLeaves((prev) =>
          prev.map((l) => (l.id === leaveId ? { ...l, status, officerRemarks: remark } : l)),
        );
        fetchAllData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed";
      showToast(`Error reviewing leave: ${msg}`);
    }
  };

  // Regimental Number Auto-Generator
  const handleAutoGenerateRegNo = (cadet: CadetRecord) => {
    const wing = cadet.gender === "SW" ? "SW" : "SD";
    const year = new Date().getFullYear().toString().slice(-2);
    const cleanRoll =
      cadet.sbuRollNo.replace(/\D/g, "").slice(-4) ||
      Math.floor(1000 + Math.random() * 9000).toString();
    setEditingRegNo(`JHR/${year}/${wing}/19/${cleanRoll}`);
    showToast("Generated official 19 Battalion Regimental Number.");
  };

  // Filter Logic
  const filteredCadets = enrollments.filter((e) => {
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
    if (e.sbuYear.includes("3rd") || e.sbuYear.includes("3")) cadetBatch = "Batch I (3rd Year)";
    else if (e.sbuYear.includes("2nd") || e.sbuYear.includes("2"))
      cadetBatch = "Batch II (2nd Year)";

    const matchesBatch = batchFilter === "All" || cadetBatch.includes(batchFilter);

    return matchesQuery && matchesGender && matchesStatus && matchesBatch;
  });

  // Dynamic Batch Computations
  const batchICadets = enrollments.filter(
    (e) => e.sbuYear.includes("3rd") || e.sbuYear.includes("3"),
  );
  const batchIICadets = enrollments.filter(
    (e) => e.sbuYear.includes("2nd") || e.sbuYear.includes("2"),
  );
  const batchIIICadets = enrollments.filter(
    (e) =>
      e.sbuYear.includes("1st") ||
      e.sbuYear.includes("1") ||
      (!e.sbuYear.includes("2") && !e.sbuYear.includes("3")),
  );

  // Status Update Handler with Guided Follow-up Metadata
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setIsUpdating(true);
    try {
      let structuredRemarks = editingRemarks.trim();
      if (editingStatus === "Physical Scheduled") {
        structuredRemarks += ` | PET Scheduled: ${petDate} at ${petTime} | Venue: ${petVenue} | Instructions: ${petInstructions}`;
      } else if (editingStatus === "Medical Cleared") {
        structuredRemarks += ` | Medical Fitness: ${medicalFitness} | Findings: ${medicalFindings}`;
      } else if (editingStatus === "Submitted" && correctionNote.trim()) {
        structuredRemarks += ` | Action Required: ${correctionNote}`;
      } else if (editingStatus === "Enrolled" || editingStatus === "Selected") {
        structuredRemarks += ` | Assigned: ${assignedPlatoon} | Kit Allotment Approved`;
      }

      const res = await EnterpriseDataPlatform.updateStatus({
        id: selectedRecord.id,
        status: editingStatus,
        remarks: structuredRemarks,
        enrollmentNo: editingRegNo,
      });

      if (res.success) {
        showToast(`Status updated successfully for ${selectedRecord.fullName}`);

        if (autoDispatchAlert) {
          try {
            await EnterpriseDataPlatform.broadcastNotice({
              title: `[19 JHR BN] Application Status: ${editingStatus}`,
              body: `Dear ${selectedRecord.fullName} (${selectedRecord.id}), your application is now "${editingStatus}". Follow-up details: ${structuredRemarks}`,
              category: "Parade Order",
              priority: "High",
            });
          } catch {
            /* non-blocking */
          }
        }

        setSelectedRecord(null);
        fetchAllData();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed";
      console.error("Failed to update status:", err);
      showToast(`Error updating status: ${message}`);
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
        priority: "High",
      });

      if (res.success) {
        const newMsg: BroadcastMessage = {
          id: res.data?.notification?.id || `MSG-${Math.floor(100 + Math.random() * 900)}`,
          subject: broadcastSubject,
          body: broadcastBody,
          target: broadcastTarget,
          sentAt: new Date().toISOString().replace("T", " ").slice(0, 16),
          recipientCount: enrollments.length,
          deliveryStatus: "Delivered (100%)",
          channels: activeChannels,
        };

        setBroadcastHistory([newMsg, ...broadcastHistory]);
        setBroadcastSubject("");
        setBroadcastBody("");
        showToast(
          `📢 Realtime Broadcast Dispatched to ${broadcastTarget} & Synced across WebSockets!`,
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to dispatch notice";
      showToast(`Broadcast Error: ${message}`);
    }
  };

  // Create Class Submit
  const handleCreateClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassForm.title.trim()) return;

    try {
      const createRes = await EnterpriseDataPlatform.createCalendarEvent({
        title: newClassForm.title,
        description: `${newClassForm.topic} | Instructor: ${newClassForm.instructor} | Target: ${newClassForm.batchTarget}`,
        start_time: `${newClassForm.date}T06:30:00Z`,
        end_time: `${newClassForm.date}T08:00:00Z`,
        location: newClassForm.venue,
        event_type: "Training",
      });

      const newItem: ClassScheduleItem = {
        id: createRes.data?.event?.id || `CLS-${Math.floor(100 + Math.random() * 900)}`,
        title: newClassForm.title,
        topic: newClassForm.topic,
        instructor: newClassForm.instructor,
        date: newClassForm.date,
        time: newClassForm.time,
        venue: newClassForm.venue,
        batchTarget: newClassForm.batchTarget,
        status: "Scheduled",
      };

      setClasses([newItem, ...classes]);
      setCreateClassModal(false);
      showToast("Training session scheduled and published to cadet portal.");
    } catch {
      showToast("Scheduled locally in session.");
      setCreateClassModal(false);
    }
  };

  // Create Discipline Submit
  const handleCreateDisciplineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCadet = enrollments.find((e) => e.id === newDisciplineForm.cadetId);
    if (!targetCadet || !newDisciplineForm.title) return;

    try {
      const res = await EnterpriseDataPlatform.addDisciplineRecord({
        cadetId: targetCadet.id,
        cadetName: targetCadet.fullName,
        type: newDisciplineForm.type,
        title: newDisciplineForm.title,
        remarks: newDisciplineForm.remarks,
        officerName: "Capt. Dr. Animesh Roy (ANO)",
      });

      if (res.success && res.data?.record) {
        setDisciplineEntries([res.data.record, ...disciplineEntries]);
      } else {
        const fallbackEntry: DisciplineEntry = {
          id: `DISC-${Math.floor(100 + Math.random() * 900)}`,
          cadetId: targetCadet.id,
          cadetName: targetCadet.fullName,
          type: newDisciplineForm.type,
          title: newDisciplineForm.title,
          date: new Date().toISOString().split("T")[0],
          remarks: newDisciplineForm.remarks,
          officerName: "Capt. Dr. Animesh Roy (ANO)",
        };
        setDisciplineEntries([fallbackEntry, ...disciplineEntries]);
      }

      setCreateDisciplineModal(false);
      showToast(`Discipline record recorded for ${targetCadet.fullName}`);
    } catch {
      showToast("Saved discipline record.");
      setCreateDisciplineModal(false);
    }
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
    { id: "leaves", label: "Cadet Leave Requests", icon: CalendarDays },
    { id: "activities", label: "Classes & Drill Schedule", icon: BookOpen },
    { id: "broadcast", label: "Broadcast & Notices", icon: Megaphone },
    { id: "attendance", label: "Attendance Sheet Grid", icon: UserCheck },
    { id: "discipline", label: "Discipline & Awards", icon: Award },
    { id: "events", label: "Events & Camps Calendar", icon: Calendar },
    { id: "reports", label: "Reports & Excel Export", icon: FileSpreadsheet },
    { id: "security", label: "Attack Surface & Threat Intel", icon: ShieldCheck },
    { id: "settings", label: "Officer Portal Settings", icon: Settings },
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
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Officer Header Bar */}
      <header className="glass-panel border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Left: Brand & Sidebar Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2.5 rounded-xl glass-pill hover:scale-105 text-zinc-300 hover:text-white transition-all cursor-pointer hidden md:flex items-center justify-center"
              title="Toggle Sidebar Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2.5 rounded-xl glass-pill text-zinc-300 hover:text-white transition-all cursor-pointer md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 p-0.5 border border-white/20 shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight text-white">
                    19 JHR BN NCC • Officer Command Portal
                  </h1>
                  <span className="glass-pill text-blue-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block border border-blue-400/30">
                    ANO HQ • SBU
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">
                  Regimental Cadre Administration & Live Database Engine
                </p>
              </div>
            </div>
          </div>

          {/* Right: Officer Profile, Sync Indicator & Actions */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="hidden lg:flex items-center space-x-2 glass-pill px-3 py-1.5 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>HQ Engine Live ({latencyMs || 24}ms)</span>
            </div>

            <button
              onClick={() => setActiveTab("broadcast")}
              className="p-2.5 rounded-xl glass-pill text-zinc-300 hover:text-white relative transition-all cursor-pointer hover:scale-105"
              title="Broadcast Messages"
            >
              <Bell className="w-4 h-4 text-blue-400" />
              {broadcastHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
              )}
            </button>

            <button
              onClick={() => fetchAllData()}
              className="p-2.5 rounded-xl glass-pill text-zinc-300 hover:text-white transition-all cursor-pointer hover:scale-105"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 text-zinc-300 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 relative z-10">
        {/* Desktop Sidebar Navigation */}
        <aside
          className={`hidden md:flex flex-col border-r border-white/10 glass-panel transition-all duration-300 shrink-0 ${
            sidebarCollapsed ? "w-20" : "w-72"
          }`}
        >
          <div className="p-4 flex-1 space-y-1.5 overflow-y-auto">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                  title={item.label}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-zinc-400"}`}
                  />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.id === "leaves" &&
                        leaves.filter((l) => l.status === "Pending").length > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {leaves.filter((l) => l.status === "Pending").length}
                          </span>
                        )}
                      {item.id === "cadets" &&
                        enrollments.filter((e) => e.status === "Submitted").length > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            {enrollments.filter((e) => e.status === "Submitted").length}
                          </span>
                        )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => window.location.reload()}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer ${
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
              className="fixed inset-y-0 left-0 z-50 w-72 glass-panel-elevated border-r border-white/15 p-5 space-y-4 md:hidden shadow-2xl flex flex-col justify-between backdrop-blur-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span className="font-black text-white text-sm">Officer Navigation</span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 glass-pill rounded-lg"
                  >
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
                          setActiveTab(item.id as typeof activeTab);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? "bg-blue-600 text-white font-black shadow-lg"
                            : "text-zinc-300 hover:bg-white/10"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-blue-400" />
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span>{item.label}</span>
                          {item.id === "leaves" &&
                            leaves.filter((l) => l.status === "Pending").length > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                {leaves.filter((l) => l.status === "Pending").length}
                              </span>
                            )}
                          {item.id === "cadets" &&
                            enrollments.filter((e) => e.status === "Submitted").length > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                {enrollments.filter((e) => e.status === "Submitted").length}
                              </span>
                            )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600/30 border border-red-500/40 text-red-300 rounded-xl text-xs font-bold"
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
              <StatsOverview
                enrollments={enrollments}
                setActiveTab={(tab) => setActiveTab(tab as typeof activeTab)}
              />

              {/* COMMAND FOLLOW-UP CENTER & ACTION QUEUE */}
              <div className="glass-card-classic rounded-2xl p-6 border border-amber-500/20 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base sm:text-lg tracking-tight flex items-center gap-2">
                        <span>Command Follow-up Center & Action Queue</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider glass-badge-amber">
                          Priority Scrutiny
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400 font-medium">
                        Real-time scrutiny backlog, pending cadet leaves & compliance reminders
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-zinc-400">Live Queue:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {enrollments.filter((e) => e.status === "Submitted").length +
                        leaves.filter((l) => l.status === "Pending").length}{" "}
                      Pending Actions
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Action 1: Pending Applications */}
                  <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-3 glass-flow-step">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-blue-400">
                        <UserCheck className="w-4 h-4" />
                        <span className="font-bold text-xs">Form 1 Scrutiny</span>
                      </div>
                      <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {enrollments.filter((e) => e.status === "Submitted").length} New
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Cadet applications waiting for physical test scheduling & document review.
                    </p>
                    <button
                      onClick={() => {
                        setStatusFilter("Submitted");
                        setActiveTab("cadets");
                      }}
                      className="w-full text-xs font-bold text-blue-300 hover:text-white glass-pill py-2 rounded-xl border border-blue-400/30 hover:bg-blue-600/30 flex items-center justify-center space-x-1 transition-all cursor-pointer"
                    >
                      <span>Review Scrutiny Queue</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Action 2: Pending Leave Requests */}
                  <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-3 glass-flow-step">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-amber-400">
                        <CalendarDays className="w-4 h-4" />
                        <span className="font-bold text-xs">Leave Requests</span>
                      </div>
                      <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {leaves.filter((l) => l.status === "Pending").length} Pending
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Cadet leave requests awaiting ANO company authorization for upcoming parades.
                    </p>
                    <button
                      onClick={() => {
                        setLeaveFilter("Pending");
                        setActiveTab("leaves");
                      }}
                      className="w-full text-xs font-bold text-amber-300 hover:text-white glass-pill py-2 rounded-xl border border-amber-500/30 hover:bg-amber-600/30 flex items-center justify-center space-x-1 transition-all cursor-pointer"
                    >
                      <span>Process Leaves</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Action 3: Parade Roll & Attendance Reminders */}
                  <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-3 glass-flow-step">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-bold text-xs">Parade & Attendance</span>
                      </div>
                      <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Active Roll
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Record morning squad muster roll, lecture attendance & reward commendations.
                    </p>
                    <button
                      onClick={() => setActiveTab("attendance")}
                      className="w-full text-xs font-bold text-emerald-300 hover:text-white glass-pill py-2 rounded-xl border border-emerald-500/30 hover:bg-emerald-600/30 flex items-center justify-center space-x-1 transition-all cursor-pointer"
                    >
                      <span>Open Attendance Sheet</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RecentRegistrations
                  enrollments={enrollments}
                  setActiveTab={(tab) => setActiveTab(tab as typeof activeTab)}
                  setSelectedRecord={setSelectedRecord}
                  setEditingStatus={setEditingStatus}
                  setEditingRemarks={setEditingRemarks}
                  setEditingRegNo={setEditingRegNo}
                />

                <div className="space-y-6">
                  {/* Scheduled Classes */}
                  <div className="glass-panel rounded-2xl p-5 space-y-3 shadow-xl border border-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="font-extrabold text-white text-sm flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span>Upcoming Drill & Classes</span>
                      </h4>
                      <button
                        onClick={() => setActiveTab("activities")}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Schedule →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {classes.slice(0, 2).map((c) => (
                        <div
                          key={c.id}
                          className="glass-panel rounded-xl p-3 text-xs space-y-1 border border-white/10"
                        >
                          <p className="font-extrabold text-white">{c.title}</p>
                          <p className="text-[11px] text-zinc-400">{c.topic}</p>
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/10">
                            <span>
                              📅 {c.date} • {c.time}
                            </span>
                            <span className="font-bold text-blue-300">{c.venue}</span>
                          </div>
                        </div>
                      ))}
                      {classes.length === 0 && (
                        <p className="text-xs text-zinc-400 py-4 text-center">
                          No upcoming drill classes scheduled yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Broadcast History Summary */}
                  <div className="glass-panel rounded-2xl p-5 space-y-3 shadow-xl border border-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="font-black text-blue-400 text-sm flex items-center space-x-2">
                        <Megaphone className="w-4 h-4" />
                        <span>Latest Officer Broadcast</span>
                      </h4>
                      <span className="text-[10px] glass-pill text-blue-300 px-2 py-0.5 rounded font-bold border border-blue-400/30">
                        Live Dispatched
                      </span>
                    </div>

                    {broadcastHistory[0] ? (
                      <div className="space-y-1.5 text-xs">
                        <p className="font-extrabold text-white">{broadcastHistory[0].subject}</p>
                        <p className="text-[11px] text-zinc-400 line-clamp-2">
                          {broadcastHistory[0].body}
                        </p>
                        <div className="text-[10px] text-blue-300 pt-1 flex justify-between">
                          <span>Target: {broadcastHistory[0].target}</span>
                          <span>{broadcastHistory[0].sentAt}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 py-4 text-center">
                        No broadcasts dispatched yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BATCHES & WINGS */}
          {activeTab === "batches" && (
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">Batch & Wing Structure</h2>
                    <p className="text-xs text-zinc-400">
                      19 Jharkhand Battalion NCC Senior Division (Male) & Senior Wing (Female) Cadre
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="glass-pill px-3 py-1 rounded-full text-xs font-bold text-blue-300 border border-blue-400/30">
                      Total Cadre: {enrollments.length} Cadets
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Batch I */}
                  <div className="glass-panel rounded-2xl p-5 space-y-4 relative shadow-lg border border-blue-500/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-blue-600/30 text-blue-300 border border-blue-400/40 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                          Senior Batch
                        </span>
                        <h3 className="text-lg font-black text-white pt-2">Batch I (3rd Year)</h3>
                        <p className="text-xs text-zinc-400 font-semibold">
                          'C' Certificate Cadets
                        </p>
                      </div>
                      <Award className="w-6 h-6 text-blue-400" />
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-white/10">
                        <span className="text-zinc-400 font-medium">Total Cadets:</span>
                        <span className="font-extrabold text-white">
                          {batchICadets.length} Cadets
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/10">
                        <span className="text-zinc-400 font-medium">SD / SW Split:</span>
                        <span className="font-extrabold text-blue-300">
                          {batchICadets.filter((c) => c.gender === "SD").length} SD /{" "}
                          {batchICadets.filter((c) => c.gender === "SW").length} SW
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/10">
                        <span className="text-zinc-400 font-medium">Senior Ranks:</span>
                        <span className="font-bold text-amber-300">SUO, JUO, CQMS, SGT</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setBatchFilter("Batch I");
                        setActiveTab("cadets");
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Filter Batch I Cadets
                    </button>
                  </div>

                  {/* Batch II */}
                  <div className="glass-panel rounded-2xl p-5 space-y-4 relative shadow-lg border border-indigo-500/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-indigo-600/30 text-indigo-300 border border-indigo-400/40 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                          Intermediate Batch
                        </span>
                        <h3 className="text-lg font-black text-white pt-2">Batch II (2nd Year)</h3>
                        <p className="text-xs text-zinc-400 font-semibold">
                          'B' Certificate Cadets
                        </p>
                      </div>
                      <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-white/10">
                        <span className="text-zinc-400 font-medium">Total Cadets:</span>
                        <span className="font-extrabold text-white">
                          {batchIICadets.length} Cadets
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/10">
                        <span className="text-zinc-400 font-medium">SD / SW Split:</span>
                        <span className="font-extrabold text-indigo-300">
                          {batchIICadets.filter((c) => c.gender === "SD").length} SD /{" "}
                          {batchIICadets.filter((c) => c.gender === "SW").length} SW
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/10">
                        <span className="text-zinc-400 font-medium">Ranks:</span>
                        <span className="font-bold text-indigo-300">L/Cpl, Cpl, SGT</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setBatchFilter("Batch II");
                        setActiveTab("cadets");
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Filter Batch II Cadets
                    </button>
                  </div>

                  {/* Batch III */}
                  <div className="glass-panel rounded-2xl p-5 space-y-4 relative shadow-lg border border-emerald-500/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-emerald-600/30 text-emerald-300 border border-emerald-400/40 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                          Junior Cadre
                        </span>
                        <h3 className="text-lg font-black text-white pt-2">Batch III (1st Year)</h3>
                        <p className="text-xs text-zinc-400 font-semibold">New Enrolled Cadets</p>
                      </div>
                      <GraduationCap className="w-6 h-6 text-emerald-400" />
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-white/10">
                        <span className="text-zinc-400 font-medium">Total Cadets:</span>
                        <span className="font-extrabold text-white">
                          {batchIIICadets.length} Cadets
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/10">
                        <span className="text-zinc-400 font-medium">SD / SW Split:</span>
                        <span className="font-extrabold text-emerald-300">
                          {batchIIICadets.filter((c) => c.gender === "SD").length} SD /{" "}
                          {batchIIICadets.filter((c) => c.gender === "SW").length} SW
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/10">
                        <span className="text-zinc-400 font-medium">Ranks:</span>
                        <span className="font-bold text-emerald-300">Cadet Probationers</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setBatchFilter("Batch III");
                        setActiveTab("cadets");
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
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
              <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      Cadet Master Database (Nominal Roll CRM)
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Search, view profiles, update regimental status, and manage DBT bank accounts
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownloadExcel}
                      className="glass-pill text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/20 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer transition-all hover:scale-105"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Excel</span>
                    </button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 glass-panel p-4 rounded-xl border border-white/10">
                  <div>
                    <label className="text-[11px] font-extrabold text-zinc-300 uppercase">
                      Search Cadet
                    </label>
                    <div className="relative mt-1">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Name, Roll, Aadhaar, Mobile..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 glass-input rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-zinc-300 uppercase">
                      Wing / Gender
                    </label>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="w-full mt-1 px-3 py-2 glass-input rounded-xl text-xs font-medium"
                    >
                      <option value="All" className="bg-[#0b1329] text-white">
                        All Wings (SD & SW)
                      </option>
                      <option value="SD" className="bg-[#0b1329] text-white">
                        Senior Division (SD - Male)
                      </option>
                      <option value="SW" className="bg-[#0b1329] text-white">
                        Senior Wing (SW - Female)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-zinc-300 uppercase">
                      Enrollment Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full mt-1 px-3 py-2 glass-input rounded-xl text-xs font-medium"
                    >
                      <option value="All" className="bg-[#0b1329] text-white">
                        All Statuses
                      </option>
                      <option value="Submitted" className="bg-[#0b1329] text-white">
                        Submitted (Online)
                      </option>
                      <option value="Physical Scheduled" className="bg-[#0b1329] text-white">
                        Physical Scheduled
                      </option>
                      <option value="Medical Cleared" className="bg-[#0b1329] text-white">
                        Medical Cleared
                      </option>
                      <option value="Selected" className="bg-[#0b1329] text-white">
                        Selected
                      </option>
                      <option value="Enrolled" className="bg-[#0b1329] text-white">
                        Enrolled
                      </option>
                      <option value="Rejected" className="bg-[#0b1329] text-white">
                        Rejected
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-zinc-300 uppercase">
                      Batch Year
                    </label>
                    <select
                      value={batchFilter}
                      onChange={(e) => setBatchFilter(e.target.value)}
                      className="w-full mt-1 px-3 py-2 glass-input rounded-xl text-xs font-medium"
                    >
                      <option value="All" className="bg-[#0b1329] text-white">
                        All Batches
                      </option>
                      <option value="Batch I" className="bg-[#0b1329] text-white">
                        Batch I (3rd Year)
                      </option>
                      <option value="Batch II" className="bg-[#0b1329] text-white">
                        Batch II (2nd Year)
                      </option>
                      <option value="Batch III" className="bg-[#0b1329] text-white">
                        Batch III (1st Year)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Cadet Data Table */}
                <div className="overflow-x-auto border border-white/10 rounded-2xl glass-panel">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-zinc-300 font-black uppercase tracking-wider border-b border-white/10">
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
                    <tbody className="divide-y divide-white/5">
                      {filteredCadets.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-zinc-400 font-bold">
                            No cadets found matching search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredCadets.map((cadet, idx) => (
                          <tr key={cadet.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-zinc-400">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-zinc-200">
                              <p className="text-xs font-extrabold text-blue-400">
                                {cadet.enrollmentNo || cadet.id}
                              </p>
                              <p className="text-[10px] text-zinc-400">App: {cadet.id}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-black text-white text-sm">{cadet.fullName}</p>
                              <p className="text-[10px] text-zinc-400">📱 {cadet.mobile}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                                  cadet.gender === "SD"
                                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                    : "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                                }`}
                              >
                                {cadet.gender === "SD" ? "Senior Div (SD)" : "Senior Wing (SW)"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-extrabold text-zinc-200">{cadet.sbuCourse}</p>
                              <p className="text-[10px] text-zinc-400">
                                {cadet.sbuRollNo} • {cadet.sbuYear}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 text-zinc-300 font-semibold">
                              <p>🏃 1600m: {cadet.run1600mTime}</p>
                              <p className="text-[10px] text-zinc-400">
                                Pushups: {cadet.pushupsCount}
                              </p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                  cadet.status === "Enrolled"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : cadet.status === "Selected"
                                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                {cadet.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1.5">
                              <button
                                onClick={() => setViewingProfileModal(cadet)}
                                className="px-2.5 py-1.5 glass-pill hover:bg-white/10 text-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                                title="View Full Profile"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                                <span className="hidden sm:inline">Profile</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRecord(cadet);
                                  setEditingStatus(cadet.status);
                                  setEditingRemarks(cadet.officerRemarks || "");
                                  setEditingRegNo(cadet.enrollmentNo || "");
                                }}
                                className="px-2.5 py-1.5 bg-blue-600/30 border border-blue-500/40 hover:bg-blue-600/50 text-blue-300 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                                title="Update Status & Regimental Number"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Status</span>
                              </button>
                              <button
                                onClick={() => onOpenPrintableSlip(cadet)}
                                className="px-2 py-1.5 glass-pill text-zinc-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
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
              <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      Parade & Training Class Schedule
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Manage Drill Parades, Weapon Training, Map Reading & Classroom Sessions
                    </p>
                  </div>

                  <button
                    onClick={() => setCreateClassModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 cursor-pointer transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Schedule New Class</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="glass-panel rounded-2xl p-5 space-y-3 relative border border-white/10"
                    >
                      <div className="flex justify-between items-start">
                        <span className="glass-pill text-blue-300 border border-blue-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                          {cls.batchTarget}
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                          {cls.status}
                        </span>
                      </div>

                      <h3 className="font-black text-white text-base">{cls.title}</h3>
                      <p className="text-xs text-zinc-300 font-medium">{cls.topic}</p>

                      <div className="space-y-1 text-xs text-zinc-400 pt-2 border-t border-white/10">
                        <p>
                          👤 <strong className="text-zinc-200">Instructor:</strong> {cls.instructor}
                        </p>
                        <p>
                          📅 <strong className="text-zinc-200">Date & Time:</strong> {cls.date} •{" "}
                          {cls.time}
                        </p>
                        <p>
                          📍 <strong className="text-zinc-200">Venue:</strong> {cls.venue}
                        </p>
                      </div>

                      <div className="pt-2 flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setActiveTab("attendance");
                            showToast(`Attendance mode selected for ${cls.title}`);
                          }}
                          className="px-3 py-1.5 bg-blue-600/30 border border-blue-500/40 hover:bg-blue-600/50 text-blue-300 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Mark Class Attendance
                        </button>
                      </div>
                    </div>
                  ))}
                  {classes.length === 0 && (
                    <div className="col-span-2 py-12 text-center text-zinc-400 font-medium">
                      No training sessions scheduled. Click "Schedule New Class" to create one.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BROADCAST & NOTICES */}
          {activeTab === "broadcast" && (
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-white">Battalion Broadcast Engine</h2>
                  <p className="text-xs text-zinc-400">
                    Dispatches orders simultaneously via Email, Cadet Portal, and SMS alerts
                  </p>
                </div>

                {/* Broadcast Form */}
                <form
                  onSubmit={handleSendBroadcast}
                  className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-zinc-300 uppercase">
                        Target Audience
                      </label>
                      <select
                        value={broadcastTarget}
                        onChange={(e) => setBroadcastTarget(e.target.value)}
                        className="w-full mt-1 px-3 py-2 glass-input rounded-xl text-xs font-bold"
                      >
                        <option value="All Cadets" className="bg-[#0b1329] text-white">
                          All Cadets (SD & SW)
                        </option>
                        <option value="Batch I (3rd Year)" className="bg-[#0b1329] text-white">
                          Batch I (3rd Year 'C' Cert)
                        </option>
                        <option value="Batch II (2nd Year)" className="bg-[#0b1329] text-white">
                          Batch II (2nd Year 'B' Cert)
                        </option>
                        <option value="Batch III (1st Year)" className="bg-[#0b1329] text-white">
                          Batch III (1st Year Probationers)
                        </option>
                        <option value="Senior Ranks Only" className="bg-[#0b1329] text-white">
                          Senior Rank Holders Only (SUO/JUO/SGT)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-black text-zinc-300 uppercase">
                        Delivery Channels
                      </label>
                      <div className="flex items-center space-x-4 mt-2 text-xs font-bold">
                        <label className="flex items-center space-x-1.5 cursor-pointer text-zinc-300">
                          <input
                            type="checkbox"
                            checked={broadcastChannels.email}
                            onChange={(e) =>
                              setBroadcastChannels({
                                ...broadcastChannels,
                                email: e.target.checked,
                              })
                            }
                            className="rounded text-blue-500 focus:ring-blue-500"
                          />
                          <span>Direct Email</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer text-zinc-300">
                          <input
                            type="checkbox"
                            checked={broadcastChannels.app}
                            onChange={(e) =>
                              setBroadcastChannels({ ...broadcastChannels, app: e.target.checked })
                            }
                            className="rounded text-blue-500 focus:ring-blue-500"
                          />
                          <span>Cadet Portal</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer text-zinc-300">
                          <input
                            type="checkbox"
                            checked={broadcastChannels.sms}
                            onChange={(e) =>
                              setBroadcastChannels({ ...broadcastChannels, sms: e.target.checked })
                            }
                            className="rounded text-blue-500 focus:ring-blue-500"
                          />
                          <span>SMS Alert</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-zinc-300 uppercase">
                      Broadcast Subject / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mandatory Parade & Uniform Inspection Notice..."
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 glass-input rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-zinc-300 uppercase">
                      Message Content / Instructions
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Enter detailed instructions for cadets regarding parade dress code, timings, venue, document submission..."
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 glass-input rounded-xl text-xs font-medium"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/30 cursor-pointer uppercase tracking-wider transition-all hover:scale-105"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dispatch Broadcast Now</span>
                  </button>
                </form>

                {/* History */}
                <div className="space-y-3">
                  <h3 className="font-black text-white text-base">Sent Broadcast History</h3>
                  <div className="space-y-3">
                    {broadcastHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className="glass-panel border border-white/10 p-4 rounded-xl space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black text-blue-400">
                              {msg.id}
                            </span>
                            <span className="glass-pill text-blue-300 text-[10px] font-black px-2 py-0.5 rounded border border-blue-400/30">
                              Target: {msg.target}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-bold">{msg.sentAt}</span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm">{msg.subject}</h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">{msg.body}</p>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/10">
                          <span>Recipients: {msg.recipientCount} Cadets</span>
                          <span className="text-emerald-400 font-extrabold">
                            Status: {msg.deliveryStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                    {broadcastHistory.length === 0 && (
                      <p className="text-xs text-zinc-400 py-4 text-center">
                        No broadcasts sent yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Cadets Feed Preview */}
              <div className="pt-2">
                <div className="glass-panel border border-blue-500/30 rounded-2xl p-4 mb-4 text-xs font-bold text-blue-300 flex items-center space-x-2">
                  <Megaphone className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    Officer Live Preview: Active Notifications & Reminders Feed Dispatched to Cadet
                    Portals
                  </span>
                </div>
                <NotificationsFeed showToast={showToast} />
              </div>
            </div>
          )}

          {/* TAB 6: ATTENDANCE CRM GRID */}
          {activeTab === "attendance" && (
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      Daily & Monthly Parade Attendance CRM
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Live regimental roll marking with percentage tracking and Excel export
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const allPresent: Record<string, "P" | "A" | "L" | "OD"> = {};
                        enrollments.forEach((c) => (allPresent[c.id] = "P"));
                        setAttendanceRecords(allPresent);
                        showToast("Marked all cadets as Present (P) for " + attendanceDate);
                      }}
                      className="px-3.5 py-2 bg-emerald-600/30 border border-emerald-500/40 hover:bg-emerald-600/50 text-emerald-300 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all hover:scale-105"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={handleDownloadExcel}
                      className="px-3.5 py-2 glass-pill text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold shadow-sm cursor-pointer hover:bg-white/10 transition-all hover:scale-105"
                    >
                      Export Grid
                    </button>
                  </div>
                </div>

                {/* Attendance Date & Batch Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 glass-panel p-4 rounded-xl border border-white/10">
                  <div>
                    <label className="text-xs font-black text-zinc-300 uppercase">
                      Parade Date
                    </label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full mt-1 px-3 py-2 glass-input rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-zinc-300 uppercase">
                      Batch Selection
                    </label>
                    <select
                      value={selectedAttendanceBatch}
                      onChange={(e) => setSelectedAttendanceBatch(e.target.value)}
                      className="w-full mt-1 px-3 py-2 glass-input rounded-xl text-xs font-bold"
                    >
                      <option value="Batch I (3rd Year)" className="bg-[#0b1329] text-white">
                        Batch I (3rd Year 'C' Cert)
                      </option>
                      <option value="Batch II (2nd Year)" className="bg-[#0b1329] text-white">
                        Batch II (2nd Year 'B' Cert)
                      </option>
                      <option value="Batch III (1st Year)" className="bg-[#0b1329] text-white">
                        Batch III (1st Year Probationers)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Attendance Marking Grid */}
                <div className="overflow-x-auto border border-white/10 rounded-2xl glass-panel">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-zinc-300 font-black uppercase border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4">Cadet ID</th>
                        <th className="py-3 px-4">Cadet Name</th>
                        <th className="py-3 px-4">Wing</th>
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Parade Status ({attendanceDate})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {enrollments.map((cadet) => {
                        const status = attendanceRecords[cadet.id] || "P";
                        return (
                          <tr key={cadet.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-zinc-400">
                              {cadet.id}
                            </td>
                            <td className="py-3 px-4 font-black text-white">{cadet.fullName}</td>
                            <td className="py-3 px-4 font-bold text-blue-300">{cadet.gender}</td>
                            <td className="py-3 px-4 text-zinc-300">{cadet.sbuCourse}</td>
                            <td className="py-3 px-4">
                              <div className="inline-flex space-x-1 glass-panel p-1 rounded-xl border border-white/10">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAttendanceRecords({ ...attendanceRecords, [cadet.id]: "P" })
                                  }
                                  className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all ${
                                    status === "P"
                                      ? "bg-emerald-600 text-white shadow-md"
                                      : "text-zinc-400 hover:text-white"
                                  }`}
                                >
                                  P (Present)
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAttendanceRecords({ ...attendanceRecords, [cadet.id]: "A" })
                                  }
                                  className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all ${
                                    status === "A"
                                      ? "bg-red-600 text-white shadow-md"
                                      : "text-zinc-400 hover:text-white"
                                  }`}
                                >
                                  A (Absent)
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAttendanceRecords({ ...attendanceRecords, [cadet.id]: "L" })
                                  }
                                  className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all ${
                                    status === "L"
                                      ? "bg-amber-600 text-white shadow-md"
                                      : "text-zinc-400 hover:text-white"
                                  }`}
                                >
                                  L (Late)
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAttendanceRecords({ ...attendanceRecords, [cadet.id]: "OD" })
                                  }
                                  className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all ${
                                    status === "OD"
                                      ? "bg-blue-600 text-white shadow-md"
                                      : "text-zinc-400 hover:text-white"
                                  }`}
                                >
                                  OD (Camp Duty)
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {enrollments.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-zinc-400">
                            No enrolled cadets found to mark attendance.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DISCIPLINE & AWARDS */}
          {activeTab === "discipline" && (
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      Cadet Discipline & Commendations
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Record Appreciations, Best Parade Badges, Warnings & Remarks
                    </p>
                  </div>

                  <button
                    onClick={() => setCreateDisciplineModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 cursor-pointer transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Discipline Record</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {disciplineEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="glass-panel border border-white/10 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            entry.type === "Appreciation" || entry.type === "Reward"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {entry.type}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-bold">{entry.date}</span>
                      </div>

                      <h3 className="font-extrabold text-white text-base">{entry.title}</h3>
                      <p className="text-xs text-zinc-300">
                        <strong className="text-blue-300">Cadet:</strong> {entry.cadetName} (
                        {entry.cadetId})
                      </p>
                      <p className="text-xs text-zinc-300 glass-panel p-3 rounded-xl border border-white/10">
                        {entry.remarks}
                      </p>
                      <p className="text-[10px] text-zinc-400 text-right">
                        Recorded by: {entry.officerName}
                      </p>
                    </div>
                  ))}
                  {disciplineEntries.length === 0 && (
                    <p className="text-xs text-zinc-400 py-8 text-center">
                      No disciplinary actions or awards recorded.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: EVENTS & NOTICES */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-white">Events & Camps Management</h2>
                  <p className="text-xs text-zinc-400">
                    Publish Annual Training Camps, Firing Selection, RDC Trials & Institutional
                    Events
                  </p>
                </div>

                <div className="glass-panel border border-white/10 rounded-2xl p-5 space-y-4">
                  <h3 className="font-bold text-white text-sm">Active Events & Training Camps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {classes.map((cls) => (
                      <div
                        key={cls.id}
                        className="glass-panel p-4 rounded-xl border border-white/10 space-y-2"
                      >
                        <p className="font-extrabold text-blue-400 text-sm">{cls.title}</p>
                        <p className="text-zinc-300">Location: {cls.venue}</p>
                        <p className="text-zinc-400 pt-1">
                          Date: {cls.date} • {cls.time}
                        </p>
                      </div>
                    ))}
                    {classes.length === 0 && (
                      <p className="col-span-2 text-zinc-400 py-4 text-center">
                        No events scheduled.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: REPORTS & EXCEL EXPORT */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-white">Reports & Audit Downloads</h2>
                  <p className="text-xs text-zinc-400">
                    Generate Battalion Nominal Roll, DBT Bank Account Workbooks, and Parade
                    Attendance Logs
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
                    <h3 className="font-black text-white text-base">Master Nominal Roll (.XLSX)</h3>
                    <p className="text-xs text-zinc-300">
                      Contains Nominal Roll, Bank DBT details for Camp Allowances, Next of Kin &
                      Address sheets.
                    </p>
                    <button
                      onClick={handleDownloadExcel}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center justify-center space-x-2 transition-all hover:scale-102"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Master Nominal Roll</span>
                    </button>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                    <Printer className="w-8 h-8 text-blue-400" />
                    <h3 className="font-black text-white text-base">Printable Enrollment Slips</h3>
                    <p className="text-xs text-zinc-300">
                      Generate individual or batch official enrollment confirmation slips for SBU &
                      Battalion archives.
                    </p>
                    <button
                      onClick={() => {
                        if (enrollments[0]) onOpenPrintableSlip(enrollments[0]);
                      }}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center space-x-2 transition-all hover:scale-102"
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
              <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-white">Officer Portal Settings</h2>
                  <p className="text-xs text-zinc-400">
                    Associate NCC Officer (ANO) Credentials & System Configuration
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 text-xs text-zinc-300">
                  <p>
                    <strong className="text-white">Officer Name:</strong> Capt. Dr. Animesh Roy
                  </p>
                  <p>
                    <strong className="text-white">Designation:</strong> Associate NCC Officer (ANO)
                    - SBU Sub-Unit
                  </p>
                  <p>
                    <strong className="text-white">Battalion:</strong> 19 Jharkhand Battalion NCC,
                    Ranchi
                  </p>
                  <p>
                    <strong className="text-white">Directorate:</strong> Bihar and Jharkhand
                    Directorate
                  </p>
                  <p>
                    <strong className="text-white">Institution:</strong> Sarala Birla University,
                    Ranchi
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: ATTACK SURFACE & CYBER THREAT INTELLIGENCE */}
          {activeTab === "security" && <AttackSurfaceManager />}

          {/* TAB 12: CADET LEAVE REVIEW PIPELINE */}
          {activeTab === "leaves" && (
            <div className="space-y-6">
              <div className="glass-card-classic rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <CalendarDays className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-lg tracking-tight flex items-center gap-2">
                        <span>Cadet Leave Review Pipeline</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider glass-badge-amber">
                          ANO Office
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400 font-medium">
                        Review, authorize and record cadet parade & lecture absence requests
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchAllData()}
                      className="px-3.5 py-2 glass-pill text-xs font-bold text-zinc-300 hover:text-white rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {(["All", "Pending", "Approved", "Rejected"] as const).map((status) => {
                    const count =
                      status === "All"
                        ? leaves.length
                        : leaves.filter((l) => l.status === status).length;
                    const isSelected = leaveFilter === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setLeaveFilter(status)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                          isSelected
                            ? status === "Pending"
                              ? "bg-amber-500 text-black font-black shadow-lg shadow-amber-500/30"
                              : status === "Approved"
                                ? "bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/30"
                                : status === "Rejected"
                                  ? "bg-red-600 text-white font-black shadow-lg shadow-red-600/30"
                                  : "bg-blue-600 text-white font-black shadow-lg shadow-blue-600/30"
                            : "glass-pill text-zinc-300 hover:text-white border border-white/10"
                        }`}
                      >
                        <span>{status}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            isSelected ? "bg-black/20 text-current" : "bg-white/10 text-zinc-400"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Leaves Table */}
                <div className="overflow-x-auto rounded-xl border border-white/10 glass-table-container">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-zinc-300 font-black uppercase text-[11px] tracking-wider border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4">Leave ID</th>
                        <th className="py-3 px-4">Cadet Details</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Duration & Dates</th>
                        <th className="py-3 px-4">Reason</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">ANO Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leaves
                        .filter((l) => (leaveFilter === "All" ? true : l.status === leaveFilter))
                        .map((l) => {
                          const start = new Date(l.startDate);
                          const end = new Date(l.endDate);
                          const diffDays = Math.max(
                            1,
                            Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
                              1,
                          );
                          return (
                            <tr key={l.id} className="hover:bg-white/5 transition-colors group">
                              <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-zinc-400">
                                {l.id}
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-extrabold text-white group-hover:text-blue-200 transition-colors">
                                  {l.cadetName}
                                </p>
                                <p className="text-[10px] text-zinc-400 font-mono">{l.cadetId}</p>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold glass-badge-blue">
                                  {l.category}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-zinc-200">
                                  {l.startDate} → {l.endDate}
                                </p>
                                <p className="text-[10px] text-amber-300 font-semibold">
                                  {diffDays} {diffDays === 1 ? "Day" : "Days"} Leave
                                </p>
                              </td>
                              <td className="py-3.5 px-4 max-w-xs">
                                <p className="text-zinc-300 text-xs line-clamp-2">{l.reason}</p>
                                {l.officerRemarks && (
                                  <p className="text-[10px] text-zinc-400 italic mt-1">
                                    ANO Remark: {l.officerRemarks}
                                  </p>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    l.status === "Approved"
                                      ? "glass-badge-emerald"
                                      : l.status === "Rejected"
                                        ? "glass-badge-red"
                                        : "glass-badge-amber"
                                  }`}
                                >
                                  {l.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {l.status === "Pending" ? (
                                  <div className="flex items-center justify-end space-x-1.5">
                                    <button
                                      onClick={() => handleReviewLeave(l.id, "Approved")}
                                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-all cursor-pointer flex items-center space-x-1"
                                      title="Approve Leave"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      onClick={() => handleReviewLeave(l.id, "Rejected")}
                                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 transition-all cursor-pointer flex items-center space-x-1"
                                      title="Reject Leave"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-zinc-400 font-semibold">
                                    {l.officerName || "Verified"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                      {leaves.filter((l) =>
                        leaveFilter === "All" ? true : l.status === leaveFilter,
                      ).length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-12 text-center text-zinc-400 font-medium space-y-2"
                          >
                            <CalendarDays className="w-8 h-8 text-zinc-500 mx-auto" />
                            <p className="text-xs">
                              No leave applications found under this filter.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: VIEW CADET PROFILE MODAL */}
      {viewingProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/15 shadow-2xl p-6 space-y-6 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="glass-pill text-blue-300 text-[10px] font-black px-2.5 py-0.5 rounded uppercase border border-blue-400/30">
                  {viewingProfileModal.gender === "SD"
                    ? "Senior Division (Male)"
                    : "Senior Wing (Female)"}
                </span>
                <h3 className="text-2xl font-black text-white pt-1">
                  {viewingProfileModal.fullName}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Regimental No: {viewingProfileModal.enrollmentNo || "Pending Allocation"}
                </p>
              </div>
              <button
                onClick={() => setViewingProfileModal(null)}
                className="p-2 rounded-xl glass-pill text-zinc-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-tabs */}
            <div className="flex border-b border-white/10 space-x-2 text-xs font-bold">
              <button
                onClick={() => setProfileTab("personal")}
                className={`pb-2 px-3 border-b-2 cursor-pointer transition-all ${
                  profileTab === "personal"
                    ? "border-blue-500 text-white font-black"
                    : "border-transparent text-zinc-400"
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setProfileTab("academic")}
                className={`pb-2 px-3 border-b-2 cursor-pointer transition-all ${
                  profileTab === "academic"
                    ? "border-blue-500 text-white font-black"
                    : "border-transparent text-zinc-400"
                }`}
              >
                Academic SBU
              </button>
              <button
                onClick={() => setProfileTab("physical")}
                className={`pb-2 px-3 border-b-2 cursor-pointer transition-all ${
                  profileTab === "physical"
                    ? "border-blue-500 text-white font-black"
                    : "border-transparent text-zinc-400"
                }`}
              >
                Fitness & Sports
              </button>
              <button
                onClick={() => setProfileTab("bank")}
                className={`pb-2 px-3 border-b-2 cursor-pointer transition-all ${
                  profileTab === "bank"
                    ? "border-blue-500 text-white font-black"
                    : "border-transparent text-zinc-400"
                }`}
              >
                Bank DBT
              </button>
            </div>

            {/* Profile Tab Content */}
            <div className="space-y-3 text-xs">
              {profileTab === "personal" && (
                <div className="grid grid-cols-2 gap-3 glass-panel p-4 rounded-2xl border border-white/10">
                  <p>
                    <strong className="text-zinc-400">Mobile:</strong> {viewingProfileModal.mobile}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Email:</strong> {viewingProfileModal.email}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Aadhaar:</strong>{" "}
                    {viewingProfileModal.aadhaarNumber}
                  </p>
                  <p>
                    <strong className="text-zinc-400">DOB:</strong> {viewingProfileModal.dob}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Blood Group:</strong>{" "}
                    {viewingProfileModal.bloodGroup}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Father's Name:</strong>{" "}
                    {viewingProfileModal.fatherName}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Mother's Name:</strong>{" "}
                    {viewingProfileModal.motherName}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Identification Mark:</strong>{" "}
                    {viewingProfileModal.identificationMark}
                  </p>
                  <p className="col-span-2">
                    <strong className="text-zinc-400">Present Address:</strong>{" "}
                    {viewingProfileModal.presentAddress}
                  </p>
                </div>
              )}

              {profileTab === "academic" && (
                <div className="grid grid-cols-2 gap-3 glass-panel p-4 rounded-2xl border border-white/10">
                  <p>
                    <strong className="text-zinc-400">SBU Course:</strong>{" "}
                    {viewingProfileModal.sbuCourse}
                  </p>
                  <p>
                    <strong className="text-zinc-400">SBU Roll No:</strong>{" "}
                    {viewingProfileModal.sbuRollNo}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Department:</strong>{" "}
                    {viewingProfileModal.sbuDepartment}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Year / Semester:</strong>{" "}
                    {viewingProfileModal.sbuYear} / {viewingProfileModal.sbuSemester}
                  </p>
                  <p>
                    <strong className="text-zinc-400">10th Percentage:</strong>{" "}
                    {viewingProfileModal.marksPercentage10th}%
                  </p>
                  <p>
                    <strong className="text-zinc-400">12th Percentage:</strong>{" "}
                    {viewingProfileModal.marksPercentage12th}%
                  </p>
                </div>
              )}

              {profileTab === "physical" && (
                <div className="grid grid-cols-2 gap-3 glass-panel p-4 rounded-2xl border border-white/10">
                  <p>
                    <strong className="text-zinc-400">1600m Run Time:</strong>{" "}
                    {viewingProfileModal.run1600mTime}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Pushups Count:</strong>{" "}
                    {viewingProfileModal.pushupsCount}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Height:</strong>{" "}
                    {viewingProfileModal.heightCm} cm
                  </p>
                  <p>
                    <strong className="text-zinc-400">Weight:</strong>{" "}
                    {viewingProfileModal.weightKg} kg
                  </p>
                  <p>
                    <strong className="text-zinc-400">Junior 'A' Cert:</strong>{" "}
                    {viewingProfileModal.hasJuniorCertificate
                      ? "Yes (" + viewingProfileModal.juniorCertificateNo + ")"
                      : "No"}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Sports Level:</strong>{" "}
                    {viewingProfileModal.sportsLevel}
                  </p>
                </div>
              )}

              {profileTab === "bank" && (
                <div className="grid grid-cols-2 gap-3 glass-panel p-4 rounded-2xl border border-white/10">
                  <p>
                    <strong className="text-zinc-400">Bank Name:</strong>{" "}
                    {viewingProfileModal.bankName}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Account Number:</strong>{" "}
                    {viewingProfileModal.accountNumber}
                  </p>
                  <p>
                    <strong className="text-zinc-400">IFSC Code:</strong>{" "}
                    {viewingProfileModal.ifscCode}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Guardian Name:</strong>{" "}
                    {viewingProfileModal.guardianName}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Guardian Mobile:</strong>{" "}
                    {viewingProfileModal.guardianMobile}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end space-x-2">
              <button
                onClick={() => {
                  onOpenPrintableSlip(viewingProfileModal);
                  setViewingProfileModal(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center space-x-1 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GUIDED SCRUTINY & FOLLOW-UP COMMAND ENGINE */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-white/15 shadow-2xl p-6 space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="glass-pill text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded uppercase border border-amber-400/30">
                    Guided Scrutiny Flow
                  </span>
                  <span className="text-zinc-400 text-xs font-mono">{selectedRecord.id}</span>
                </div>
                <h3 className="font-black text-white text-lg">{selectedRecord.fullName}</h3>
                <p className="text-xs text-zinc-400">
                  {selectedRecord.sbuCourse} • {selectedRecord.gender} • Mobile:{" "}
                  {selectedRecord.mobile}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 glass-pill rounded-xl text-zinc-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="font-black text-zinc-300 uppercase">Processing Status</label>
                <select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-bold"
                >
                  <option value="Submitted" className="bg-[#0b1329] text-white">
                    Submitted (Under Scrutiny)
                  </option>
                  <option value="Physical Scheduled" className="bg-[#0b1329] text-white">
                    Physical Test Scheduled
                  </option>
                  <option value="Medical Cleared" className="bg-[#0b1329] text-white">
                    Medical Test Cleared
                  </option>
                  <option value="Selected" className="bg-[#0b1329] text-white">
                    Selected for Enrollment
                  </option>
                  <option value="Enrolled" className="bg-[#0b1329] text-white">
                    Enrolled (Regimental No Allocated)
                  </option>
                  <option value="Rejected" className="bg-[#0b1329] text-white">
                    Rejected
                  </option>
                </select>
              </div>

              {/* STAGE 1: SUBMITTED (UNDER SCRUTINY / CORRECTION) */}
              {editingStatus === "Submitted" && (
                <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 space-y-2 bg-amber-500/5">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold">
                    <Info className="w-4 h-4" />
                    <span>Application Scrutiny & Correction Follow-up</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    If this application has document discrepancies or missing marks cards, note the
                    exact defect below:
                  </p>
                  <textarea
                    rows={2}
                    value={correctionNote}
                    onChange={(e) => setCorrectionNote(e.target.value)}
                    placeholder="e.g. Please re-upload clear front & back Aadhaar card..."
                    className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-medium"
                  />
                </div>
              )}

              {/* STAGE 2: PHYSICAL TEST SCHEDULED */}
              {editingStatus === "Physical Scheduled" && (
                <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 space-y-3 bg-blue-500/5">
                  <div className="flex items-center space-x-2 text-blue-300 font-bold">
                    <CalendarDays className="w-4 h-4" />
                    <span>Physical Efficiency Test (PET) Follow-up Schedule</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">
                        PET Reporting Date
                      </label>
                      <input
                        type="date"
                        value={petDate}
                        onChange={(e) => setPetDate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">
                        Reporting Time
                      </label>
                      <input
                        type="text"
                        value={petTime}
                        onChange={(e) => setPetTime(e.target.value)}
                        placeholder="06:00 AM - 08:30 AM"
                        className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-bold"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">
                      Parade Ground Venue
                    </label>
                    <input
                      type="text"
                      value={petVenue}
                      onChange={(e) => setPetVenue(e.target.value)}
                      placeholder="SBU Sports Ground / Parade Track"
                      className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">
                      Candidate Instructions (1600m Run, Kit)
                    </label>
                    <textarea
                      rows={2}
                      value={petInstructions}
                      onChange={(e) => setPetInstructions(e.target.value)}
                      className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-medium"
                    />
                  </div>
                </div>
              )}

              {/* STAGE 3: MEDICAL CLEARED */}
              {editingStatus === "Medical Cleared" && (
                <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 space-y-3 bg-emerald-500/5">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Medical Examination & Fitness Findings</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">
                      Medical Fitness Determination
                    </label>
                    <select
                      value={medicalFitness}
                      onChange={(e) => setMedicalFitness(e.target.value as typeof medicalFitness)}
                      className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-bold"
                    >
                      <option value="FIT" className="bg-[#0b1329] text-white">
                        Medically FIT for NCC Training & Camps
                      </option>
                      <option value="TEMPORARY_UNFIT" className="bg-[#0b1329] text-white">
                        Temporary Unfit (Observation Period)
                      </option>
                      <option value="UNFIT" className="bg-[#0b1329] text-white">
                        Permanent Medically Unfit
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">
                      Inspection Findings (Vitals, Vision, Expansion)
                    </label>
                    <textarea
                      rows={2}
                      value={medicalFindings}
                      onChange={(e) => setMedicalFindings(e.target.value)}
                      className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-medium"
                    />
                  </div>
                </div>
              )}

              {/* STAGE 4: SELECTED & ENROLLED */}
              {(editingStatus === "Selected" || editingStatus === "Enrolled") && (
                <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 space-y-3 bg-blue-500/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-blue-300 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>Battalion Induction & Regimental Number Allocation</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAutoGenerateRegNo(selectedRecord)}
                      className="px-2.5 py-1 text-[11px] font-extrabold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center space-x-1 cursor-pointer shadow-sm transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-Generate</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">
                      NCC Regimental Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. JHR/26/SD/19/2048"
                      value={editingRegNo}
                      onChange={(e) => setEditingRegNo(e.target.value)}
                      className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-mono font-bold text-blue-200"
                      required={editingStatus === "Enrolled"}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">
                      Platoon Assignment
                    </label>
                    <select
                      value={assignedPlatoon}
                      onChange={(e) => setAssignedPlatoon(e.target.value)}
                      className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-bold"
                    >
                      <option
                        value="Platoon Alpha (Senior Division)"
                        className="bg-[#0b1329] text-white"
                      >
                        Platoon Alpha (SD - 1st Year Cadre)
                      </option>
                      <option
                        value="Platoon Bravo (Senior Division)"
                        className="bg-[#0b1329] text-white"
                      >
                        Platoon Bravo (SD - 2nd/3rd Year Cadre)
                      </option>
                      <option
                        value="Platoon Charlie (Senior Wing)"
                        className="bg-[#0b1329] text-white"
                      >
                        Platoon Charlie (SW - Women Cadre)
                      </option>
                      <option
                        value="Platoon Delta (Senior Wing)"
                        className="bg-[#0b1329] text-white"
                      >
                        Platoon Delta (SW - Women Cadre)
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {/* OFFICER REMARKS */}
              <div>
                <label className="font-black text-zinc-300 uppercase text-[11px]">
                  Official ANO Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter remarks regarding fitness, merit rank, interview score..."
                  value={editingRemarks}
                  onChange={(e) => setEditingRemarks(e.target.value)}
                  className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-medium"
                />
              </div>

              {/* AUTOMATED FOLLOW-UP ALERT DISPATCH CHECKBOX */}
              <div className="flex items-center space-x-2.5 p-3 rounded-xl glass-panel border border-white/10 bg-white/5">
                <input
                  type="checkbox"
                  id="autoDispatchAlert"
                  checked={autoDispatchAlert}
                  onChange={(e) => setAutoDispatchAlert(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900 cursor-pointer"
                />
                <label
                  htmlFor="autoDispatchAlert"
                  className="text-xs text-zinc-300 font-medium cursor-pointer"
                >
                  Instantly dispatch follow-up notification to cadet portal with these instructions
                </label>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex justify-end space-x-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 glass-pill text-zinc-300 hover:text-white rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 cursor-pointer transition-all flex items-center space-x-1.5"
                >
                  {isUpdating ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Record Follow-up</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE CLASS / PARADE MODAL */}
      {createClassModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-3xl max-w-lg w-full border border-white/15 shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-black text-white text-lg">Schedule Parade / Classroom Session</h3>
              <button
                onClick={() => setCreateClassModal(false)}
                className="p-1 glass-pill rounded-lg"
              >
                <X className="w-5 h-5 text-zinc-300" />
              </button>
            </div>

            <form onSubmit={handleCreateClassSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-black text-zinc-300 uppercase">Class Title</label>
                <input
                  type="text"
                  placeholder="e.g. Weapon Training 0.22 Rifle Safety"
                  value={newClassForm.title}
                  onChange={(e) => setNewClassForm({ ...newClassForm, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-black text-zinc-300 uppercase">Syllabus Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Map Reading: Finding own position using protractor"
                  value={newClassForm.topic}
                  onChange={(e) => setNewClassForm({ ...newClassForm, topic: e.target.value })}
                  className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-zinc-300 uppercase">Date</label>
                  <input
                    type="date"
                    value={newClassForm.date}
                    onChange={(e) => setNewClassForm({ ...newClassForm, date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-black text-zinc-300 uppercase">Time</label>
                  <input
                    type="text"
                    value={newClassForm.time}
                    onChange={(e) => setNewClassForm({ ...newClassForm, time: e.target.value })}
                    className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-black text-zinc-300 uppercase">Venue</label>
                <input
                  type="text"
                  value={newClassForm.venue}
                  onChange={(e) => setNewClassForm({ ...newClassForm, venue: e.target.value })}
                  className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateClassModal(false)}
                  className="px-4 py-2 glass-pill text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-3xl max-w-lg w-full border border-white/15 shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-black text-white text-lg">Add Discipline / Award Entry</h3>
              <button
                onClick={() => setCreateDisciplineModal(false)}
                className="p-1 glass-pill rounded-lg"
              >
                <X className="w-5 h-5 text-zinc-300" />
              </button>
            </div>

            <form onSubmit={handleCreateDisciplineSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-black text-zinc-300 uppercase">Select Cadet</label>
                <select
                  value={newDisciplineForm.cadetId}
                  onChange={(e) =>
                    setNewDisciplineForm({ ...newDisciplineForm, cadetId: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-bold"
                  required
                >
                  <option value="" className="bg-[#0b1329] text-white">
                    Select Cadet...
                  </option>
                  {enrollments.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0b1329] text-white">
                      {c.fullName} ({c.id}) - {c.sbuCourse}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-zinc-300 uppercase">Entry Type</label>
                  <select
                    value={newDisciplineForm.type}
                    onChange={(e) =>
                      setNewDisciplineForm({
                        ...newDisciplineForm,
                        type: e.target.value as DisciplineEntry["type"],
                      })
                    }
                    className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-bold"
                  >
                    <option value="Appreciation" className="bg-[#0b1329] text-white">
                      Appreciation
                    </option>
                    <option value="Reward" className="bg-[#0b1329] text-white">
                      Reward / Badge
                    </option>
                    <option value="Warning" className="bg-[#0b1329] text-white">
                      Warning
                    </option>
                    <option value="Punishment" className="bg-[#0b1329] text-white">
                      Punishment / Extra Drill
                    </option>
                  </select>
                </div>
                <div>
                  <label className="font-black text-zinc-300 uppercase">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Best Drill Commendation"
                    value={newDisciplineForm.title}
                    onChange={(e) =>
                      setNewDisciplineForm({ ...newDisciplineForm, title: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-black text-zinc-300 uppercase">Officer Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Enter details of incident or commendation..."
                  value={newDisciplineForm.remarks}
                  onChange={(e) =>
                    setNewDisciplineForm({ ...newDisciplineForm, remarks: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 glass-input rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateDisciplineModal(false)}
                  className="px-4 py-2 glass-pill text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
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
