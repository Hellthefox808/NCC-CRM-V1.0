import React from "react";
import confetti from "canvas-confetti";
import { Download } from "lucide-react";
import { AttendanceSummary } from "../../../types";

interface AttendanceLogItem {
  date: string;
  topic: string;
  instructor: string;
  status: "Present" | "Late" | "Leave" | "Absent";
  remarks: string;
}

interface AttendanceSectionProps {
  attendanceSummary: AttendanceSummary;
  attendanceLog: AttendanceLogItem[];
  showToast: (msg: string) => void;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  attendanceSummary,
  attendanceLog,
  showToast
}) => {
  return (
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
  );
};
