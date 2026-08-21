import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRealtimeData } from "@frontend/hooks/useRealtimeData";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";
import {
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Flame,
  Megaphone,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  Check,
  ChevronRight,
  BookOpen,
  Calendar,
  AlertTriangle,
  Award,
  Zap,
  ArrowRight,
} from "lucide-react";

export type NotificationCategory =
  "Training Update" | "Assignment Reminder" | "Parade Order" | "Camp Notice" | "System Alert";

export type NotificationPriority = "High" | "Urgent" | "Normal";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  priority: NotificationPriority;
  category: NotificationCategory;
  actionLabel?: string;
  actionType?: "quiz" | "schedule" | "upload" | "syllabus" | "general";
  dueDate?: string;
  instructor?: string;
}

interface NotificationsFeedProps {
  initialNotifications?: NotificationItem[];
  onActionClick?: (actionType: string, notification: NotificationItem) => void;
  onUnreadCountChange?: (unreadCount: number) => void;
  showToast?: (message: string) => void;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "N1",
    title: "Upcoming Drill Practice: 0.22 Rifle Stripping & Assembly",
    body: "Subedar Major B.S. Gurung will conduct hands-on weapon handling and safety precautions at SBU Parade Ground tomorrow at 06:00 AM. Attendance mandatory for B & C cert cadets.",
    date: "Today, 08:30 AM",
    read: false,
    priority: "Urgent",
    category: "Training Update",
    actionLabel: "View Drill Schedule",
    actionType: "schedule",
    instructor: "Subedar Major B.S. Gurung",
  },
  {
    id: "N2",
    title: "Assignment Due: Weapon Training & Rifle Safety Quiz",
    body: "Complete the online 0.22 Deluxe Rifle safety & grouping shot practice test before tomorrow's drill. 15 questions covering stripping sequence and effective firing range.",
    date: "Today, 07:15 AM",
    read: false,
    priority: "High",
    category: "Assignment Reminder",
    actionLabel: "Open Practice Quiz",
    actionType: "quiz",
    dueDate: "Due in 18 Hours",
  },
  {
    id: "N3",
    title: "Assignment Due: Map Reading & Grid Reference Exercise",
    body: "Submit your handwritten calculations for finding 6-figure grid references and magnetic declination. Hand in to CQMS before Friday parade.",
    date: "Yesterday, 04:45 PM",
    read: false,
    priority: "Normal",
    category: "Assignment Reminder",
    actionLabel: "View Map Manual",
    actionType: "syllabus",
    dueDate: "Due Friday, 10:00 AM",
    instructor: "Capt. Dr. Animesh Roy (ANO)",
  },
  {
    id: "N4",
    title: "Independence Day Parade Uniform & Turnout Inspection",
    body: "Working Dress No. 2 with polished DMS boots, pressed ankle webbing, blancoed belt, and hackle required for inspection by Commanding Officer 19 JHR BN.",
    date: "2026-08-01 17:30",
    read: true,
    priority: "High",
    category: "Parade Order",
    actionLabel: "Turnout Checklist",
    actionType: "general",
  },
  {
    id: "N5",
    title: "Training Update: Physical Efficiency Test (1600m Run) Trials",
    body: "Special conditioning trial for 1.6 KM run and obstacle course selection for Republic Day Parade (RDC) camp shortlisting.",
    date: "2026-07-30 09:00",
    read: true,
    priority: "Normal",
    category: "Training Update",
    actionLabel: "Check PET Criteria",
    actionType: "general",
    instructor: "PI Staff 19 JHR BN",
  },
  {
    id: "N6",
    title: "Annual Training Camp (ATC-III Ranchi) Document Submission",
    body: "All selected SD and SW cadets must upload or submit hard copies of Parent Consent & Medical Unfitness certificates to the ANO office.",
    date: "2026-07-28 11:00",
    read: true,
    priority: "Urgent",
    category: "Camp Notice",
    actionLabel: "Submit Medical Form",
    actionType: "upload",
    dueDate: "Deadline: Aug 10",
  },
];

