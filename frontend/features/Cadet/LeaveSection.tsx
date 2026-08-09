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
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-black text-zinc-900">Parade Leave & Exemption Requests</h2>
          <p className="text-xs text-zinc-500">
            Submit official absence permission for university exams, medical unfitness or emergency
          </p>
        </div>

        {/* Apply Form */}
        <form
          onSubmit={handleApplyLeave}
          className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-4"
        >
          <h3 className="font-extrabold text-zinc-900 text-sm flex items-center space-x-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Submit New Leave Application</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-extrabold text-zinc-700 uppercase">
                Reason Category
              </label>
              <select
                value={leaveReasonCategory}
                onChange={(e) => setLeaveReasonCategory(e.target.value)}
                className="w-full mt-1 p-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="College Examination">College Examination / Test</option>
                <option value="Medical Unfitness">Medical Unfitness / Illness</option>
                <option value="Family Emergency">Family Emergency</option>
                <option value="University Sports Event">University Sports Event</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-zinc-700 uppercase">
                Start Date
              </label>
              <input
                type="date"
                value={leaveStartDate}
                onChange={(e) => setLeaveStartDate(e.target.value)}
                className="w-full mt-1 p-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-zinc-700 uppercase">End Date</label>
              <input
                type="date"
                value={leaveEndDate}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                className="w-full mt-1 p-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-zinc-700 uppercase">
              Detailed Explanation
            </label>
            <textarea
              rows={2}
              placeholder="Specify subject of examination or medical reason..."
              value={leaveDescription}
              onChange={(e) => setLeaveDescription(e.target.value)}
              className="w-full mt-1 p-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="bg-[#18181B] hover:bg-[#09090B] text-blue-500 font-black px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Submit Leave Application to ANO Office</span>
          </button>
        </form>

        {/* History Table */}
        <div className="space-y-3">
          <h3 className="font-black text-zinc-900 text-base">Leave Application History</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100 text-zinc-700 font-extrabold uppercase border-b border-zinc-200">
                  <th className="p-3">App ID</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Date Range</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Officer Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {leaveHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-zinc-800">{item.id}</td>
                    <td className="p-3 font-extrabold text-zinc-900">{item.category}</td>
                    <td className="p-3 font-semibold text-zinc-700">
                      {item.startDate} to {item.endDate}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          item.status === "Approved"
                            ? "bg-emerald-100 text-emerald-900"
                            : item.status === "Pending"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-900"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-600 italic">{item.officerRemarks}</td>
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
