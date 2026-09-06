import React from "react";
import { ChevronRight, UserCheck } from "lucide-react";
import { CadetRecord } from "@/types";

interface RecentRegistrationsProps {
  enrollments: CadetRecord[];
  setActiveTab: (tab: string) => void;
  setSelectedRecord: (record: CadetRecord) => void;
  setEditingStatus: (status: string) => void;
  setEditingRemarks: (remarks: string) => void;
  setEditingRegNo: (regNo: string) => void;
}

export const RecentRegistrations: React.FC<RecentRegistrationsProps> = ({
  enrollments,
  setActiveTab,
  setSelectedRecord,
  setEditingStatus,
  setEditingRemarks,
  setEditingRegNo,
}) => {
  return (
    <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4 shadow-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="font-black text-white text-lg tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" />
            <span>Recent Cadet Registrations</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Applications submitted for 19 JHR BN NCC SBU Sub-Unit
          </p>
        </div>
        <button
          onClick={() => setActiveTab("cadets")}
          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 glass-pill px-3 py-1.5 rounded-xl transition-all hover:scale-105 cursor-pointer"
        >
          <span>View Nominal Roll</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 text-zinc-300 font-extrabold uppercase border-b border-white/10">
            <tr>
              <th className="py-3 px-3">App ID</th>
              <th className="py-3 px-3">Cadet Name</th>
              <th className="py-3 px-3">Wing</th>
              <th className="py-3 px-3">Course / Roll</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {enrollments.slice(0, 5).map((e) => (
              <tr key={e.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-3 font-mono text-zinc-400 font-semibold">{e.id}</td>
                <td className="py-3 px-3">
                  <p className="font-extrabold text-white">{e.fullName}</p>
                  <p className="text-[10px] text-zinc-400">{e.mobile}</p>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      e.gender === "SD"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                    }`}
                  >
                    {e.gender}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <p className="font-semibold text-zinc-200">{e.sbuCourse}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">{e.sbuRollNo}</p>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      e.status === "Enrolled" || e.status === "Selected"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => {
                      setSelectedRecord(e);
                      setEditingStatus(e.status);
                      setEditingRemarks(e.officerRemarks || "");
                      setEditingRegNo(e.enrollmentNo || "");
                      setActiveTab("cadets");
                    }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 glass-pill px-3 py-1 rounded-lg transition-all hover:bg-white/10 cursor-pointer"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-400 font-medium">
                  No applications received yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
