import React, { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import {
  Download,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Minus,
  Search,
} from "lucide-react";
import { AttendanceSummary } from "@/types";

interface AttendanceLogItem {
  date: string;
  topic: string;
  instructor: string;
  status: string;
  remarks: string;
}

interface AttendanceSectionProps {
  attendanceSummary: AttendanceSummary;
  attendanceLog: AttendanceLogItem[];
  showToast: (msg: string) => void;
}

/** Battalion requirement: 75% of mandatory parades to sit 'B'/'C' certificate exams. */
const ELIGIBILITY_FLOOR = 75;
const PAGE_SIZE = 8;

type SortKey = "date" | "topic" | "instructor" | "status";
type SortDir = "asc" | "desc";

const STATUS_TONE: Record<string, string> = {
  Present: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Late: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Leave: "bg-primary/10 text-primary ring-1 ring-primary/20",
  Absent: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

/** Each status carries a different weight against certificate-exam eligibility. */
const IMPACT: Record<string, { label: string; tone: string; Icon: typeof Minus }> = {
  Present: { label: "Counts towards 75%", tone: "text-emerald-700", Icon: TrendingUp },
  Late: { label: "Counted, turnout noted", tone: "text-amber-700", Icon: Minus },
  Leave: { label: "Excused — neutral", tone: "text-muted-foreground", Icon: Minus },
  Absent: { label: "Reduces eligibility", tone: "text-red-700", Icon: TrendingDown },
};

const StatBox: React.FC<{ label: string; value: React.ReactNode; hint: string; tone?: string }> = ({
  label,
  value,
  hint,
  tone = "text-foreground",
}) => (
  <div className="panel bg-muted/40 p-4 space-y-1">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </p>
    <p className={`text-2xl font-semibold numeric ${tone}`}>{value}</p>
    <p className="text-[11px] text-muted-foreground">{hint}</p>
  </div>
);

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  attendanceSummary,
  attendanceLog,
  showToast,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const percentage = Number(attendanceSummary.percentage ?? 0);
  const eligible = percentage >= ELIGIBILITY_FLOOR;
  const total = Number(attendanceSummary.totalParades ?? 0);
  const attended = Number(attendanceSummary.attended ?? 0);
  // How many further parades may be missed before dropping under the 75% floor.
  const buffer = Math.max(0, Math.floor((attended * 100) / ELIGIBILITY_FLOOR) - total);
  // If below the floor, consecutive parades needed to climb back to 75%.
  const needed = eligible
    ? 0
    : Math.max(
        0,
        Math.ceil((ELIGIBILITY_FLOOR * total - 100 * attended) / (100 - ELIGIBILITY_FLOOR)),
      );

  const statuses = useMemo(
    () => ["All", ...Array.from(new Set(attendanceLog.map((l) => l.status)))],
    [attendanceLog],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = attendanceLog.filter(
      (l) =>
        (statusFilter === "All" || l.status === statusFilter) &&
        (q === "" ||
          l.topic.toLowerCase().includes(q) ||
          l.instructor.toLowerCase().includes(q) ||
          l.remarks.toLowerCase().includes(q)),
    );
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])) * dir);
  }, [attendanceLog, statusFilter, query, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "date" ? "desc" : "asc");
    }
    setPage(1);
  };

  const SortHeader: React.FC<{ k: SortKey; children: React.ReactNode; className?: string }> = ({
    k,
    children,
    className = "",
  }) => (
    <th className={`p-3 ${className}`}>
      <button
        onClick={() => toggleSort(k)}
        aria-sort={sortKey === k ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
        className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
      >
        {children}
        {sortKey === k ? (
          sortDir === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ArrowDown className="w-3 h-3 opacity-25" />
        )}
      </button>
    </th>
  );

  return (
    <div className="space-y-5">
      {/* Eligibility impact banner */}
      <div className="panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Attendance history
            </h2>
            <p className="text-xs text-muted-foreground">
              19 JHR BN NCC · SBU Company official parade &amp; class record
            </p>
          </div>
          <button
            onClick={() => {
              confetti({ particleCount: 50 });
              showToast("Generating official parade attendance report PDF...");
            }}
            className="surface-inverse inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download attendance report
          </button>
        </div>

        <div
          className={`rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 ring-1 ${
            eligible ? "bg-emerald-50/70 ring-emerald-200" : "bg-red-50/70 ring-red-200"
          }`}
        >
          {eligible ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <div className="flex-1 space-y-1">
            <p
              className={`text-sm font-semibold ${eligible ? "text-emerald-800" : "text-red-800"}`}
            >
              {eligible
                ? `Eligible for 'B' & 'C' certificate exams — ${percentage}% against the 75% floor`
                : `Below the 75% requirement — currently ${percentage}%`}
            </p>
            <p className="text-[11px] text-muted-foreground numeric">
              {attended} of {total} mandatory sessions attended ·{" "}
              {eligible
                ? `${buffer} further absence${buffer === 1 ? "" : "s"} can be sustained before eligibility is lost`
                : `${needed} consecutive present marking${needed === 1 ? "" : "s"} required to regain eligibility`}
            </p>
            <div className="relative h-2 rounded-full bg-muted overflow-hidden mt-2">
              <div
                className={`absolute inset-y-0 left-0 rounded-full ${eligible ? "bg-emerald-500" : "bg-red-500"}`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
              <div
                className="absolute inset-y-0 w-px bg-foreground/50"
                style={{ left: `${ELIGIBILITY_FLOOR}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBox
            label="Overall attendance"
            value={`${percentage}%`}
            hint={`Requirement ≥ ${ELIGIBILITY_FLOOR}%`}
            tone={eligible ? "text-emerald-700" : "text-red-700"}
          />
          <StatBox
            label="Parades attended"
            value={`${attended} / ${total}`}
            hint="Mandatory drills & classes"
          />
          <StatBox
            label="Absences & late"
            value={`${attendanceSummary.absent} abs · ${attendanceSummary.late} late`}
            hint={`Excused leave: ${attendanceSummary.leave}`}
          />
          <StatBox
            label="Camp attendance"
            value={`${attendanceSummary.campPercent}%`}
            hint="CATC-I Ranchi completed"
            tone="text-primary"
          />
        </div>

        <div className="panel bg-muted/40 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Breakdown by activity category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              {
                label: "Squad & ceremonial drill",
                value: attendanceSummary.drillPercent,
                bar: "bg-emerald-500",
              },
              {
                label: "Weapon training & theory classes",
                value: attendanceSummary.classPercent,
                bar: "bg-primary",
              },
            ].map((c) => (
              <div key={c.label} className="space-y-1.5">
                <div className="flex justify-between font-medium text-foreground">
                  <span>{c.label}</span>
                  <span className="numeric">{c.value}%</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${c.bar}`}
                    style={{ width: `${c.value}%` }}
                  />
                  <div
                    className="absolute inset-y-0 w-px bg-foreground/40"
                    style={{ left: `${ELIGIBILITY_FLOOR}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session history table */}
      <div className="panel p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Parade session history</h3>
            <p className="text-[11px] text-muted-foreground numeric">
              {rows.length} of {attendanceLog.length} records
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search topic, PI staff or remarks"
                aria-label="Search attendance records"
                className="h-9 w-64 rounded-xl border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-border p-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                    statusFilter === s
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-border bg-muted/50">
                <SortHeader k="date">Date</SortHeader>
                <SortHeader k="topic">Parade subject</SortHeader>
                <SortHeader k="instructor">PI staff</SortHeader>
                <SortHeader k="status">Status</SortHeader>
                <th className="p-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Eligibility impact
                </th>
                <th className="p-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Officer remarks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((log, idx) => {
                const impact = IMPACT[log.status] ?? IMPACT.Leave;
                const Icon = impact.Icon;
                return (
                  <tr key={`${log.date}-${idx}`} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 numeric font-medium text-foreground whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="p-3 font-medium text-foreground">{log.topic}</td>
                    <td className="p-3 text-muted-foreground">{log.instructor}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_TONE[log.status] ?? STATUS_TONE.Leave}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${impact.tone}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {impact.label}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{log.remarks}</td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      No sessions match this view
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Clear the search or choose a different status to see the full register.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <p className="text-[11px] text-muted-foreground numeric">
            {rows.length === 0
              ? "No records"
              : `Showing ${(current - 1) * PAGE_SIZE + 1}–${Math.min(current * PAGE_SIZE, rows.length)} of ${rows.length}`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, current - 1))}
              disabled={current === 1}
              aria-label="Previous page"
              className="h-8 w-8 grid place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                aria-current={p === current ? "page" : undefined}
                className={`h-8 min-w-8 px-2 rounded-lg text-xs font-semibold numeric cursor-pointer ${
                  p === current
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(pageCount, current + 1))}
              disabled={current === pageCount}
              aria-label="Next page"
              className="h-8 w-8 grid place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
