import React from "react";
import { motion } from "motion/react";
import { 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  FileCheck2, 
  FileSpreadsheet, 
  Flag, 
  GraduationCap, 
  ShieldCheck, 
  Sparkles, 
  Users 
} from "lucide-react";
import { BATTALION_DETAILS } from "../data/nccData";

interface HeroSectionProps {
  onStartEnrollment: () => void;
  openStatusModal: () => void;
  onViewNotices: () => void;
  onOpenOfficerPortal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartEnrollment,
  openStatusModal,
  onViewNotices,
  onOpenOfficerPortal
}) => {
  // Motion variants for stagger entrance
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 }
    }
  };

  return (
    <section className="bg-slate-900 border-b border-slate-200 relative overflow-hidden min-h-[520px] flex items-center justify-center">
      {/* SBU University Front Campus Background Image - Vivid, High Contrast & Crisp */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 brightness-105 contrast-105 saturate-110 scale-[1.02] hover:scale-[1.04]"
        style={{ backgroundImage: `url('https://sbu.ac.in/Images/University-Pics/University-front.jpg')` }}
      />
      {/* Dynamic cinematic gradient overlays to keep campus background rich while ensuring high text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/60 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#002147]/50 via-transparent to-[#002147]/50 z-10" />

      {/* Decorative Subtle Vignette & Warm Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,18,41,0.65)_100%)] pointer-events-none z-10" />

      {/* Glassmorphism Main Card Container */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 my-6 sm:my-8 lg:my-10 p-6 sm:p-8 lg:p-10 relative z-20 bg-gradient-to-b from-[#002147]/85 via-[#001c3d]/80 to-[#001229]/90 backdrop-blur-2xl border border-white/25 rounded-3xl shadow-2xl text-center ring-2 ring-yellow-400/30 shadow-yellow-500/15"
      >
        <div className="max-w-3xl mx-auto space-y-5">
          
          {/* Institution Badge */}
          <motion.div variants={itemVariants} className="inline-block">
            <div className="inline-flex items-center space-x-2 bg-white/95 backdrop-blur-md border border-yellow-500/70 rounded-full px-4 py-1.5 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 transition-all ring-1 ring-yellow-400/20 group cursor-default">
              <ShieldCheck className="w-4 h-4 text-[#002147] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-xs shadow-yellow-500" />
              <span className="text-xs font-bold text-[#002147] tracking-wider uppercase">
                19 JHR BN NCC • Sarala Birla University, Ranchi
              </span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              National Cadet Corps <br />
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-500 border-b-2 sm:border-b-4 border-yellow-400 pb-1 shadow-yellow-500/20">
                Senior Division & Senior Wing
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-yellow-300 pt-0.5 drop-shadow-md flex items-center justify-center space-x-2 tracking-wide">
              <span className="bg-yellow-400/10 border border-yellow-400/40 px-3.5 py-1 rounded-full text-yellow-300 shadow-inner">
                "Ekta aur Anushasan" — Unity and Discipline
              </span>
            </p>
          </motion.div>

          {/* Subtext */}
          <motion.p variants={itemVariants} className="text-slate-100 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-medium drop-shadow-xs">
            Official NCC Enrollment & Cadre Portal for Sarala Birla University, Ranchi under 
            <strong className="text-white font-bold"> 19 Jharkhand Battalion NCC (Ranchi)</strong> and 
            <strong className="text-white font-bold"> Bihar & Jharkhand Directorate</strong>.
          </motion.p>

          {/* Motion Glassmorphism Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            {/* Primary Motion Glass Button */}
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onStartEnrollment}
              className="relative overflow-hidden group bg-gradient-to-r from-[#002147] via-[#001838] to-[#000d20] text-white font-extrabold px-6 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 transition-all cursor-pointer border border-yellow-400/80 ring-2 ring-yellow-500/30 text-sm sm:text-base backdrop-blur-md"
              id="hero-enroll-now-btn"
            >
              {/* Shimmer Sweep Animation */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out pointer-events-none" />
              <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0 group-hover:rotate-6 transition-transform" />
              <span className="tracking-wide">Fill Enrollment Form 2026</span>
              <ChevronRight className="w-4 h-4 text-white/80 shrink-0 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Secondary Motion Glass Button */}
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={openStatusModal}
              className="relative overflow-hidden group bg-white/95 backdrop-blur-md hover:bg-white text-[#002147] font-extrabold px-5 py-3 rounded-xl shadow-md flex items-center space-x-2 border border-slate-200 transition-all cursor-pointer text-sm sm:text-base hover:border-yellow-500/60 ring-1 ring-black/5"
              id="hero-track-status-btn"
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#002147] shrink-0 group-hover:scale-110 transition-transform" />
              <span>Track Application</span>
            </motion.button>
          </motion.div>

          {/* Key Quick Highlights Row with Glass Cards */}
          <motion.div variants={itemVariants} className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
            <motion.div 
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 text-center shadow-xs hover:shadow-md transition-all group flex flex-col items-center justify-center"
            >
              <div className="flex items-center space-x-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <Flag className="w-3 h-3 text-[#002147]" />
                <span>Unit</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-[#002147] mt-0.5 group-hover:text-amber-600 transition-colors">19 JHR BN NCC</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 text-center shadow-xs hover:shadow-md transition-all group flex flex-col items-center justify-center"
            >
              <div className="flex items-center space-x-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <Award className="w-3 h-3 text-[#002147]" />
                <span>Directorate</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-[#002147] mt-0.5 group-hover:text-amber-600 transition-colors">Bihar & Jharkhand</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 text-center shadow-xs hover:shadow-md transition-all group flex flex-col items-center justify-center"
            >
              <div className="flex items-center space-x-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <Users className="w-3 h-3 text-[#002147]" />
                <span>Campus Unit</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-[#002147] mt-0.5 group-hover:text-amber-600 transition-colors">SBU Ranchi Coy</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 text-center shadow-xs hover:shadow-md transition-all group flex flex-col items-center justify-center"
            >
              <div className="flex items-center space-x-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <GraduationCap className="w-3 h-3 text-[#002147]" />
                <span>Certificates</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-[#002147] mt-0.5 group-hover:text-amber-600 transition-colors">'B' & 'C' Certs</p>
            </motion.div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
};
