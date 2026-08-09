import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Flag,
  HeartHandshake,
  Music,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Activity,
  CheckSquare,
  Zap,
  Target,
  MapPin,
  ExternalLink,
  Phone,
  Navigation,
} from "lucide-react";
import {
  BATTALION_DETAILS,
  CERTIFICATE_BENEFITS,
  CORE_VALUES,
  PHYSICAL_FITNESS_STANDARDS,
  REAL_LOCATIONS_DATA,
  SSB_SPECIAL_ENTRY_DETAILS,
} from "@/data/nccData";
import { LeadershipCarousel } from "./LeadershipCarousel";
import { LocationsCarousel } from "./LocationsCarousel";

const PET_TABS = [
  { key: "sd", label: "SD · Male", a11yLabel: "Senior Division, male cadets" },
  { key: "sw", label: "SW · Female", a11yLabel: "Senior Wing, female cadets" },
] as const;

type PetTabKey = (typeof PET_TABS)[number]["key"];

const itemReveal = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export const AboutNCC: React.FC = () => {
  const [showSongModal, setShowSongModal] = useState(false);
  const [activeTab, setActiveTab] = useState<PetTabKey>("sd");
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  return (
    <section className="py-12 bg-white border-b border-zinc-200" id="about-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            What Makes the National Cadet Corps Special?
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
            The National Cadet Corps (NCC) is the youth wing of the Indian Armed Forces.
            Headquartered in New Delhi, it is open to school and college students on a voluntary
            basis, instilling patriotism, character, camaraderie, and selfless service.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {CORE_VALUES.map((pillar, idx) => {
            const PillarIcon =
              ({ ShieldCheck, HeartHandshake, Award, Flag } as Record<string, typeof ShieldCheck>)[
                pillar.icon
              ] ?? ShieldCheck;
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl"
              >
                {/* top hairline reveal */}
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {/* ambient corner glow */}
                <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/15">
                    <PillarIcon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground/70">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="relative mt-5 text-base font-semibold tracking-tight text-foreground">
                  {pillar.title}
                </h3>
                <p className="relative mt-2 text-xs leading-relaxed text-muted-foreground">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Leadership Carousel Section */}
        <LeadershipCarousel autoPlayInterval={4000} />

        {/* Charter: Motto, Aims & Song — Light Coffee Theme */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="coffee-light-card relative overflow-hidden rounded-[22px] p-6 text-left sm:p-10"
        >
          {/* animated ambient washes */}
          <motion.span
            animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#D4C2AB]/40 blur-3xl"
          />
          <motion.span
            animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#8C5E3C]/20 blur-3xl"
          />
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8C5E3C]/50 to-transparent opacity-80" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#6E4A33]/30 to-transparent opacity-60" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14">
            {/* Motto rail */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <div className="coffee-light-badge inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
                <Flag className="h-3.5 w-3.5 text-[#7A5435]" strokeWidth={2} />
                <span>Charter &amp; Motto</span>
              </div>

              <div className="space-y-3">
                <motion.h3
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="text-2xl font-black leading-tight tracking-tight text-[#3B281C] sm:text-[2.25rem]"
                >
                  &ldquo;{BATTALION_DETAILS.motto}&rdquo;
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="text-sm font-bold text-[#7A5435]"
                >
                  {BATTALION_DETAILS.mottoHindi}
                </motion.p>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="h-1 w-20 origin-left rounded-full bg-gradient-to-r from-[#8C5E3C] to-[#5C3D26]"
              />

              <motion.button
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSongModal(true)}
                className="coffee-light-btn group inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E3C] focus-visible:ring-offset-2"
                id="ncc-song-btn"
              >
                <Music className="h-4 w-4 text-[#D6C4B0]" strokeWidth={1.75} />
                <span>Read the NCC Song &mdash; &ldquo;Hum Sab Bharatiya Hain&rdquo;</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D6C4B0]/70 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
              </motion.button>
            </motion.div>

            {/* Aims list */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7A5435]">
                Aims of the Corps
              </p>
              <p className="text-xs leading-relaxed text-[#5C4230] font-medium">
                The NCC develops character, comradeship, discipline, a secular outlook, the spirit
                of adventure and the ideals of selfless service amongst young citizens &mdash;
                creating a pool of organised, trained and motivated youth with leadership qualities
                in all walks of life.
              </p>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {[
                  "Character & discipline",
                  "Secular outlook",
                  "Spirit of adventure",
                  "Selfless service",
                  "Leadership pipeline",
                  "Motivated citizenry",
                ].map((aim, idx) => (
                  <motion.li
                    key={aim}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.06 }}
                    whileHover={{
                      scale: 1.02,
                    }}
                    className="coffee-light-item flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-all shadow-xs"
                  >
                    <span className="mt-px font-mono text-[10px] font-bold tabular-nums text-[#8C5E3C]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[11px] font-bold leading-snug text-[#3B281C]">
                      {aim}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Verified Research: Physical Fitness Benchmarks (SD & SW) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          className="rounded-2xl border border-border bg-card p-6 text-left shadow-2xs sm:p-8"
        >
          <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                <span>Training Standards</span>
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Physical Efficiency Test (PET) Benchmarks
              </h3>
              <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                Qualifying marks published for Senior Division and Senior Wing cadets under
                battalion training orders.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Physical Efficiency Test division"
              aria-orientation="horizontal"
              className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-border bg-muted/50 p-1"
            >
              {PET_TABS.map((tab, index) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    id={`pet-tab-${tab.key}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`pet-panel-${tab.key}`}
                    tabIndex={isActive ? 0 : -1}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    onClick={() => setActiveTab(tab.key)}
                    onKeyDown={(event) => {
                      const last = PET_TABS.length - 1;
                      let next: number | null = null;
                      if (event.key === "ArrowRight" || event.key === "ArrowDown")
                        next = index === last ? 0 : index + 1;
                      else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
                        next = index === 0 ? last : index - 1;
                      else if (event.key === "Home") next = 0;
                      else if (event.key === "End") next = last;
                      if (next === null) return;
                      event.preventDefault();
                      setActiveTab(PET_TABS[next].key);
                      tabRefs.current[next]?.focus();
                    }}
                    className={`relative cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="pet-tab-pill"
                        aria-hidden="true"
                        className="absolute inset-0 rounded-lg bg-card shadow-2xs ring-1 ring-border"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10" aria-hidden="true">
                      {tab.label}
                    </span>
                    <span className="sr-only">{tab.a11yLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Physical Standards Display */}
          {(() => {
            const s =
              activeTab === "sd"
                ? PHYSICAL_FITNESS_STANDARDS.sdMale
                : PHYSICAL_FITNESS_STANDARDS.swFemale;
            const groups =
              activeTab === "sd"
                ? [
                    {
                      icon: Zap,
                      label: "Endurance Test",
                      headline: PHYSICAL_FITNESS_STANDARDS.sdMale.run,
                      rows: [
                        {
                          k: "Excellent",
                          v: PHYSICAL_FITNESS_STANDARDS.sdMale.runTimeExcellent,
                          good: true,
                        },
                        { k: "Qualifying", v: PHYSICAL_FITNESS_STANDARDS.sdMale.runTimeGood },
                      ],
                    },
                    {
                      icon: Activity,
                      label: "Strength Exercises",
                      headline: "Upper Body & Core",
                      rows: [
                        { k: "Pull-ups", v: PHYSICAL_FITNESS_STANDARDS.sdMale.pullups },
                        { k: "Push-ups", v: PHYSICAL_FITNESS_STANDARDS.sdMale.pushups },
                        { k: "Sit-ups", v: PHYSICAL_FITNESS_STANDARDS.sdMale.situps },
                      ],
                    },
                    {
                      icon: Target,
                      label: "Anthropometric Standards",
                      headline: "Height & Chest",
                      rows: [
                        {
                          k: "Min height",
                          v: `${PHYSICAL_FITNESS_STANDARDS.sdMale.minHeightCm} cm`,
                        },
                        { k: "Chest", v: PHYSICAL_FITNESS_STANDARDS.sdMale.minChestCm },
                        { k: "BMI", v: PHYSICAL_FITNESS_STANDARDS.sdMale.bmiRange },
                      ],
                    },
                  ]
                : [
                    {
                      icon: Zap,
                      label: "Endurance Test",
                      headline: PHYSICAL_FITNESS_STANDARDS.swFemale.run,
                      rows: [
                        {
                          k: "Excellent",
                          v: PHYSICAL_FITNESS_STANDARDS.swFemale.runTimeExcellent,
                          good: true,
                        },
                        { k: "Qualifying", v: PHYSICAL_FITNESS_STANDARDS.swFemale.runTimeGood },
                      ],
                    },
                    {
                      icon: Activity,
                      label: "Agility & Core",
                      headline: "Flexibility & Speed",
                      rows: [
                        { k: "Shuttle run", v: PHYSICAL_FITNESS_STANDARDS.swFemale.shuttleRun },
                        {
                          k: "Core strength",
                          v: PHYSICAL_FITNESS_STANDARDS.swFemale.flexedArmHang,
                        },
                      ],
                    },
                    {
                      icon: Target,
                      label: "Anthropometric Standards",
                      headline: "Height & BMI",
                      rows: [
                        {
                          k: "Min height",
                          v: `${PHYSICAL_FITNESS_STANDARDS.swFemale.minHeightCm} cm`,
                        },
                        { k: "BMI", v: PHYSICAL_FITNESS_STANDARDS.swFemale.bmiRange },
                      ],
                    },
                  ];
            void s;
            return (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  id={`pet-panel-${activeTab}`}
                  role="tabpanel"
                  aria-labelledby={`pet-tab-${activeTab}`}
                  tabIndex={0}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }}
                  className="mt-6 grid grid-cols-1 gap-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card md:grid-cols-3"
                >
                  {groups.map((g, gi) => {
                    const GroupIcon = g.icon;
                    return (
                      <motion.div
                        key={g.label}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: 0.06 + gi * 0.07,
                          ease: [0.22, 1, 0.36, 1] as const,
                        }}
                        whileHover={{ y: -3 }}
                        className="group rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex items-center gap-2">
                          <motion.span
                            whileHover={{ scale: 1.08, rotate: -4 }}
                            transition={{ type: "spring", stiffness: 320, damping: 18 }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
                          >
                            <GroupIcon className="h-4 w-4" strokeWidth={1.75} />
                          </motion.span>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {g.label}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-semibold tracking-tight text-foreground">
                          {g.headline}
                        </p>
                        <dl className="mt-3 divide-y divide-border/70 border-t border-border/70 text-xs">
                          {g.rows.map((r, ri) => (
                            <motion.div
                              key={r.k}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.14 + gi * 0.07 + ri * 0.05 }}
                              className="flex items-start justify-between gap-3 py-2"
                            >
                              <dt className="text-muted-foreground">{r.k}</dt>
                              <dd
                                className={`text-right font-medium tabular-nums ${
                                  "good" in r && r.good ? "text-emerald-600" : "text-foreground"
                                }`}
                              >
                                {r.v}
                              </dd>
                            </motion.div>
                          ))}
                        </dl>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            );
          })()}

          {/* Medical mandatory bullets */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative mt-6 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-5"
          >
            <motion.span
              aria-hidden="true"
              animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.12, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-2xl"
            />
            <h4 className="relative flex items-center gap-2 text-xs font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <span>Mandatory Medical Fitness Standards</span>
            </h4>
            <div className="relative mt-3 grid grid-cols-1 gap-3 text-[11px] leading-relaxed text-muted-foreground sm:grid-cols-3">
              {PHYSICAL_FITNESS_STANDARDS.medicalMandatory.map((med, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-2"
                >
                  <CheckCircle2
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                    strokeWidth={1.75}
                  />
                  <span>{med}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* SSB Special Entry Highlight Banner — Indian Army Olive Green & Regimental Gold Theme */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.09,
                delayChildren: 0.1,
              },
            },
          }}
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="army-theme-card group relative overflow-hidden rounded-[22px] p-6 text-left shadow-xl transition-all duration-500 sm:p-8"
        >
          {/* Animated Ambient Army Gold Glare */}
          <motion.span
            aria-hidden
            animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.12, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#C5A059]/20 blur-3xl"
          />
          <motion.span
            aria-hidden
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-[#3E4F28]/40 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C5A059] via-[#E6C687] to-[#8C6D2B]"
          />

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <motion.div
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } },
                }}
                className="max-w-2xl space-y-3"
              >
                <motion.span
                  variants={itemReveal}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="army-theme-badge inline-flex cursor-default items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]"
                >
                  <motion.span
                    animate={{ rotate: [0, 18, 0, -18, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex text-[#E6C687]"
                  >
                    <Star className="h-3 w-3 fill-[#E6C687]" strokeWidth={2} />
                  </motion.span>
                  Direct Officer Entry
                </motion.span>
                <motion.h3
                  variants={itemReveal}
                  className="text-2xl font-black tracking-tight text-[#FAF7F2] sm:text-3xl"
                >
                  {SSB_SPECIAL_ENTRY_DETAILS.schemeName}
                </motion.h3>
                <motion.p variants={itemReveal} className="text-sm font-black text-[#E6C687]">
                  {SSB_SPECIAL_ENTRY_DETAILS.noExamAdvantage}
                </motion.p>
                <motion.p
                  variants={itemReveal}
                  className="text-xs font-bold leading-relaxed text-[#DFD7C6] sm:text-[13px]"
                >
                  Cadets holding a 'C' Certificate with Grade 'A' or 'B' can appear directly for the
                  5-day SSB Interview for {SSB_SPECIAL_ENTRY_DETAILS.cadre} — bypassing the UPSC CDS
                  written examination entirely. Vacancies: {SSB_SPECIAL_ENTRY_DETAILS.vacancies}.
                </motion.p>
              </motion.div>

              <motion.dl
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, staggerChildren: 0.07 },
                  },
                }}
                tabIndex={0}
                className="army-theme-box shrink-0 space-y-2.5 rounded-2xl p-5 text-xs outline-none transition-all duration-300 shadow-md lg:max-w-xs lg:min-w-64"
              >
                {[
                  { k: "Training Academy", v: "OTA Chennai" },
                  { k: "Duration", v: "49 Weeks" },
                  { k: "Commission", v: "Short Service (SSC)" },
                  { k: "Annual Vacancies", v: "100 Cadets" },
                ].map((row, i, arr) => (
                  <motion.div
                    key={row.k}
                    variants={itemReveal}
                    className={`group/row flex items-center justify-between gap-3 rounded-md px-1 py-1 transition-colors duration-200 ${i < arr.length - 1 ? "border-b border-[#C5A059]/35 pb-2" : ""}`}
                  >
                    <dt className="font-bold text-[#C5A059]">
                      {row.k}
                    </dt>
                    <dd className="font-black text-[#FAF7F2]">
                      {row.v}
                    </dd>
                  </motion.div>
                ))}
              </motion.dl>
            </div>

            <div className="grid grid-cols-1 gap-6 border-t border-[#C5A059]/40 pt-6 md:grid-cols-2">
              <motion.div
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
                className="space-y-3"
              >
                <motion.h4
                  variants={itemReveal}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#E6C687]"
                >
                  <CheckSquare className="h-4 w-4 text-[#C5A059]" strokeWidth={2} />
                  Eligibility Criteria
                </motion.h4>
                <ul className="space-y-1.5">
                  {SSB_SPECIAL_ENTRY_DETAILS.eligibility.map((item) => (
                    <motion.li
                      key={item}
                      variants={itemReveal}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 320, damping: 24 }}
                      tabIndex={0}
                      className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-xs font-semibold leading-relaxed text-[#E8DCC4] outline-none transition-colors duration-200 hover:bg-[#3E4F28]/50"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#A4C078]"
                        strokeWidth={2}
                      />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
                className="space-y-3"
              >
                <motion.h4
                  variants={itemReveal}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#E6C687]"
                >
                  <Target className="h-4 w-4 text-[#C5A059]" strokeWidth={2} />
                  Selection Pipeline
                </motion.h4>
                <ol className="space-y-1.5">
                  {SSB_SPECIAL_ENTRY_DETAILS.selectionPhases.map((phase, i) => (
                    <motion.li
                      key={phase}
                      variants={itemReveal}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 320, damping: 24 }}
                      tabIndex={0}
                      className="group/phase flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-xs font-semibold leading-relaxed text-[#E8DCC4] outline-none transition-colors duration-200 hover:bg-[#3E4F28]/50"
                    >
                      <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#C5A059] bg-[#3E4F28] text-[10px] font-black text-[#E6C687]">
                        {i + 1}
                      </span>
                      <span>{phase}</span>
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Researched Real Location & Map Directions Section */}
        <LocationsCarousel />

        {/* Certificate Perks & Benefits Section with Stitched Badge Layout */}
        <div className="space-y-6">
          <div className="text-left space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 bg-blue-600/10 border border-blue-600/30 px-3 py-1 rounded-full text-xs font-bold text-blue-700 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-blue-700" />
              <span>Cadet Merit & Incentives</span>
            </div>
            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
              Incentives & Career Benefits for SBU NCC Cadets
            </h3>
            <p className="text-xs text-zinc-600">
              Why joining 19 JHR BN NCC at Sarala Birla University gives you a significant career
              advantage in Defence, Police, and Corporate sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CERTIFICATE_BENEFITS.map((item, idx) => (
              <div
                key={idx}
                className="group relative bg-linear-to-b from-white via-zinc-50/50 to-zinc-100/80 border-2 border-zinc-300 hover:border-blue-600/80 rounded-2xl p-6 text-left shadow-md hover:shadow-xl transition-all duration-300 space-y-4 outline-1 outline-dashed outline-zinc-300 group-hover:outline-blue-500/80 outline-offset-[-7px]"
              >
                {/* Stitched Corner Accent Pins */}
                <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-blue-500/60 border border-blue-700/40" />
                <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-blue-500/60 border border-blue-700/40" />
                <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-blue-500/60 border border-blue-700/40" />
                <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-blue-500/60 border border-blue-700/40" />

                <div className="flex items-center justify-between border-b-2 border-dashed border-zinc-200 group-hover:border-blue-300 pb-3 transition-colors">
                  <div className="flex items-center space-x-2 text-[#18181B] font-black text-base">
                    <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-700 shadow-2xs">
                      <Award className="w-5 h-5 text-blue-700 shrink-0" />
                    </div>
                    <span>{item.cert}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-700 font-medium">
                  {item.benefits.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Official NCC Act: Cessation of Enrollment & Discharge Rules Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.08,
                delayChildren: 0.08,
              },
            },
          }}
          className="group relative overflow-hidden rounded-[18px] border border-border bg-card p-6 text-left shadow-sm transition-colors duration-500 hover:border-primary/40 sm:p-8"
        >
          <motion.span
            aria-hidden
            animate={{ opacity: [0.18, 0.4, 0.18], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
          />

          <div className="relative z-10 space-y-6">
            <motion.div
              variants={itemReveal}
              className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-center"
            >
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Statutory Regulations • NCC Act 1948
                </span>
                <h3 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Cessation of Enrollment &amp; Discharge Regulations
                </h3>
              </div>
              <span className="rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
                19 JHR BN NCC • SBU Battalion Standing Orders
              </span>
            </motion.div>

            <motion.p
              variants={itemReveal}
              className="max-w-4xl text-xs leading-relaxed text-muted-foreground sm:text-[13px]"
            >
              As mandated under Section 12 &amp; 13 of the National Cadet Corps Act 1948 and Rule 13
              of NCC Rules, enrollment in Senior Division / Senior Wing at Sarala Birla University
              shall cease under the following statutory circumstances:
            </motion.p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                {
                  title: "Completion of Tenure & Graduation",
                  body: "On completion of the prescribed 3-year tenure in Senior Division/Wing or on ceasing to be a regular student of Sarala Birla University, Ranchi.",
                },
                {
                  title: "Medical Unfitness / Discharge",
                  body: "If certified by a Military Medical Officer or Registered Medical Practitioner as permanently unfit for further drill and physical training.",
                },
                {
                  title: "Voluntary Resignation with Approval",
                  body: "On application by the cadet submitted through the Associate NCC Officer (ANO) to the Commanding Officer 19 JHR BN NCC, citing genuine academic or medical reasons.",
                },
                {
                  title: "Disciplinary Discharge & Equipment Return",
                  body: "If discharged for indiscipline or failing parade attendance (<75%). All issued uniform items, badges, and equipment must be returned to 19 JHR BN Stores.",
                },
              ].map((clause, i) => (
                <motion.div
                  key={clause.title}
                  variants={itemReveal}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  tabIndex={0}
                  className="group/clause relative space-y-2 overflow-hidden rounded-2xl border border-border bg-muted/40 p-4 outline-none transition-colors duration-300 hover:border-primary/40 hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-gradient-to-b from-primary to-accent transition-transform duration-300 group-hover/clause:scale-y-100 group-focus-visible/clause:scale-y-100"
                  />
                  <h4 className="flex items-start gap-2 text-xs font-bold text-foreground">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[10px] font-bold text-primary transition-colors duration-300 group-hover/clause:border-primary group-hover/clause:bg-primary/20">
                      {i + 1}
                    </span>
                    <span>{clause.title}</span>
                  </h4>
                  <p className="pl-7 text-xs leading-relaxed text-muted-foreground">
                    {clause.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Song Modal */}
      {showSongModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-zinc-300 text-left relative">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <div className="flex items-center space-x-2">
                <Music className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-bold text-zinc-900">
                  {BATTALION_DETAILS.nccSongTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowSongModal(false)}
                className="text-zinc-500 hover:text-zinc-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-800 leading-relaxed bg-blue-50/60 p-4 rounded-xl border border-blue-200 max-h-80 overflow-y-auto">
              {BATTALION_DETAILS.nccSongLyrics}
            </pre>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowSongModal(false)}
                className="bg-zinc-900 text-white font-bold text-xs px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
