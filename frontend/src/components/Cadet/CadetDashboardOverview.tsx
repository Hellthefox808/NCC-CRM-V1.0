import React from "react";
import { 
  FileText, QrCode, UserCheck, Award, ShieldCheck, CheckCircle2, 
  Calendar, MapPin, User, Shield, Info, FileCheck, Bell, BookOpen, Check
} from "lucide-react";
import { CadetRecord } from "../../types";

interface CadetDashboardOverviewProps {
  cadetProfile: any;
  attendanceSummary: any;
  tasks: any[];
  toggleTask: (id: string) => void;
  notifications: any[];
  setActiveTab: (tab: any) => void;
  setShowIdCardModal: (val: boolean) => void;
}

export const CadetDashboardOverview: React.FC<CadetDashboardOverviewProps> = ({
  cadetProfile,
  attendanceSummary,
  tasks,
  toggleTask,
  notifications,
  setActiveTab,
  setShowIdCardModal
}) => {
  return (
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
  );
};
