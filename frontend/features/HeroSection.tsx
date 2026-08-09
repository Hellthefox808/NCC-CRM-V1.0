import React from "react";
import { motion } from "motion/react";
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
} from "lucide-react";

interface HeroSectionProps {
  onStartEnrollment: () => void;
  openStatusModal: () => void;
  onViewNotices?: () => void;
  onOpenOfficerPortal?: () => void;
  openAiAssistant?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartEnrollment,
  openStatusModal,
}) => {
  const containerVariants: any = {
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

  const itemVariants: any = {
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
    { icon: GraduationCap, label: "CERTIFICATIONS", value: "'B' & 'C' Certs", highlight: "Govt. Approved" },
  ];

  return (
    <section
      id="home-section"
      className="relative isolate min-h-[640px] flex flex-col justify-between overflow-hidden bg-zinc-950 py-12 lg:py-16"
    >
      {/* Tricolor Top Brand Hairline Bar */}
      <div className="ncc-tricolor-bar absolute top-0 inset-x-0 h-1.5 z-30" />

      {/* Background Campus Image — Sarala Birla University main campus photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('/sbu-campus-front.jpg')`,
        }}
        role="img"
        aria-label="Sarala Birla University main administrative campus building, Ranchi"
      />

      {/* High Contrast Cinematic Vignette & Ambient Glows */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-zinc-950/80 via-zinc-950/50 to-zinc-950/90" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_30%,#09090b_95%)] opacity-80" />
      
      {/* Strategic Command Spotlight Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-[36rem] w-[36rem] rounded-full bg-blue-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 z-10 h-[24rem] w-[24rem] rounded-full bg-amber-500/15 blur-[120px] pointer-events-none" />

      {/* Main Command Hero Card Container */}
      <div className="relative z-20 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 my-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-zinc-950/80 p-6 sm:p-10 lg:p-12 text-center shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl ring-1 ring-inset ring-white/15"
        >
          {/* Top Gold Foil Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500" />

          <div className="relative z-10 mx-auto max-w-3xl space-y-6">
            {/* Prominent SBU & NCC Crest Logos */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 pt-1">
              {/* SBU Official Crest */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-900/90 p-1 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.35)] ring-2 ring-white/20 flex items-center justify-center overflow-hidden transition-transform hover:scale-105">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_5fO3j9MhxWCOALUorfuM3nZcChQfc2949oaRRyjpIQ&s=10"
                  alt="Sarala Birla University Emblem"
                  className="w-full h-full object-contain rounded-full bg-white p-1"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Vertical Gold Keyline Accent */}
              <div className="h-10 w-0.5 bg-gradient-to-b from-transparent via-amber-400/70 to-transparent" />

              {/* NCC Official Crest */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-900/90 p-1 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.35)] ring-2 ring-white/20 flex items-center justify-center overflow-hidden transition-transform hover:scale-105">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZDvUjTIPyVWknpreMHXnyKTvz7-P_uljpSxjPHcXXw&s=10"
                  alt="19 JHR BN NCC Crest"
                  className="w-full h-full object-contain rounded-full bg-white p-1"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            {/* Top Battalion Security Badge */}
            <motion.div variants={itemVariants} className="inline-block">
              <div className="brass-badge inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-200">
                  19 JHR BN NCC • SARALA BIRLA UNIVERSITY, RANCHI
                </span>
              </div>
            </motion.div>

            {/* Main Command Title */}
            <motion.div variants={itemVariants} className="space-y-1">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-display uppercase leading-none">
                National Cadet Corps
              </h1>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight gold-metallic-text font-display uppercase leading-tight pt-1">
                Senior Division & Senior Wing
              </h2>
            </motion.div>

            {/* Official Motto Banner */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 px-5 py-2 backdrop-blur-md shadow-md">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-extrabold tracking-wider text-amber-200 uppercase font-mono">
                  “Ekta aur Anushasan” — Unity and Discipline
                </span>
                <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
              </div>
            </motion.div>

            {/* Description Subtext */}
            <motion.p
              variants={itemVariants}
              className="mx-auto max-w-2xl text-xs sm:text-sm leading-relaxed text-zinc-300 font-medium"
            >
              Official Cadre & Enrollment Portal for Sarala Birla University under{" "}
              <strong className="font-extrabold text-white">
                19 Jharkhand Battalion NCC (Ranchi)
              </strong>
              , Bihar & Jharkhand Directorate. Enrolling SD (Male) & SW (Female) Cadets for 2026-27.
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
                className="hero-cta-btn w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-black text-sm sm:text-base flex items-center justify-center space-x-3 cursor-pointer tracking-wide transition-all uppercase"
                id="hero-enroll-now-btn"
              >
                <span>Fill Enrollment Form 2026-27</span>
                <ChevronRight className="w-5 h-5 shrink-0 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={openStatusModal}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2.5 backdrop-blur-md cursor-pointer transition-all uppercase tracking-wider"
                id="hero-track-status-btn"
              >
                <Users className="w-5 h-5 text-blue-400 shrink-0" />
                <span>Track Application Status</span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Regimental Stats Rail */}
      <div className="relative z-20 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3 }}
                className="bg-zinc-950/85 border border-amber-500/25 rounded-2xl p-4 shadow-xl backdrop-blur-xl transition-all space-y-1 relative overflow-hidden group"
              >
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/90 font-mono">
                    {stat.label}
                  </span>
                  <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
                
                <p className="text-sm sm:text-base font-black text-white font-display">
                  {stat.value}
                </p>

                <div className="flex items-center space-x-1 pt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-[10px] font-bold text-zinc-400">
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
