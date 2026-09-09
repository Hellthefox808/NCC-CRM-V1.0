import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck2,
  Search,
  Shield,
  User,
  X,
} from "lucide-react";
import { CadetRecord } from "@/types";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";

interface StatusTrackerModalProps {
  isOpen?: boolean;
  initialQuery?: string;
  onClose: () => void;
  onOpenPrintableSlip?: (record: CadetRecord) => void;
}

export const StatusTrackerModal: React.FC<StatusTrackerModalProps> = ({
  isOpen = false,
  initialQuery = "",
  onClose,
  onOpenPrintableSlip,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [record, setRecord] = useState<CadetRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = useCallback(
    async (searchStr?: string) => {
      const q = (searchStr || query).trim();
      if (!q) {
        setErrorMsg("Please enter Application ID, Aadhaar Number, or NCC Enrolment Number.");
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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "No record found.";
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    },
    [query],
  );

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-tracker-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-card text-card-foreground rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-border text-left relative overflow-hidden">
        {/* Top Tricolor Accent Hairline */}
        <div className="absolute top-0 inset-x-0 h-1 regimental-tricolor-gradient" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-3 pt-1">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h3 id="status-tracker-modal-title" className="text-base font-bold text-foreground">
              Track NCC Enrollment Status
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close status tracker"
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-foreground/80">
            Enter Application ID, Aadhaar Number, or NCC Enrolment Number:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 192026081298471625 or JH24SDA104201"
              className="flex-1 bg-muted/50 border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary focus:outline-hidden transition-all font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              id="status-search-input"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
              id="status-search-btn"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="text-center py-6 text-xs text-muted-foreground font-semibold flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Searching 19 Jharkhand Battalion database...</span>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Status Result Card */}
        {record && (
          <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Application ID
                </p>
                <p className="text-base font-black text-foreground font-mono">{record.id}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  record.status === "Enrolled" || record.status === "Selected"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : record.status === "Rejected"
                      ? "bg-destructive/15 text-destructive border-destructive/30"
                      : "bg-primary/15 text-primary border-primary/30"
                }`}
              >
                {record.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground font-medium block">Cadet Name:</span>
                <span className="font-bold text-foreground">{record.fullName}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium block">Division/Wing:</span>
                <span className="font-semibold text-foreground">
                  {record.gender === "SD" ? "Senior Division (SD)" : "Senior Wing (SW)"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium block">SBU Course:</span>
                <span className="font-semibold text-foreground">{record.sbuCourse}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium block">SBU Roll No:</span>
                <span className="font-semibold text-foreground">{record.sbuRollNo}</span>
              </div>
            </div>

            {record.enrollmentNo && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold block">
                  Official Regimental Number:
                </span>
                <span className="text-base font-black text-emerald-800 dark:text-emerald-300 font-mono">
                  {record.enrollmentNo}
                </span>
              </div>
            )}

            {record.officerRemarks && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs text-foreground">
                <strong className="text-primary">Officer Remarks:</strong> {record.officerRemarks}
              </div>
            )}

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => onOpenPrintableSlip?.(record)}
                className="bg-foreground hover:bg-foreground/90 text-background font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>View / Print Form 1 Slip</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
