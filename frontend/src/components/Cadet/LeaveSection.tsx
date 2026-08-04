import React from "react";
import { Plus, Send } from "lucide-react";

interface LeaveHistoryItem {
  id: string;
  category: string;
  startDate: string;
  endDate: string;
  status: string;
  officerRemarks?: string;
  officerName?: string;
}

interface LeaveSectionProps {
  leaveReasonCategory: string;
  setLeaveReasonCategory: (val: string) => void;
  leaveStartDate: string;
  setLeaveStartDate: (val: string) => void;
  leaveEndDate: string;
  setLeaveEndDate: (val: string) => void;
  leaveDescription: string;
  setLeaveDescription: (val: string) => void;
  handleApplyLeave: (e: React.FormEvent) => void;
  leaveHistory: LeaveHistoryItem[];
}

export const LeaveSection: React.FC<LeaveSectionProps> = ({
  leaveReasonCategory,
  setLeaveReasonCategory,
  leaveStartDate,
  setLeaveStartDate,
  leaveEndDate,
  setLeaveEndDate,
  leaveDescription,
  setLeaveDescription,
  handleApplyLeave,
  leaveHistory,
}) => {
  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Parade Leave & Exemption Requests</h2>
          <p className="text-xs text-slate-500">Submit official absence permission for university exams, medical unfitness or emergency</p>
        </div>

        {/* Apply Form */}
        <form onSubmit={handleApplyLeave} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
            <Plus className="w-4 h-4 text-yellow-500" />
            <span>Submit New Leave Application</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase">Reason Category</label>
              <select
                value={leaveReasonCategory}
                onChange={(e) => setLeaveReasonCategory(e.target.value)}
                className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
              >
                <option value="College Examination">College Examination / Test</option>
                <option value="Medical Unfitness">Medical Unfitness / Illness</option>
                <option value="Family Emergency">Family Emergency</option>
                <option value="University Sports Event">University Sports Event</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase">Start Date</label>
              <input
                type="date"
                value={leaveStartDate}
                onChange={(e) => setLeaveStartDate(e.target.value)}
                className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase">End Date</label>
              <input
                type="date"
                value={leaveEndDate}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase">Detailed Explanation</label>
            <textarea
              rows={2}
              placeholder="Specify subject of examination or medical reason..."
              value={leaveDescription}
              onChange={(e) => setLeaveDescription(e.target.value)}
              className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-yellow-400 outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="bg-[#002147] hover:bg-[#001838] text-yellow-400 font-black px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Submit Leave Application to ANO Office</span>
          </button>
        </form>

        {/* History Table */}
        <div className="space-y-3">
          <h3 className="font-black text-slate-900 text-base">Leave Application History</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                  <th className="p-3">App ID</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Date Range</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Officer Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800">{item.id}</td>
                    <td className="p-3 font-extrabold text-slate-900">{item.category}</td>
                    <td className="p-3 font-semibold text-slate-700">{item.startDate} to {item.endDate}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        item.status === "Approved"
                          ? "bg-emerald-100 text-emerald-900"
                          : item.status === "Pending"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-red-100 text-red-900"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 italic">{item.officerRemarks}</td>
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
