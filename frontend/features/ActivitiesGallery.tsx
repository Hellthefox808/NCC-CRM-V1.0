import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "motion/react";
import {
  Award,
  Calendar,
  Camera,
  CheckCircle2,
  Compass,
  Download,
  FileText,
  Flag,
  Flame,
  Info,
  Layers,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  ExternalLink,
  ChevronRight,
  Clock,
} from "lucide-react";
import { ACTIVITIES_DATA, CAMPS_DATA } from "@/data/nccData";

export const ActivitiesGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeViewMode, setActiveViewMode] = useState<"activities" | "camps">("activities");
  const [campNoticeMessage, setCampNoticeMessage] = useState<string | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll Parallax effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax translation: content moves slightly slower than page scroll to create spatial layering depth
  const rawY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const parallaxY = useSpring(rawY, { stiffness: 220, damping: 30 });

  const categories = [
    { name: "All", label: "All Activities", icon: Layers },
    { name: "Institutional", label: "Institutional Drill", icon: ShieldCheck },
    { name: "Shooting", label: "Rifle Shooting", icon: Target },
    { name: "Camps", label: "National Camps", icon: Calendar },
    { name: "Social Service", label: "Social Service", icon: Flag },
    { name: "Adventure", label: "Adventure Training", icon: Flame },
  ];

  const getCategoryCount = (catName: string) => {
    if (catName === "All") return ACTIVITIES_DATA.length;
    return ACTIVITIES_DATA.filter((a) => a.category === catName).length;
  };

  const filteredActivities =
    selectedCategory === "All"
      ? ACTIVITIES_DATA
      : ACTIVITIES_DATA.filter((a) => a.category === selectedCategory);

  const handleDownloadConsent = (campName: string) => {
    setCampNoticeMessage(
      `Generating Parent Consent Form & Clearance Certificate for ${campName}...`,
    );
    setTimeout(() => {
      alert(
        `Parent Consent Form & Medical Clearance Certificate for "${campName}" downloaded successfully! Please submit it signed by parent/guardian at SBU NCC Office.`,
      );
      setCampNoticeMessage(null);
    }, 1200);
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-border bg-background py-16"
      id="activities-section"
    >
      {/* Background Ambient Depth Accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ opacity: [0.18, 0.38, 0.18], scale: [1, 1.12, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.14, 0.32, 0.14] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
        />
      </div>

      {/* Parallax Content Inner Container */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : parallaxY }}
        className="relative z-10 mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8"
      >
        {/* Header — High Contrast Clear View */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl space-y-3 text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-600/40 bg-blue-50 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700 shadow-xs">
            <Camera className="h-3.5 w-3.5 text-blue-600" strokeWidth={2} />
            Training &amp; Field Record
          </span>
          <h2 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            NCC Camp Activities &amp; Cadre Overview
          </h2>
          <p className="text-sm font-bold leading-relaxed text-zinc-800 sm:text-base">
            Discover battalion training camps, firing ranges, Republic Day trials, adventure
            trekking, and community drives at Sarala Birla University.
          </p>
        </motion.div>

        {/* Primary View Switcher Tabs (Activities vs Camp Overview) — High Contrast */}
        <div className="flex justify-center">
          <div className="inline-flex gap-1.5 rounded-2xl border border-zinc-300 bg-zinc-100/90 p-1.5 backdrop-blur-md shadow-sm">
            {[
              {
                mode: "activities" as const,
                icon: Layers,
                label: `Cadre Activities Gallery (${ACTIVITIES_DATA.length})`,
                id: "view-activities-tab-btn",
              },
              {
                mode: "camps" as const,
                icon: Calendar,
                label: `NCC Camp Directory (${CAMPS_DATA.length})`,
                id: "view-camps-overview-tab-btn",
              },
            ].map(({ mode, icon: Icon, label, id }) => {
              const isActive = activeViewMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setActiveViewMode(mode)}
                  aria-pressed={isActive}
                  id={id}
                  className={`relative flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black outline-none transition-colors duration-200 sm:text-sm ${
                    isActive
                      ? "text-white shadow-md"
                      : "text-zinc-800 hover:text-zinc-950 hover:bg-zinc-200/80"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activities-view-pill"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-md"
                    />
                  )}
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Camp Notice Toast Alert */}
        {campNoticeMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex max-w-2xl items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs font-semibold text-primary shadow-sm sm:text-sm"
          >
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                className="inline-flex"
              >
                <Sparkles className="h-4 w-4 shrink-0" strokeWidth={1.9} />
              </motion.span>
              <span>{campNoticeMessage}</span>
            </div>
          </motion.div>
        )}

        {/* VIEW 1: CAMPS OVERVIEW SECTION */}
        {activeViewMode === "camps" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            className="space-y-8"
          >
            {/* Camp Allowance & Benefits Highlights Banner */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="relative overflow-hidden rounded-[18px] border border-border bg-card p-6 text-left shadow-sm sm:p-8"
            >
              <motion.span
                aria-hidden
                animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
              />

              <div className="relative z-10 grid grid-cols-1 items-center gap-6 md:grid-cols-3">
                <div className="space-y-2.5 md:col-span-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                    <Award className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Ministry of Defence Camp Provisions
                  </span>
                  <h3 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                    100% Funded Camps &amp; Direct Benefit Transfer (DBT)
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                    All National Cadet Corps Annual Training Camps (CATC), Pre-RDC, and TSC camps
                    are fully sponsored by MoD. Cadets receive daily mess allowance, rail travel
                    warrants, uniform allowances, and official SBU academic duty leave.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    onClick={() => handleDownloadConsent("Annual Training Camp 2026")}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md outline-none transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    id="download-parent-consent-banner-btn"
                  >
                    <Download className="h-4 w-4" strokeWidth={2} />
                    <span>Download Consent Slip</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      alert(
                        "Official SBU Duty Leave Rule: Cadets attending NCC Camps get 100% attendance credit for missed university lectures & practicals upon producing Camp Completion Certificate issued by 19 JHR BN NCC.",
                      )
                    }
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-muted/60 px-4 py-2.5 text-xs font-semibold text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    id="sbu-duty-leave-policy-btn"
                  >
                    <Info className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                    <span>SBU Duty Leave Policy</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Camp Cards Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {CAMPS_DATA.map((camp) => (
                <motion.article
                  key={camp.id}
                  variants={{
                    hidden: { opacity: 0, y: 22, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  whileHover={shouldReduceMotion ? undefined : { y: -8 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  tabIndex={0}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[18px] border border-border bg-card shadow-sm outline-none transition-colors duration-300 hover:border-primary/45 hover:shadow-xl focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div>
                    {/* Camp Header Image */}
                    <div className="relative h-44 overflow-hidden bg-muted">
                      <motion.img
                        src={camp.image}
                        alt={`${camp.name} — ${camp.campType ?? "NCC camp"} conducted at ${camp.location}`}
                        loading="lazy"
                        decoding="async"
                        initial={{ scale: 1.06 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full w-full object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-110"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-transparent"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{
                          background:
                            "linear-gradient(to top, color-mix(in oklab, var(--primary) 55%, transparent), transparent 70%)",
                        }}
                      />

                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary backdrop-blur-md">
                        <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                        {camp.level ?? "Battalion"} Level
                      </span>
                      <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-primary to-accent px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                        {camp.vacancies} Seats
                      </span>

                      {/* Camp code plate over image */}
                      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
                        <span className="rounded-lg border border-background/25 bg-background/15 px-2 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-background backdrop-blur-md">
                          {camp.shortCode ?? "NCC"}
                        </span>
                        <span className="rounded-lg bg-background/15 px-2 py-1 text-[10px] font-semibold text-background backdrop-blur-md">
                          {camp.status}
                        </span>
                      </div>
                    </div>

                    {/* Camp Info Body */}
                    <div className="space-y-3.5 p-5 text-left">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                          {camp.campType}
                        </p>
                        <h3 className="text-base font-bold leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-lg">
                          {camp.name}
                        </h3>
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground">
                        {camp.duration && (
                          <div className="flex items-start gap-2 font-semibold text-foreground/85">
                            <Clock
                              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                              strokeWidth={1.75}
                            />
                            <span>{camp.duration}</span>
                          </div>
                        )}

                        <div className="flex items-start gap-2">
                          <MapPin
                            className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                            strokeWidth={1.75}
                          />
                          <span>{camp.location}</span>
                        </div>

                        {camp.conductedBy && (
                          <div className="flex items-start gap-2">
                            <Users
                              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                              strokeWidth={1.75}
                            />
                            <span>Conducted by {camp.conductedBy}</span>
                          </div>
                        )}

                        {camp.eligibility && (
                          <div className="flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/8 p-2.5 font-semibold text-primary">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                            <span>Eligibility: {camp.eligibility}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 border-t border-border pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                          Camp Modules
                        </p>
                        <ul className="flex flex-wrap gap-1.5 text-[11px] text-foreground/85">
                          {(camp.modules ?? []).map((mod, mIdx) => (
                            <motion.li
                              key={mod}
                              initial={{ opacity: 0, y: 6 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.28, delay: mIdx * 0.05 }}
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 px-2 py-1 transition-colors duration-300 group-hover:border-primary/30"
                            >
                              <CheckCircle2
                                className="h-3 w-3 shrink-0 text-primary"
                                strokeWidth={2}
                              />
                              <span>{mod}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {camp.incentive && (
                        <div className="flex items-start gap-2 rounded-xl border border-accent/25 bg-accent/8 p-2.5 text-[11px] font-semibold text-accent">
                          <Award className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                          <span>{camp.incentive}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Camp Action Buttons Footer */}
                  <div className="border-t border-border bg-muted/40 p-4">
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDownloadConsent(camp.name)}
                      className="group/btn flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-3 py-2.5 text-xs font-semibold text-background outline-none transition-colors hover:bg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      id={`download-consent-btn-${camp.id}`}
                    >
                      <Download
                        className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-y-0.5"
                        strokeWidth={2}
                      />
                      <span>Parent Consent &amp; Medical Form</span>
                    </motion.button>
                  </div>

                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary to-accent transition-transform duration-500 group-hover:scale-x-100"
                  />
                </motion.article>
              ))}
            </div>

            {/* Enhanced Camp Action Buttons Section */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="space-y-4 rounded-[18px] border border-border bg-muted/40 p-6 text-center sm:p-8"
            >
              <h4 className="text-lg font-extrabold tracking-tight text-foreground">
                19 JHR Battalion Camp Action Desk
              </h4>
              <p className="mx-auto max-w-2xl text-xs text-muted-foreground sm:text-sm">
                Need clarification regarding Camp Duty Leave, Bank Account DBT Linking for Camp
                Allowances, or Next-of-Kin (NOK) consent details?
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    alert(
                      "Camp Nomination Procedure:\n1. Ensure 'B' or 'C' enrollment is active.\n2. Submit Medical Fitness Certificate from Govt Medical Officer.\n3. Submit Signed Parent Consent Form & Bank Passbook Copy to SBU NCC ANO.",
                    )
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-xs font-bold text-primary-foreground shadow-md outline-none transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  id="camp-nomination-guidelines-btn"
                >
                  <FileText className="h-4 w-4" strokeWidth={2} />
                  <span>Camp Nomination Checklist</span>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownloadConsent("General Annual Training Camp 2026")}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-xs font-semibold text-background outline-none transition-colors hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  id="download-all-consent-forms-btn"
                >
                  <Download className="h-4 w-4" strokeWidth={2} />
                  <span>General Consent Certificate</span>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    alert(
                      "DBT Camp Messing Allowance: Daily allowance of ₹220/day + Travel Warrants are deposited directly into cadet's bank account linked with Aadhaar.",
                    )
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-xs font-semibold text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  id="dbt-allowance-rules-btn"
                >
                  <Info className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <span>DBT Mess Allowance Rules</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* VIEW 2: CADRE ACTIVITIES GALLERY */}
        {activeViewMode === "activities" && (
          <div className="space-y-6">
            {/* Category Filter Tabs — High Contrast Clear View */}
            <div className="space-y-4 text-center">
              <div className="mx-auto inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-zinc-300 bg-zinc-100/90 p-1.5 backdrop-blur-md shadow-sm">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const count = getCategoryCount(cat.name);
                  const isActive = selectedCategory === cat.name;

                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      aria-pressed={isActive}
                      className={`relative flex cursor-pointer select-none items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black outline-none transition-colors duration-200 ${
                        isActive
                          ? "text-white shadow-md"
                          : "text-zinc-800 hover:text-zinc-950 hover:bg-zinc-200/80"
                      }`}
                      id={`activity-tab-${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activity-category-pill"
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                          className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-md"
                        />
                      )}
                      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                      <span>{cat.name}</span>
                      <span
                        className={`ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-black transition-colors ${
                          isActive
                            ? "bg-white/25 text-white"
                            : "bg-white text-zinc-900 border border-zinc-300 shadow-2xs"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Filter Summary Bar */}
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-2 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                  <span>
                    Showing{" "}
                    <strong className="font-bold text-foreground">
                      {filteredActivities.length}
                    </strong>{" "}
                    {filteredActivities.length === 1 ? "activity" : "activities"}
                    {selectedCategory !== "All" && (
                      <>
                        {" "}
                        in{" "}
                        <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 font-bold uppercase tracking-wide text-primary">
                          {selectedCategory}
                        </span>
                      </>
                    )}
                  </span>
                </span>

                {selectedCategory !== "All" && (
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset filter ({ACTIVITIES_DATA.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Activities Cards Grid */}
            <motion.div
              key={selectedCategory}
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredActivities.map((act) => (
                <motion.article
                  key={act.id}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  tabIndex={0}
                  className="group relative flex flex-col overflow-hidden rounded-[18px] border border-border bg-card shadow-sm outline-none transition-colors duration-300 hover:border-primary/45 hover:shadow-xl focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {/* Card Image */}
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={act.image}
                      alt={act.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95"
                    />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary backdrop-blur-md">
                      <Layers className="h-3 w-3" strokeWidth={2} />
                      {act.category}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col space-y-3 p-5 text-left">
                    <h3 className="text-base font-bold leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-lg">
                      {act.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {act.description}
                    </p>

                    <div className="mt-auto space-y-2 border-t border-border pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        Key Highlights
                      </p>
                      <ul className="space-y-1.5 text-xs text-foreground/85">
                        {act.highlights.map((hl, hIdx) => (
                          <motion.li
                            key={hIdx}
                            initial={{ opacity: 0, x: -6 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: hIdx * 0.05 }}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle2
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                              strokeWidth={1.75}
                            />
                            <span>{hl}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary to-accent transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                </motion.article>
              ))}
            </motion.div>
          </div>
        )}
      </motion.div>
    </section>
  );
};
