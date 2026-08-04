import React from "react";
import { ChevronRight } from "lucide-react";
import { CadetRecord } from "../../types";

interface RecentRegistrationsProps {
  enrollments: CadetRecord[];
  setActiveTab: (tab: any) => void;
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
  setEditingRegNo
}) => {
  return (
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
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => {
                      setSelectedRecord(e);
                      setEditingStatus(e.status);
                      setEditingRemarks(e.officerRemarks || "");
                      setEditingRegNo(e.enrollmentNo || "");
                      setActiveTab("cadets"); // Jump to cadet tab to edit
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
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
