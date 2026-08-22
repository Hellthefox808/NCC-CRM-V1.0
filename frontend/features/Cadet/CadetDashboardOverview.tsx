import React from "react";
import {
  FileText,
  QrCode,
  UserCheck,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  User,
  Shield,
  Info,
  FileCheck,
  Bell,
  BookOpen,
  Check,
  ArrowRight,
  Activity,
  Clock3,
} from "lucide-react";

import { CadetProfile, AttendanceSummary } from "@/types";

export interface CadetTaskItem {
  id: string;
  title: string;
  category?: string;
  completed: boolean;
  dueDate?: string;
  priority?: "High" | "Medium" | "Low";
}

export interface CadetNotificationItem {
  id: string;
  title: string;
  message?: string;
  time?: string;
  unread?: boolean;
  type?: string;
  priority?: string;
  body?: string;
  date?: string;
}

interface CadetDashboardOverviewProps {
  cadetProfile: CadetProfile;
  attendanceSummary: AttendanceSummary;
  tasks: CadetTaskItem[];
  toggleTask: (id: string) => void;
  notifications: CadetNotificationItem[];
  setActiveTab: (tab: string) => void;
  setShowIdCardModal: (val: boolean) => void;
}

/** Uniform metric tile: label rail, single dominant figure, supporting line. */
const MetricTile: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  unit?: string;
  status?: { text: string; tone: "success" | "info" | "warning" };
  caption: string;
  progress?: number;
  progressFloor?: number;
}> = ({ label, icon, value, unit, status, caption, progress, progressFloor }) => {
  const toneClass =
    status?.tone === "success"
      ? "bg-success/10 text-success"
      : status?.tone === "warning"
        ? "bg-warning/10 text-warning"
        : "bg-primary/10 text-primary";

  return (
    <div className="panel p-5 flex flex-col gap-3 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
          {label}
        </span>
        <span className="text-muted-foreground/70 shrink-0">{icon}</span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="numeric font-display text-[28px] leading-none font-semibold tracking-tight text-foreground">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
        {status && (
          <span
            className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${toneClass}`}
          >
            {status.text}
          </span>
        )}
      </div>

      {typeof progress === "number" && (
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
          {typeof progressFloor === "number" && (
            <span
              className="absolute top-[-3px] h-[calc(100%+6px)] w-0.5 rounded-full bg-foreground/40"
              style={{ left: `${progressFloor}%` }}
              aria-hidden
            />
          )}
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">{caption}</p>
    </div>
  );
};

/** Framed detail row used inside the parade / camp briefing cards. */
const DetailRow: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <li className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground/80">
    <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
    <span>{children}</span>
  </li>
);

export const CadetDashboardOverview: React.FC<CadetDashboardOverviewProps> = ({
  cadetProfile,
  attendanceSummary,
  tasks,
  toggleTask,
  notifications,
  setActiveTab,
  setShowIdCardModal,
}) => {
  const completed = tasks.filter((t) => t.completed).length;
  const taskProgress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Command banner */}
      <section className="surface-inverse relative overflow-hidden rounded-3xl border border-inverse-border shadow-lg">
        <div
          className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full opacity-[0.18] blur-3xl brand-gradient"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            <img
              src={cadetProfile.photoUrl}
              alt={`Portrait of ${cadetProfile.fullName}`}
              className="h-20 w-20 shrink-0 rounded-2xl border border-inverse-border object-cover shadow-md"
              loading="lazy"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-primary-on-inverse/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-on-inverse">
                  {cadetProfile.rank}
                </span>
                <span className="rounded-full border border-inverse-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-inverse-muted">
                  {cadetProfile.batch}
                </span>
              </div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-inverse-foreground sm:text-3xl">
                Welcome back, {cadetProfile.fullName}
              </h2>
              <p className="text-xs text-inverse-muted">
                {cadetProfile.unit} · Sarala Birla University Company
              </p>
              <p className="numeric text-[11px] font-medium text-primary-on-inverse">
                Regt No {cadetProfile.regNo} · SBU Roll {cadetProfile.sbuRollNo}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("leave")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <FileText className="h-4 w-4" />
              Apply for leave
            </button>
            <button
              onClick={() => setShowIdCardModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-inverse-border bg-inverse-elevated px-4 py-2.5 text-xs font-semibold text-inverse-foreground transition-colors hover:bg-inverse-elevated/70"
            >
              <QrCode className="h-4 w-4 text-primary-on-inverse" />
              Cadet ID card
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className="inline-flex items-center gap-2 rounded-xl border border-inverse-border bg-inverse-elevated px-4 py-2.5 text-xs font-semibold text-inverse-foreground transition-colors hover:bg-inverse-elevated/70"
            >
              <UserCheck className="h-4 w-4 text-primary-on-inverse" />
              Attendance record
            </button>
          </div>
        </div>
      </section>

      {/* Metric rail */}
      <section
        aria-label="Cadet training summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricTile
          label="Parade attendance"
          icon={<UserCheck className="h-4 w-4" />}
          value={`${attendanceSummary.percentage}%`}
          status={{
            text: Number(attendanceSummary.percentage) >= 75 ? "Eligible" : "Below bar",
            tone: Number(attendanceSummary.percentage) >= 75 ? "success" : "warning",
          }}
          progress={Number(attendanceSummary.percentage)}
          progressFloor={75}
          caption={`${attendanceSummary.attended} of ${attendanceSummary.totalParades} sessions attended · 75% required for certificate exams`}
        />
        <MetricTile
          label="Certificate & rank"
          icon={<Award className="h-4 w-4" />}
          value="L/Cpl"
          unit="'A' Cert · Alpha"
          status={{ text: "'B' eligible", tone: "info" }}
          caption="'A' Certificate graded Alpha · 2 unit awards on record"
        />
        <MetricTile
          label="Camp nomination"
          icon={<ShieldCheck className="h-4 w-4" />}
          value="ATC Ranchi"
          status={{ text: "Nominated", tone: "info" }}
          caption="Reporting 15 Aug · Namkum Military Station, Ranchi"
        />
        <MetricTile
          label="Physical fitness"
          icon={<Activity className="h-4 w-4" />}
          value="100%"
          status={{ text: "Passed", tone: "success" }}
          caption="1600 m run in 5 m 45 s · Height 175 cm · Cleared for advanced camps"
        />
      </section>

      {/* Working area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Next parade */}
            <article className="panel flex flex-col gap-3 p-5">
              <header className="flex items-center justify-between border-b border-border pb-3">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
                  Next parade drill
                </span>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </header>

              <div className="space-y-1">
                <h4 className="font-display text-base font-semibold tracking-tight text-foreground">
                  Squad Drill &amp; Arms Inspection
                </h4>
                <p className="numeric flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  05 August 2026 · 06:30 hrs sharp
                </p>
              </div>

              <ul className="space-y-1.5 rounded-xl border border-border bg-surface p-3">
                <DetailRow icon={<MapPin className="h-3.5 w-3.5" />}>
                  SBU Sports Ground &amp; Parade Deck
                </DetailRow>
                <DetailRow icon={<User className="h-3.5 w-3.5" />}>
                  Subedar Major B.S. Gurung (PI Staff)
                </DetailRow>
                <DetailRow icon={<Shield className="h-3.5 w-3.5" />}>
                  Working Dress No. 2 — Khaki &amp; DMS
                </DetailRow>
              </ul>
            </article>

            {/* Upcoming camp */}
            <article className="panel flex flex-col gap-3 p-5">
              <header className="flex items-center justify-between border-b border-border pb-3">
                <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-success">
                  Battalion camp
                </span>
                <Award className="h-4 w-4 text-muted-foreground" />
              </header>

              <div className="space-y-1">
                <h4 className="font-display text-base font-semibold tracking-tight text-foreground">
                  Annual Training Camp (ATC Ranchi)
                </h4>
                <p className="numeric text-xs text-muted-foreground">
                  15 Aug – 24 Aug 2026 · 10 days
                </p>
              </div>

              <ul className="space-y-1.5 rounded-xl border border-border bg-surface p-3">
                <DetailRow icon={<MapPin className="h-3.5 w-3.5" />}>
                  Namkum Military Station, Ranchi
                </DetailRow>
                <DetailRow icon={<FileCheck className="h-3.5 w-3.5" />}>
                  Nomination confirmed &amp; verified
                </DetailRow>
                <DetailRow icon={<Info className="h-3.5 w-3.5" />}>
                  Medical &amp; parent consent submitted
                </DetailRow>
              </ul>
            </article>
          </div>

          {/* Preparation checklist */}
          <section className="panel space-y-4 p-5">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
              <div className="space-y-0.5">
                <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                  Parade preparation checklist
                </h3>
                <p className="text-xs text-muted-foreground">
                  Personal tasks before the next inspection and camp
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${taskProgress}%` }}
                  />
                </div>
                <span className="numeric text-xs font-semibold text-muted-foreground">
                  {completed}/{tasks.length}
                </span>
              </div>
            </header>

            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    aria-pressed={task.completed}
                    onClick={() => toggleTask(task.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left text-xs transition-colors ${
                      task.completed
                        ? "border-success/30 bg-success/5 text-muted-foreground"
                        : "border-border bg-surface text-foreground hover:border-border-strong"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          task.completed
                            ? "border-success bg-success text-success-foreground"
                            : "border-border-strong bg-card"
                        }`}
                      >
                        {task.completed && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className={`font-medium ${task.completed ? "line-through" : ""}`}>
                        {task.title}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {task.category}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Activity timeline */}
          <section className="panel space-y-4 p-5">
            <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
              Recent activity
            </h3>

            <ol className="relative space-y-5 border-l border-border pl-6">
              {[
                {
                  tone: "bg-success",
                  title: "Attended Squad Drill Parade (02 Aug 2026)",
                  body: "Marked PRESENT, Grade A1 turnout — PI Staff B.S. Gurung",
                },
                {
                  tone: "bg-primary",
                  title: "Leave application approved (28 Jul 2026)",
                  body: "College exam leave for 10–12 July cleared by the ANO office",
                },
                {
                  tone: "bg-accent-brand",
                  title: "Promoted to Lance Corporal (L/Cpl)",
                  body: "Rank badge conferred by the Commanding Officer, 19 JHR BN NCC",
                },
              ].map((item) => (
                <li key={item.title} className="relative">
                  <span
                    className={`absolute -left-[30px] top-1 h-3 w-3 rounded-full ring-4 ring-card ${item.tone}`}
                    aria-hidden
                  />
                  <p className="text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{item.body}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Side rail */}
        <div className="space-y-6">
          <section className="panel space-y-3 p-5">
            <header className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Bell className="h-4 w-4 text-primary" />
                Officer notices
              </h4>
              <button
                onClick={() => setActiveTab("notifications")}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </button>
            </header>

            <ul className="space-y-2.5">
              {notifications.slice(0, 3).map((n) => (
                <li key={n.id} className="rounded-xl border border-border bg-surface p-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-foreground">{n.title}</span>
                    <span className="shrink-0 rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-destructive">
                      {n.priority}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                    {n.body}
                  </p>
                  <p className="numeric mt-2 text-[10px] text-muted-foreground/70">{n.date}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-inverse space-y-3 rounded-3xl border border-inverse-border p-5 shadow-md">
            <header className="flex items-center justify-between border-b border-inverse-border pb-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-inverse-foreground">
                <BookOpen className="h-4 w-4 text-primary-on-inverse" />
                'B' Certificate prep
              </h4>
              <span className="rounded-full border border-inverse-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-inverse-muted">
                2026 batch
              </span>
            </header>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-inverse-foreground">
                Weapon training — 0.22 Deluxe rifle
              </p>
              <p className="numeric text-[11px] leading-relaxed text-inverse-muted">
                Magazine 5 rounds · Calibre 0.22 inch · Muzzle velocity 2,700 ft/sec
              </p>
              <button
                onClick={() => setActiveTab("materials")}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Open study materials
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          <section className="panel space-y-2 p-5">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Documents on record
            </h4>
            <ul className="space-y-1.5">
              {[
                ["Aadhaar", cadetProfile.aadhaarVerified],
                ["Bank passbook / DBT", cadetProfile.bankPassbookVerified],
                ["College identity card", cadetProfile.collegeIdVerified],
                ["Medical certificate", cadetProfile.medicalCertVerified],
                ["Parent consent", cadetProfile.parentConsentVerified],
              ].map(([label, ok]) => (
                <li key={String(label)} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{label as string}</span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      ok ? "text-success" : "text-warning"
                    }`}
                  >
                    {ok ? <Check className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
                    {ok ? "Verified" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
