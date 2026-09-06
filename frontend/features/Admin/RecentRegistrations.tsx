import React from "react";
import { ChevronRight, UserCheck, Shield } from "lucide-react";
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
    <div className="lg:col-span-2 glass-card-classic rounded-2xl p-6 space-y-4 shadow-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="font-black text-white text-base sm:text-lg tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" />
            <span>Recent Cadet Registrations</span>
          </h3>
          <p className="text-xs text-zinc-400 font-medium">
            Applications received for 19 JHR BN NCC • SBU Sub-Unit
          </p>
        </div>
        <button
          onClick={() => setActiveTab("cadets")}
          className="text-xs font-bold text-blue-300 hover:text-white flex items-center space-x-1 glass-pill px-3.5 py-1.5 rounded-xl transition-all hover:scale-105 cursor-pointer border border-white/15"
        >
          <span>Nominal Roll</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 text-zinc-300 font-black uppercase text-[11px] tracking-wider border-b border-white/10">
            <tr>
              <th className="py-3 px-3.5">App ID</th>
              <th className="py-3 px-3.5">Cadet Name</th>
              <th className="py-3 px-3.5">Wing</th>
              <th className="py-3 px-3.5">Course / Roll</th>
              <th className="py-3 px-3.5">Status</th>
              <th className="py-3 px-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {enrollments.slice(0, 5).map((e) => (
              <tr key={e.id} className="hover:bg-white/5 transition-colors group">
                <td className="py-3 px-3.5 font-mono text-zinc-400 font-bold text-[11px]">
                  {e.id}
                </td>
                <td className="py-3 px-3.5">
                  <p className="font-extrabold text-white group-hover:text-blue-200 transition-colors">
                    {e.fullName}
                  </p>
                  <p className="text-[10px] text-zinc-400">{e.mobile}</p>
                </td>
                <td className="py-3 px-3.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      e.gender === "SD" ? "glass-badge-blue" : "glass-badge-red"
                    }`}
                  >
                    {e.gender}
                  </span>
                </td>
                <td className="py-3 px-3.5">
                  <p className="font-semibold text-zinc-200">{e.sbuCourse}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">{e.sbuRollNo}</p>
                </td>
                <td className="py-3 px-3.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      e.status === "Enrolled" || e.status === "Selected"
                        ? "glass-badge-emerald"
                        : e.status === "Rejected"
                          ? "glass-badge-red"
                          : e.status === "Submitted"
                            ? "glass-badge-amber"
                            : "glass-badge-blue"
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="py-3 px-3.5 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {e.status === "Submitted" && (
                      <button
                        onClick={() => {
                          setSelectedRecord(e);
                          setEditingStatus("Physical Scheduled");
                          setEditingRemarks(
                            "Scheduled for Battalion Physical Efficiency Test (PET).",
                          );
                          setEditingRegNo(e.enrollmentNo || "");
                          setActiveTab("cadets");
                        }}
                        className="text-[11px] font-bold text-amber-300 hover:text-white glass-pill px-2.5 py-1 rounded-lg transition-all hover:bg-amber-600/30 cursor-pointer border border-amber-500/30"
                        title="Quick schedule Physical Efficiency Test"
                      >
                        Schedule PET
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedRecord(e);
                        setEditingStatus(e.status);
                        setEditingRemarks(e.officerRemarks || "");
                        setEditingRegNo(e.enrollmentNo || "");
                        setActiveTab("cadets");
                      }}
                      className="text-xs font-bold text-blue-300 hover:text-white glass-pill px-3 py-1 rounded-lg transition-all hover:bg-blue-600/30 cursor-pointer border border-white/10 hover:border-blue-400/40"
                    >
                      Review
                    </button>
                  </div>
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
