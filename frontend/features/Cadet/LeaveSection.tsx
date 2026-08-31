import React from "react";
import { Plus, Send, FileText } from "lucide-react";

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
      <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>Parade Leave & Exemption Requests</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Submit official absence permission for university exams, medical unfitness or emergency
          </p>
        </div>

        {/* Apply Form */}
        <form
          onSubmit={handleApplyLeave}
          className="glass-panel border border-white/10 p-5 rounded-2xl space-y-4"
        >
          <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Submit New Leave Application</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-extrabold text-zinc-300 uppercase">
                Reason Category
              </label>
              <select
                value={leaveReasonCategory}
                onChange={(e) => setLeaveReasonCategory(e.target.value)}
                className="w-full mt-1.5 p-2.5 glass-input rounded-xl text-xs font-medium"
              >
                <option value="College Examination" className="bg-[#0b1329] text-white">
                  College Examination / Test
                </option>
                <option value="Medical Unfitness" className="bg-[#0b1329] text-white">
                  Medical Unfitness / Illness
                </option>
                <option value="Family Emergency" className="bg-[#0b1329] text-white">
                  Family Emergency
                </option>
                <option value="University Sports Event" className="bg-[#0b1329] text-white">
                  University Sports Event
                </option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-zinc-300 uppercase">
                Start Date
              </label>
              <input
                type="date"
                value={leaveStartDate}
                onChange={(e) => setLeaveStartDate(e.target.value)}
                className="w-full mt-1.5 p-2.5 glass-input rounded-xl text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-zinc-300 uppercase">End Date</label>
              <input
                type="date"
                value={leaveEndDate}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                className="w-full mt-1.5 p-2.5 glass-input rounded-xl text-xs font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-zinc-300 uppercase">
              Detailed Explanation
            </label>
            <textarea
              rows={2}
              placeholder="Specify subject of examination or medical reason..."
              value={leaveDescription}
              onChange={(e) => setLeaveDescription(e.target.value)}
              className="w-full mt-1.5 p-2.5 glass-input rounded-xl text-xs font-medium"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/30 transition-all hover:scale-102"
          >
            <Send className="w-4 h-4" />
            <span>Submit Leave Application to ANO Office</span>
          </button>
        </form>

        {/* History */}
        <div className="space-y-4 pt-2">
          <h3 className="font-extrabold text-white text-base">Prior Leave Applications History</h3>
          <div className="space-y-3">
            {leaveHistory.map((l) => (
              <div
                key={l.id}
                className="glass-panel border border-white/10 p-4 rounded-xl space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black text-blue-400">{l.id}</span>
                    <span className="font-extrabold text-white text-sm">{l.category}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      l.status === "Approved"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : l.status === "Pending"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {l.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-300">
                  <strong>Duration:</strong> {l.startDate} to {l.endDate}
                </p>

                {l.officerRemarks && (
                  <div className="glass-panel p-2.5 rounded-lg border border-white/10 text-xs text-zinc-300 space-y-0.5">
                    <p className="font-bold text-blue-300">ANO Office Remarks:</p>
                    <p>{l.officerRemarks}</p>
                    {l.officerName && (
                      <p className="text-[10px] text-zinc-400 pt-0.5 text-right">
                        Verified by: {l.officerName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {leaveHistory.length === 0 && (
              <p className="text-xs text-zinc-400 py-6 text-center">
                No leave applications recorded.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