export const NotificationsFeed: React.FC<NotificationsFeedProps> = ({
  initialNotifications = DEFAULT_NOTIFICATIONS,
  onActionClick,
  onUnreadCountChange,
  showToast,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [selectedTab, setSelectedTab] = useState<"all" | "training" | "assignment" | "notices">(
    "all",
  );
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Handle incoming real-time broadcast via WebSocket
  const handleRealtimeNotice = useCallback(
    (newNotice: Record<string, unknown>) => {
      const categoryStr = (newNotice.category as string) || "Parade Order";
      const validCategory: NotificationCategory = [
        "Training Update",
        "Assignment Reminder",
        "Parade Order",
        "Camp Notice",
        "System Alert",
      ].includes(categoryStr)
        ? (categoryStr as NotificationCategory)
        : "Parade Order";

      const formattedNotice: NotificationItem = {
        id: (newNotice.id as string) || `N_${Date.now()}`,
        title: (newNotice.title as string) || "Unit Broadcast",
        body: (newNotice.body as string) || "",
        date: (newNotice.date as string) || "Just now",
        read: false,
        priority:
          newNotice.priority === "CRITICAL"
            ? "Urgent"
            : newNotice.priority === "HIGH"
              ? "High"
              : "Normal",
        category: validCategory,
        actionLabel: (newNotice.actionLabel as string) || "View Details",
        actionType: (newNotice.actionType as NotificationItem["actionType"]) || "general",
      };

      setNotifications((prev) => [formattedNotice, ...prev]);
      if (showToast) {
        showToast(`📢 REAL-TIME BROADCAST: ${formattedNotice.title}`);
      }
    },
    [showToast],
  );

  const { isConnected, latencyMs } = useRealtimeData({
    channels: ["cadre:notifications"],
    onNotificationBroadcast: handleRealtimeNotice,
  });

  // Fetch initial notifications from Enterprise Data Platform Engine
  useEffect(() => {
    EnterpriseDataPlatform.getNotifications()
      .then((res) => {
        if (res.success && res.data?.notifications?.length) {
          const apiItems: NotificationItem[] = res.data.notifications.map(
            (n: Record<string, unknown>) => {
              const catStr = (n.category as string) || "Parade Order";
              const cat: NotificationCategory = [
                "Training Update",
                "Assignment Reminder",
                "Parade Order",
                "Camp Notice",
                "System Alert",
              ].includes(catStr)
                ? (catStr as NotificationCategory)
                : "Parade Order";

              return {
                id: (n.id as string) || `N_${Date.now()}`,
                title: (n.title as string) || "Notification",
                body: (n.body as string) || "",
                date: (n.date as string) || "",
                read: Boolean(n.read),
                priority:
                  n.priority === "CRITICAL" ? "Urgent" : n.priority === "HIGH" ? "High" : "Normal",
                category: cat,
                actionLabel: (n.actionLabel as string) || "View Details",
                actionType: (n.actionType as NotificationItem["actionType"]) || "general",
              };
            },
          );
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const fresh = apiItems.filter((a) => !existingIds.has(a.id));
            return [...fresh, ...prev];
          });
        }
      })
      .catch((e) => console.warn("Failed to load platform notifications:", e));
  }, []);

  // Real-time unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Unread counts per category for badges
  const trainingUnreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read && n.category === "Training Update").length;
  }, [notifications]);

  const assignmentUnreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read && n.category === "Assignment Reminder").length;
  }, [notifications]);

  const noticesUnreadCount = useMemo(() => {
    return notifications.filter(
      (n) =>
        !n.read &&
        (n.category === "Parade Order" ||
          n.category === "Camp Notice" ||
          n.category === "System Alert"),
    ).length;
  }, [notifications]);

  // Notify parent of unread count updates
  React.useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Category tab
      if (selectedTab === "training" && item.category !== "Training Update") return false;
      if (selectedTab === "assignment" && item.category !== "Assignment Reminder") return false;
      if (
        selectedTab === "notices" &&
        item.category !== "Parade Order" &&
        item.category !== "Camp Notice" &&
        item.category !== "System Alert"
      )
        return false;

      // Unread filter
      if (unreadOnly && item.read) return false;

      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesBody = item.body.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesInstructor = item.instructor?.toLowerCase().includes(query);
        return matchesTitle || matchesBody || matchesCat || matchesInstructor;
      }

      return true;
    });
  }, [notifications, selectedTab, unreadOnly, searchQuery]);

  // Mark single read/unread
  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updatedState = !n.read;
          if (showToast) {
            showToast(updatedState ? "Notification marked as read" : "Marked as unread");
          }
          return { ...n, read: updatedState };
        }
        return n;
      }),
    );
  };

  // Mark all read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (showToast) showToast("All notifications marked as read");
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (showToast) showToast("Notification removed");
  };

  // Add simulated real-time update
  const addSimulatedNotification = () => {
    const isTraining = Math.random() > 0.5;
    const newId = `N-${Date.now()}`;
    const newNotice: NotificationItem = isTraining
      ? {
          id: newId,
          title: "Real-time Training Update: Emergency Drill Callout",
          body: "Special Section Formations & Ceremonial Salute practice scheduled for 05:30 PM today at SBU Quadrangle.",
          date: "Just now",
          read: false,
          priority: "Urgent",
          category: "Training Update",
          actionLabel: "View Drill Schedule",
          actionType: "schedule",
          instructor: "Subedar Major B.S. Gurung",
        }
      : {
          id: newId,
          title: "Assignment Reminder: Fieldcraft & Section Battle Drills Test",
          body: "A short 10-question evaluation on camouflage, concealment, and section signals has been assigned by ANO.",
          date: "Just now",
          read: false,
          priority: "High",
          category: "Assignment Reminder",
          actionLabel: "Open Assignment",
          actionType: "quiz",
          dueDate: "Due Today",
        };

    setNotifications((prev) => [newNotice, ...prev]);
    if (showToast) showToast(`New ${newNotice.category} broadcast received!`);
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "Training Update":
        return <Zap className="w-4 h-4 text-blue-700" />;
      case "Assignment Reminder":
        return <BookOpen className="w-4 h-4 text-violet-600" />;
      case "Parade Order":
        return <Megaphone className="w-4 h-4 text-red-600" />;
      case "Camp Notice":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-600" />;
    }
  };

  const getCategoryBadgeStyle = (category: NotificationCategory) => {
    switch (category) {
      case "Training Update":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "Assignment Reminder":
        return "bg-violet-100 text-violet-950 border-violet-300";
      case "Parade Order":
        return "bg-red-100 text-red-900 border-red-300";
      case "Camp Notice":
        return "bg-blue-100 text-zinc-900 border-blue-300";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-300";
    }
  };

  const getPriorityBadgeStyle = (priority: NotificationPriority) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-600 text-white font-black animate-pulse";
      case "High":
        return "bg-blue-600 text-zinc-950 font-bold";
      default:
        return "bg-zinc-200 text-zinc-700 font-semibold";
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Header & Summary Card */}
      <div className="bg-gradient-to-r from-[#18181B] via-[#18181B] to-[#09090B] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-600/30 relative overflow-hidden">
        {/* Accent background elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-blue-500/15 border border-blue-500/40 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Megaphone className="w-3.5 h-3.5 text-blue-500" />
              <span>19 JHR BN Official Cadre Feed</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <span>Cadet Notifications & Reminders</span>

              {/* Real-time Unread Badge */}
              {unreadCount > 0 ? (
                <span className="relative inline-flex items-center">
                  <span className="bg-gradient-to-r from-red-500 to-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border border-white/20 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>{unreadCount} UNREAD</span>
                  </span>
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                  ALL READ
                </span>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl font-medium">
              Live updates for battalion parade drills, weapon practice schedules, assignment due
              dates, and official ANO office announcements.
            </p>
          </div>

          {/* Header Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={addSimulatedNotification}
              className="bg-blue-500 hover:bg-blue-300 text-zinc-950 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-2 shadow-lg cursor-pointer transition-all border border-blue-300"
            >
              <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />
              <span>Simulate Live Update</span>
            </motion.button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Breakdown Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-300 font-bold">Training Updates</p>
                <p className="text-xs text-zinc-400">Drill & Parade</p>
              </div>
            </div>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-full ${trainingUnreadCount > 0 ? "bg-blue-500 text-zinc-950" : "bg-white/10 text-zinc-300"}`}
            >
              {trainingUnreadCount} New
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-400/20 text-violet-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-300 font-bold">Assignment Reminders</p>
                <p className="text-xs text-zinc-400">Quizzes & Submissions</p>
              </div>
            </div>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-full ${assignmentUnreadCount > 0 ? "bg-violet-400 text-zinc-950" : "bg-white/10 text-zinc-300"}`}
            >
              {assignmentUnreadCount} Due
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-400/20 text-red-300 flex items-center justify-center shrink-0">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-300 font-bold">Officer Notices</p>
                <p className="text-xs text-zinc-400">Parade & Camp Orders</p>
              </div>
            </div>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-full ${noticesUnreadCount > 0 ? "bg-red-500 text-white" : "bg-white/10 text-zinc-300"}`}
            >
              {noticesUnreadCount} Active
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls Toolbar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
                selectedTab === "all"
                  ? "bg-[#18181B] text-white shadow-md"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              <span>All Feed</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${selectedTab === "all" ? "bg-blue-500 text-zinc-950" : "bg-zinc-200 text-zinc-800"}`}
              >
                {notifications.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab("training")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
                selectedTab === "training"
                  ? "bg-blue-600 text-zinc-950 shadow-md"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Training Updates</span>
              {trainingUnreadCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {trainingUnreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setSelectedTab("assignment")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
                selectedTab === "assignment"
                  ? "bg-violet-600 text-white shadow-md"
                  : "bg-violet-50 text-violet-900 hover:bg-violet-100 border border-violet-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Assignment Reminders</span>
              {assignmentUnreadCount > 0 && (
                <span className="bg-blue-500 text-zinc-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {assignmentUnreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setSelectedTab("notices")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
                selectedTab === "notices"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-red-50 text-red-900 hover:bg-red-100 border border-red-200"
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Officer Notices</span>
              {noticesUnreadCount > 0 && (
                <span className="bg-white text-red-700 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {noticesUnreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Search & Unread Toggle */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search updates or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Unread Only Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors shrink-0 select-none">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#18181B] focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-zinc-700">Unread Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications Cards Feed */}
      <div className="space-y-3.5">
        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-5 rounded-2xl border transition-all space-y-3 shadow-2xs relative overflow-hidden ${
                  !n.read
                    ? n.category === "Training Update"
                      ? "bg-blue-50/80 border-blue-300 ring-1 ring-blue-300/50"
                      : n.category === "Assignment Reminder"
                        ? "bg-violet-50/80 border-violet-300 ring-1 ring-violet-300/50"
                        : "bg-red-50/80 border-red-300 ring-1 ring-red-300/50"
                    : "bg-white border-zinc-200 hover:border-zinc-300 opacity-90"
                }`}
              >
                {/* Left Accent Stripe for Unread */}
                {!n.read && (
                  <span
                    className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                      n.category === "Training Update"
                        ? "bg-blue-600"
                        : n.category === "Assignment Reminder"
                          ? "bg-violet-600"
                          : "bg-red-600"
                    }`}
                  />
                )}

                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-1">
                  <div className="flex items-center space-x-2.5">
                    {/* Category Icon Badge */}
                    <div
                      className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${getCategoryBadgeStyle(n.category)}`}
                    >
                      {getCategoryIcon(n.category)}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${getCategoryBadgeStyle(n.category)}`}
                        >
                          {n.category}
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityBadgeStyle(n.priority)}`}
                        >
                          {n.priority}
                        </span>

                        {n.dueDate && (
                          <span className="text-[10px] bg-red-100 text-red-900 border border-red-300 font-black px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-red-600" />
                            <span>{n.dueDate}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-zinc-900 text-base mt-1 tracking-tight">
                        {n.title}
                      </h3>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => toggleReadStatus(n.id)}
                      title={n.read ? "Mark as unread" : "Mark as read"}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center space-x-1 ${
                        n.read
                          ? "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
                          : "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{n.read ? "Read" : "Mark Read"}</span>
                    </button>

                    <button
                      onClick={() => deleteNotification(n.id)}
                      title="Dismiss notification"
                      className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body Text */}
                <p className="text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed pl-1 sm:pl-10">
                  {n.body}
                </p>

                {/* Footer Metadata & Action Handler */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-zinc-200/70 pl-1 sm:pl-10">
                  <div className="flex items-center space-x-4 text-[11px] text-zinc-500 font-medium flex-wrap gap-y-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>{n.date}</span>
                    </span>

                    {n.instructor && (
                      <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        Authority: {n.instructor}
                      </span>
                    )}
                  </div>

                  {n.actionLabel && (
                    <button
                      onClick={() => {
                        if (!n.read) toggleReadStatus(n.id);
                        if (onActionClick) onActionClick(n.actionType || "general", n);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-all ${
                        n.category === "Training Update"
                          ? "bg-[#18181B] text-blue-500 hover:bg-[#09090B]"
                          : n.category === "Assignment Reminder"
                            ? "bg-violet-600 text-white hover:bg-violet-700"
                            : "bg-zinc-800 text-white hover:bg-zinc-900"
                      }`}
                    >
                      <span>{n.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-4 shadow-xs"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto border-2 border-blue-300">
                <BellOff className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-zinc-900">No Notifications Found</h3>
                <p className="text-xs text-zinc-500 font-medium">
                  {unreadOnly
                    ? "You have no unread updates! All training updates and assignment reminders are clear."
                    : searchQuery
                      ? `No notifications matched "${searchQuery}". Try searching for drill, rifle, or quiz.`
                      : "No announcements are posted under this section yet."}
                </p>
              </div>

              {(unreadOnly || searchQuery) && (
                <button
                  onClick={() => {
                    setUnreadOnly(false);
                    setSearchQuery("");
                    setSelectedTab("all");
                  }}
                  className="bg-[#18181B] text-blue-500 hover:bg-[#09090B] font-black px-4 py-2 rounded-xl text-xs inline-flex items-center space-x-2 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
