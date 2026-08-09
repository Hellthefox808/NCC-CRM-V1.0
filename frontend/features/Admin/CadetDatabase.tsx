import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Database,
  Download,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { EnterpriseDataPlatform, type CadetRegisterRecord } from "@backend/services/dataPlatform";

const PAGE_SIZE = 25;

const BATCHES = ["BATCH-I", "BATCH-II"] as const;
const WINGS = ["SD", "SW"] as const;

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}

function Chip({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "primary" | "accent";
}) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent-foreground",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function CadetDatabase() {
  const [cadets, setCadets] = useState<CadetRegisterRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [batch, setBatch] = useState("");
  const [wing, setWing] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [selected, setSelected] = useState<CadetRegisterRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await EnterpriseDataPlatform.getCadets({
        search,
        batch,
        wing,
        page,
        limit: PAGE_SIZE,
      });
      setCadets(res.data?.cadets ?? []);
      setTotal(res.data?.total ?? 0);
      setTotalPages(res.data?.totalPages ?? 1);
    } catch (err: any) {
      setError(err?.message || "Unable to load the cadet register.");
      setCadets([]);
    } finally {
      setLoading(false);
    }
  }, [search, batch, wing, page]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const syncRoster = async () => {
    setSyncing(true);
    try {
      await EnterpriseDataPlatform.syncCadetRegister();
      setPage(1);
      await load();
    } catch (err: any) {
      setError(err?.message || "Roster sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const exportCsv = () => {
    const columns: Array<[string, keyof CadetRegisterRecord]> = [
      ["Enrollment ID", "enrollmentId"],
      ["Batch", "batch"],
      ["Rank", "rank"],
      ["Name", "fullName"],
      ["Wing", "wing"],
      ["SBU ID", "sbuId"],
      ["Course", "course"],
      ["Branch", "branch"],
      ["Semester", "semester"],
      ["Section", "section"],
      ["Mobile", "mobile"],
      ["Email", "email"],
      ["Blood Group", "bloodGroup"],
      ["Father", "fatherName"],
      ["NOK Contact", "nokContact"],
    ];
    const rows = [
      columns.map(([label]) => label).join(","),
      ...cadets.map((cadet) =>
        columns.map(([, key]) => `"${String(cadet[key] ?? "").replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([rows], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `19-JHR-BN-SBU-cadet-register-page-${page}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const sd = cadets.filter((cadet) => cadet.wing === "SD").length;
    return { sd, sw: cadets.length - sd };
  }, [cadets]);

  const activeFilters = [batch, wing].filter(Boolean).length;

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Database className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            19 Jharkhand Battalion · Gp HQ Ranchi
          </div>
          <h1 className="mt-2 font-[var(--font-display,inherit)] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cadet Database
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Consolidated nominal roll of Sarala Birla University cadets — enrollment particulars,
            academic posting, next-of-kin, stipend and service record for Batch-I and Batch-II.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={!cadets.length}
            className="inline-flex items-center gap-2 rounded-[14px] border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export page (CSV)
          </button>
          <button
            type="button"
            onClick={syncRoster}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-[14px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
            Sync nominal roll
          </button>
        </div>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Cadets on register", value: total, icon: Users },
          { label: "Senior Division (page)", value: stats.sd, icon: BadgeCheck },
          { label: "Senior Wing (page)", value: stats.sw, icon: BadgeCheck },
        ].map((card) => (
          <div key={card.label} className="rounded-[18px] border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {card.label}
              </span>
              <card.icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[18px] border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/40 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label className="sr-only" htmlFor="cadet-search">
              Search cadets by name, enrollment ID, SBU ID or mobile
            </label>
            <input
              id="cadet-search"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search name, enrollment ID, SBU ID, mobile…"
              className="w-full rounded-[14px] border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              Filters{activeFilters ? ` (${activeFilters})` : ""}
            </span>
            <label className="sr-only" htmlFor="cadet-batch">
              Filter by batch
            </label>
            <select
              id="cadet-batch"
              value={batch}
              onChange={(event) => {
                setPage(1);
                setBatch(event.target.value);
              }}
              className="rounded-[14px] border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
            >
              <option value="">All batches</option>
              {BATCHES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="cadet-wing">
              Filter by wing
            </label>
            <select
              id="cadet-wing"
              value={wing}
              onChange={(event) => {
                setPage(1);
                setWing(event.target.value);
              }}
              className="rounded-[14px] border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
            >
              <option value="">SD &amp; SW</option>
              {WINGS.map((option) => (
                <option key={option} value={option}>
                  {option === "SD" ? "Senior Division (SD)" : "Senior Wing (SW)"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-3 p-6">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-destructive" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-foreground">{error}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The register holds cadet personal data and is restricted to signed-in ANO / officer
                sessions.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 p-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading cadet register…
          </div>
        ) : !cadets.length ? (
          <div className="p-12 text-center">
            <Database className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-foreground">No cadets match this view</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Clear the filters, or run “Sync nominal roll” to load the Batch-I and Batch-II rolls.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Cadet register of 19 Jharkhand Battalion NCC at Sarala Birla University
              </caption>
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Cadet
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Enrollment ID
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Batch / Wing
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Academic posting
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Contact
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Stipend
                  </th>
                  <th scope="col" className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {cadets.map((cadet) => (
                  <tr
                    key={cadet.id}
                    className="border-b border-border/60 transition hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{cadet.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {cadet.rank} · {cadet.bloodGroup || "Blood group NR"}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                      {cadet.enrollmentId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Chip tone="primary">{cadet.batch}</Chip>
                        <Chip>{cadet.wing}</Chip>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">
                        {cadet.course || "—"}
                        {cadet.branch ? ` · ${cadet.branch}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {cadet.sbuId || "SBU ID pending"}
                        {cadet.semester ? ` · Sem ${cadet.semester}` : ""}
                        {cadet.section ? ` · Sec ${cadet.section}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="tabular-nums text-foreground">{cadet.mobile || "—"}</div>
                      <div className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {cadet.email || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {cadet.stipendReceived ? (
                        <Chip tone="accent">{cadet.stipendReceived}</Chip>
                      ) : (
                        <Chip>Pending</Chip>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(cadet)}
                        className="rounded-[12px] border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
                      >
                        View record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && cadets.length ? (
          <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground tabular-nums">{cadets.length}</span> of{" "}
              <span className="font-semibold text-foreground tabular-nums">{total}</span> cadets ·
              page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="rounded-[12px] border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
                className="rounded-[12px] border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {selected ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Service record of ${selected.fullName}`}
          className="fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="h-full w-full max-w-xl overflow-y-auto border-l border-border bg-card p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5">
                  <Chip tone="primary">{selected.batch}</Chip>
                  <Chip>{selected.wing}</Chip>
                  <Chip>{selected.rank}</Chip>
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {selected.fullName}
                </h2>
                <p className="font-mono text-xs text-muted-foreground">{selected.enrollmentId}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close cadet record"
                className="rounded-[12px] border border-border p-2 text-muted-foreground transition hover:bg-muted"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {[
              {
                title: "Personal particulars",
                fields: [
                  ["Date of birth", selected.dob],
                  ["Gender", selected.gender],
                  ["Blood group", selected.bloodGroup],
                  ["Identification mark", selected.identificationMark],
                  ["Father", selected.fatherName],
                  ["Mother", selected.motherName],
                  ["Nationality", selected.nationality],
                  ["Medical complaint", selected.medicalComplaint],
                ],
              },
              {
                title: "Unit & institute",
                fields: [
                  ["Group HQ", selected.groupHq],
                  ["Wing type", selected.wingType],
                  ["ANO", selected.anoName],
                  ["Institute", selected.institute],
                ],
              },
              {
                title: "Academic posting",
                fields: [
                  ["SBU ID", selected.sbuId],
                  ["Course", selected.course],
                  ["Branch", selected.branch],
                  ["Semester", selected.semester],
                  ["Section", selected.section],
                ],
              },
              {
                title: "Contact & address",
                fields: [
                  ["Mobile", selected.mobile],
                  ["Email", selected.email],
                  ["Address", selected.address],
                  ["Nearest railway station", selected.nearestRailwayStation],
                ],
              },
              {
                title: "Next of kin",
                fields: [
                  ["Name", selected.nokName],
                  ["Relationship", selected.nokRelationship],
                  ["Contact", selected.nokContact],
                  ["Address", selected.nokAddress],
                ],
              },
              {
                title: "Stipend & documents",
                fields: [
                  ["Aadhaar", selected.aadhaarNumber],
                  ["Bank account", selected.bankAccountNumber],
                  ["IFSC", selected.ifscCode],
                  ["Account holder", selected.accountHolderName],
                  ["Stipend received", selected.stipendReceived],
                ],
              },
              {
                title: "Activities & declarations",
                fields: [
                  ["Sports / games", selected.sportsGames],
                  ["Co-curricular", selected.coCurricular],
                  ["Willing for military training", selected.willingMilitaryTraining],
                  ["Willing to serve NCC", selected.willingServeNcc],
                  ["Previously applied", selected.previouslyApplied],
                ],
              },
              {
                title: "Service record",
                fields: [
                  ["Performance", selected.performance],
                  ["Behaviour", selected.behaviour],
                  ["Participation", selected.participation],
                  ["Distinction", selected.distinction],
                ],
              },
            ].map((group) => (
              <section
                key={group.title}
                className="mt-6 rounded-[16px] border border-border bg-background p-5"
              >
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                  {group.title}
                </h3>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  {group.fields.map(([label, value]) => (
                    <Field
                      key={label as string}
                      label={label as string}
                      value={value as string | null}
                    />
                  ))}
                </dl>
              </section>
            ))}

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Aadhaar and bank account numbers are shown partially masked. Personal data of cadets
              is restricted to officer sessions under the unit’s data-handling policy.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
