import React from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Megaphone,
  UserPlus,
  Activity,
  Sparkles,
} from "lucide-react";
import { CadetRecord } from "@/types";

interface StatsOverviewProps {
  enrollments: CadetRecord[];
  setActiveTab: (tab: string) => void;
  metricsData?: {
    activeEventsCount?: number;
    notificationsCount?: number;
    uptimeSeconds?: number;
  };
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  enrollments,
  setActiveTab,
  metricsData,
}) => {
  const totalApps = enrollments.length;
  const sdCount = enrollments.filter((e) => e.gender === "SD").length;
  const swCount = enrollments.filter((e) => e.gender === "SW").length;
  const enrolledCount = enrollments.filter(
    (e) => e.status === "Enrolled" || e.status === "Selected",
  ).length;
  const pendingCount = enrollments.filter(
    (e) => e.status === "Submitted" || e.status === "Physical Scheduled",
  ).length;
  const verifiedRate = totalApps > 0 ? Math.round((enrolledCount / totalApps) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Elite Regimental Glass Command Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 glass-panel shadow-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 glass-pill px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-300 border border-blue-400/20">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>19 Jharkhand Battalion NCC • SBU Sub-Unit</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Officer Command & Nominal Roll
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Real-time nominal roll, drill attendance, cadet lifecycle, and weapon training
              telemetry synchronized with HQ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab("broadcast")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/25 transition-all hover:scale-105 cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>New Broadcast</span>
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className="glass-pill hover:bg-white/15 text-zinc-100 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all hover:scale-105 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Take Attendance</span>
            </button>
            <button
              onClick={() => setActiveTab("cadets")}
              className="glass-pill hover:bg-white/15 text-zinc-100 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all hover:scale-105 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Cadet Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Glassmorphic Metrics Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel glass-panel-interactive rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Applications</span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {totalApps}
            </span>
            <span className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            SD (Senior Div): <span className="text-zinc-200 font-bold">{sdCount}</span> • SW (Senior
            Wing): <span className="text-zinc-200 font-bold">{swCount}</span>
          </p>
        </div>

        <div className="glass-panel glass-panel-interactive rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Enrolled Cadets</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
              {enrolledCount}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">Active Ranks</span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            Selection Yield:{" "}
            <span className="text-emerald-300 font-bold">{verifiedRate}% Verified</span>
          </p>
        </div>

        <div className="glass-panel glass-panel-interactive rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Unit Activity</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-purple-300 tracking-tight">
              {metricsData?.activeEventsCount ?? (enrolledCount > 0 ? enrolledCount : 0)}
            </span>
            <span className="text-[11px] text-purple-400 font-extrabold">Active Events</span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">Scheduled Parades, Drills & Camps</p>
        </div>

        <div className="glass-panel glass-panel-interactive rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Processing</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
              {pendingCount}
            </span>
            <span className="text-[11px] text-amber-400/90 font-extrabold">Awaiting Review</span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            Physical PET & Document Verification
          </p>
        </div>
      </div>
    </div>
  );
};

