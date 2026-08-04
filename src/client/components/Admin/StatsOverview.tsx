import React from "react";
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle,
  Megaphone,
  UserPlus,
  ChevronRight
} from "lucide-react";
import { CadetRecord } from "../../../types";

interface StatsOverviewProps {
  enrollments: CadetRecord[];
  setActiveTab: (tab: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ enrollments, setActiveTab }) => {
  const totalApps = enrollments.length;
  const sdCount = enrollments.filter(e => e.gender === "SD").length;
  const swCount = enrollments.filter(e => e.gender === "SW").length;
  const enrolledCount = enrollments.filter(e => e.status === "Enrolled" || e.status === "Selected").length;
  const pendingCount = enrollments.filter(e => e.status === "Submitted" || e.status === "Physical Scheduled").length;

  return (
    <div className="space-y-6">
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
    </div>
  );
};
