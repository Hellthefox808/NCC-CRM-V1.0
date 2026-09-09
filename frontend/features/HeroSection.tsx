import React, { useState } from "react";
import { motion, type Variants } from "motion/react";
import {
  Award,
  ChevronRight,
  Flag,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
  Star,
  CheckCircle2,
  Search,
} from "lucide-react";

interface HeroSectionProps {
  onStartEnrollment: () => void;
  openStatusModal: () => void;
  openStatusModalWithQuery?: (query: string) => void;
  onViewNotices?: () => void;
  onOpenOfficerPortal?: () => void;
  openAiAssistant?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartEnrollment,
  openStatusModal,
  openStatusModalWithQuery,
}) => {
  const [heroAppNoQuery, setHeroAppNoQuery] = useState("");
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
  };

  const stats = [
    { icon: Flag, label: "BATTALION UNIT", value: "19 JHR BN NCC", highlight: "Ranchi HQ" },
    { icon: Award, label: "DIRECTORATE", value: "Bihar & Jharkhand", highlight: "Patna HQ" },
    { icon: Users, label: "CAMPUS COMPANY", value: "SBU Ranchi Coy", highlight: "Active Cadre" },
    {
      icon: GraduationCap,
      label: "CERTIFICATIONS",
      value: "'B' & 'C' Certs",
      highlight: "Govt. Approved",
    },
  ];

  return (
    <section
      id="home-section"
      className="relative isolate min-h-[640px] flex flex-col justify-between overflow-hidden bg-zinc-950 py-12 lg:py-16"
    >
      {/* Tricolor Top Brand Hairline Bar */}
      <div className="ncc-tricolor-bar absolute top-0 inset-x-0 h-1.5 z-30" />

      {/* Background Campus Image — Crystal Clear User Uploaded SBU Campus Photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 brightness-[1.03] contrast-[1.05]"
        style={{
          backgroundImage: `url('/sbu-campus-front.jpg')`,
        }}
        role="img"
        aria-label="Sarala Birla University main administrative campus building, Ranchi"
      />

      {/* Subtle Soft Vignette for Maximum Campus Image Clarity */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {/* Strategic Soft Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-[36rem] w-[36rem] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 z-10 h-[24rem] w-[24rem] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Main Command Hero Card Container — Regimental Glassmorphism */}
      <div className="relative z-20 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 my-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="regimental-glass-panel-elevated relative overflow-hidden rounded-3xl p-6 sm:p-10 lg:p-12 text-center shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-3xl ring-1 ring-inset ring-amber-500/20 dark:ring-amber-400/30"
        >
          {/* Top Tricolor Accent Foil Bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 regimental-tricolor-gradient" />

          <div className="relative z-10 mx-auto max-w-3xl space-y-6">
            {/* Prominent SBU & NCC Crest Logos */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-4 sm:gap-6 pt-1"
            >
              {/* SBU Official Crest */}
              <div className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 border-2 border-amber-600/40 dark:border-amber-400/50 shadow-[0_0_24px_rgba(217,119,6,0.25)] ring-2 ring-blue-900/20 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(217,119,6,0.4)]">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_5fO3j9MhxWCOALUorfuM3nZcChQfc2949oaRRyjpIQ&s=10"
                  alt="Sarala Birla University Emblem"
                  className="w-full h-full object-contain rounded-full p-1 transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Regimental Keyline Divider */}
              <div className="h-10 sm:h-12 w-0.5 bg-gradient-to-b from-transparent via-amber-500/60 to-transparent" />

              {/* NCC Official Crest */}
              <div className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 border-2 border-amber-600/40 dark:border-amber-400/50 shadow-[0_0_24px_rgba(217,119,6,0.25)] ring-2 ring-blue-900/20 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(217,119,6,0.4)]">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZDvUjTIPyVWknpreMHXnyKTvz7-P_uljpSxjPHcXXw&s=10"
                  alt="19 JHR BN NCC Crest"
                  className="w-full h-full object-contain rounded-full p-1 transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            {/* Top Battalion Security Badge */}
            <motion.div variants={itemVariants} className="inline-block">
              <div className="regimental-badge px-4 py-1.5 shadow-xs">
                <ShieldCheck className="h-4 w-4 text-blue-700 dark:text-amber-400 shrink-0" />
                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                  19 JHR BN NCC • SARALA BIRLA UNIVERSITY, RANCHI
                </span>
              </div>
            </motion.div>

            {/* Main Command Title */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 font-display uppercase leading-tight">
                National Cadet Corps
              </h1>
              <p className="text-xs sm:text-sm lg:text-base font-extrabold tracking-[0.22em] text-blue-700 dark:text-amber-400 font-display uppercase pt-0.5">
                Senior Division (SD) &amp; Senior Wing (SW)
              </p>
            </motion.div>

            {/* Official Motto Banner */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="regimental-gold-pill px-5 py-2 shadow-xs">
                <Star className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-current shrink-0" />
                <span className="text-xs sm:text-sm font-black tracking-wider uppercase font-mono">
                  “Ekta aur Anushasan” — Unity and Discipline
                </span>
                <Star className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-current shrink-0" />
              </div>
            </motion.div>

            {/* Description Subtext */}
            <motion.p
              variants={itemVariants}
              className="mx-auto max-w-2xl text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium"
            >
              Official Cadre &amp; Enrollment Portal for Sarala Birla University under{" "}
              <strong className="font-bold text-zinc-950 dark:text-zinc-100">
                19 Jharkhand Battalion NCC (Ranchi)
              </strong>
              , Bihar &amp; Jharkhand Directorate. Enrolling SD (Male) &amp; SW (Female) Cadets for
              the 2026-27 training cycle.
            </motion.p>

            {/* High-Impact Action CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartEnrollment}
                className="hero-cta-btn w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm sm:text-base text-white flex items-center justify-center space-x-3 cursor-pointer tracking-wide transition-all uppercase shadow-lg hover:shadow-blue-500/25"
                id="hero-enroll-now-btn"
              >
                <span>Fill Enrollment Form 2026-27</span>
                <ChevronRight className="w-5 h-5 shrink-0 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={openStatusModal}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 backdrop-blur-md cursor-pointer transition-all uppercase tracking-wider shadow-xs"
                id="hero-track-status-btn"
              >
                <Users className="w-5 h-5 text-blue-600 dark:text-amber-400 shrink-0" />
                <span>Track Application Status</span>
              </motion.button>
            </motion.div>

            {/* Quick 18-Digit Application Number Search Bar */}
            <motion.div variants={itemVariants} className="pt-2 max-w-xl mx-auto w-full">
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-zinc-300 dark:border-zinc-700 p-1.5 shadow-md gap-1.5 sm:gap-0 focus-within:ring-2 focus-within:ring-blue-500/40 dark:focus-within:ring-amber-500/40 transition-all">
                <div className="flex items-center flex-1 min-w-0">
                  <Search className="ml-3 w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={heroAppNoQuery}
                    onChange={(e) =>
                      setHeroAppNoQuery(e.target.value.replace(/[^0-9]/g, "").slice(0, 18))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && heroAppNoQuery.trim()) {
                        if (openStatusModalWithQuery) {
                          openStatusModalWithQuery(heroAppNoQuery.trim());
                        } else {
                          openStatusModal();
                        }
                      }
                    }}
                    placeholder="Enter 18-digit Application No. (e.g. 192026081298471625)..."
                    className="w-full bg-transparent pl-2.5 pr-2 py-2 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-500/70 focus:outline-hidden font-mono"
                    id="hero-app-no-search-input"
                  />
                  {heroAppNoQuery.length > 0 && (
                    <span className="mr-2 text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                      {heroAppNoQuery.length}/18
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (heroAppNoQuery.trim()) {
                      if (openStatusModalWithQuery) {
                        openStatusModalWithQuery(heroAppNoQuery.trim());
                      } else {
                        openStatusModal();
                      }
                    } else {
                      openStatusModal();
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                  id="hero-app-no-search-btn"
                >
                  <span>Search</span>
                </button>
              </div>
              <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 pt-1.5 text-center font-mono">
                🔍 Track application status instantly using your 18-digit Application Number
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Regimental Stats Rail — Glassmorphic Tiles */}
      <div className="relative z-20 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3 }}
                className="regimental-glass-panel rounded-2xl p-4 shadow-md transition-all space-y-1 relative overflow-hidden group hover:border-amber-500/40"
              >
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-amber-400 font-mono">
                    {stat.label}
                  </span>
                  <Icon className="w-4 h-4 text-blue-600 dark:text-amber-400 shrink-0" />
                </div>

                <p className="text-sm sm:text-base font-black text-zinc-950 dark:text-zinc-100 font-display">
                  {stat.value}
                </p>

                <div className="flex items-center space-x-1 pt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                    {stat.highlight}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
