import React, { useEffect, useState } from "react";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileCheck2, 
  Search, 
  Shield, 
  User, 
  X 
} from "lucide-react";
import { CadetRecord } from "../types";
import { EnterpriseDataPlatform } from "../services/dataPlatform";

interface StatusTrackerModalProps {
  initialQuery?: string;
  onClose: () => void;
  onOpenPrintableSlip: (record: CadetRecord) => void;
}

export const StatusTrackerModal: React.FC<StatusTrackerModalProps> = ({
  initialQuery = "",
  onClose,
  onOpenPrintableSlip
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [record, setRecord] = useState<CadetRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (searchStr?: string) => {
    const q = (searchStr || query).trim();
    if (!q) {
      setErrorMsg("Please enter Application ID, Aadhaar Number, or SBU Roll No.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setRecord(null);

    try {
      const res = await EnterpriseDataPlatform.trackStatus(q);
      if (!res.success || !res.data?.record) {
        throw new Error(res.error || "No enrollment record found matching your query.");
      }
      setRecord(res.data.record);
    } catch (err: any) {
      setErrorMsg(err.message || "No record found.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-300 text-left relative">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              Track NCC Enrollment Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Enter Application ID, Aadhaar Number, or SBU Roll Number:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 19JHR-SBU-2026-001 or SBU25BTECH042"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              id="status-search-input"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="bg-blue-950 hover:bg-slate-900 text-amber-400 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              id="status-search-btn"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="text-center py-6 text-xs text-slate-500 font-semibold">
            Searching 19 Jharkhand Battalion database...
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-900 rounded-xl text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Status Result Card */}
        {record && (
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application ID</p>
                <p className="text-base font-black text-blue-950 font-mono">{record.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                record.status === "Enrolled" || record.status === "Selected"
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : record.status === "Rejected"
                  ? "bg-red-100 text-red-900 border-red-300"
                  : "bg-amber-100 text-amber-900 border-amber-300"
              }`}>
                {record.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Cadet Name:</span>
                <span className="font-bold text-slate-900">{record.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Division/Wing:</span>
                <span className="font-semibold text-slate-800">
                  {record.gender === "SD" ? "Senior Division (SD)" : "Senior Wing (SW)"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">SBU Course:</span>
                <span className="font-semibold text-slate-800">{record.sbuCourse}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">SBU Roll No:</span>
                <span className="font-semibold text-slate-800">{record.sbuRollNo}</span>
              </div>
            </div>

            {record.enrollmentNo && (
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg text-xs">
                <span className="text-emerald-800 font-semibold block">Official Regimental Number:</span>
                <span className="text-base font-black text-emerald-950 font-mono">{record.enrollmentNo}</span>
              </div>
            )}

            {record.officerRemarks && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <strong>Officer Remarks:</strong> {record.officerRemarks}
              </div>
            )}

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => onOpenPrintableSlip(record)}
                className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                <span>View / Print Form 1 Slip</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
