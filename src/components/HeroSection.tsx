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
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/20 to-slate-950/70 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#002147]/60 via-transparent to-[#002147]/60 z-10" />

      {/* Decorative Ambient Glass Light Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl pointer-events-none z-10 animate-pulse" style={{ animationDelay: '1.5s' }} />

      {/* Glassmorphism Main Card Container */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-14 my-6 sm:my-10 p-7 sm:p-10 lg:p-12 relative z-20 bg-[#001736]/80 backdrop-blur-3xl border border-white/25 rounded-3xl shadow-[0_35px_80px_-15px_rgba(0,0,0,0.7)] text-center ring-1 ring-amber-400/40 shadow-amber-500/15 overflow-hidden"
      >
        {/* Subtle Specular Glass Light Reflection */}
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-gradient-to-br from-white/20 via-white/5 to-transparent rotate-45 pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          
          {/* Institution Badge */}
          <motion.div variants={itemVariants} className="inline-block">
            <div className="inline-flex items-center space-x-2 bg-white/95 backdrop-blur-md border border-amber-400/80 rounded-full px-4.5 py-1.5 shadow-lg shadow-amber-500/15 hover:shadow-amber-500/30 transition-all ring-1 ring-amber-400/30 group cursor-default">
              <ShieldCheck className="w-4.5 h-4.5 text-[#002147] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-xs shadow-amber-500" />
              <span className="text-xs font-black text-[#002147] tracking-wider uppercase">
                19 JHR BN NCC • Sarala Birla University, Ranchi
              </span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.div variants={itemVariants} className="space-y-3.5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-xl">
              National Cadet Corps <br />
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 border-b-2 sm:border-b-4 border-amber-400 pb-1.5 shadow-amber-500/25 mt-1">
                Senior Division & Senior Wing
              </span>
            </h1>
            <div className="pt-1 flex items-center justify-center">
              <span className="bg-amber-400/20 backdrop-blur-md border border-amber-400/50 px-5 py-1.5 rounded-full text-amber-300 text-xs sm:text-base font-extrabold shadow-inner tracking-wide flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                <span>"Ekta aur Anushasan" — Unity and Discipline</span>
              </span>
            </div>
          </motion.div>

          {/* Subtext */}
          <motion.p variants={itemVariants} className="text-slate-100 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto font-semibold drop-shadow-xs">
            Official NCC Enrollment & Cadre Portal for Sarala Birla University, Ranchi under 
            <strong className="text-white font-black"> 19 Jharkhand Battalion NCC (Ranchi)</strong> and 
            <strong className="text-white font-black"> Bihar & Jharkhand Directorate</strong>.
          </motion.p>

          {/* Motion Glassmorphism Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {/* Primary Motion Glass Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartEnrollment}
              className="relative overflow-hidden group bg-gradient-to-r from-[#002147] via-[#001838] to-[#000d20] text-amber-300 font-black px-7 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 transition-all cursor-pointer border border-amber-400 ring-2 ring-amber-500/40 text-sm sm:text-base backdrop-blur-md"
              id="hero-enroll-now-btn"
            >
              {/* Shimmer Sweep Animation */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out pointer-events-none" />
              <FileCheck2 className="w-5 h-5 text-amber-400 shrink-0 group-hover:rotate-6 transition-transform" />
              <span className="tracking-wide text-white font-black">Fill Enrollment Form 2026</span>
              <ChevronRight className="w-4.5 h-4.5 text-amber-400 shrink-0 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Secondary Motion Glass Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={openStatusModal}
              className="relative overflow-hidden group bg-white/95 backdrop-blur-md hover:bg-white text-[#002147] font-black px-6 py-3.5 rounded-2xl shadow-xl flex items-center space-x-2.5 border border-slate-200 transition-all cursor-pointer text-sm sm:text-base hover:border-amber-500/80 ring-2 ring-black/5"
              id="hero-track-status-btn"
            >
              <CheckCircle2 className="w-5 h-5 text-[#002147] shrink-0 group-hover:scale-110 transition-transform" />
              <span>Track Application</span>
            </motion.button>
          </motion.div>

          {/* Key Quick Highlights Row with Frosted Glass Cards */}
          <motion.div variants={itemVariants} className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <motion.div 
              whileHover={{ y: -3, scale: 1.04 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 text-center shadow-lg hover:shadow-2xl hover:border-amber-400/80 transition-all group flex flex-col items-center justify-center ring-1 ring-white/10"
            >
              <div className="flex items-center space-x-1 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span>Unit</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-white mt-1 group-hover:text-amber-300 transition-colors">19 JHR BN NCC</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -3, scale: 1.04 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 text-center shadow-lg hover:shadow-2xl hover:border-amber-400/80 transition-all group flex flex-col items-center justify-center ring-1 ring-white/10"
            >
              <div className="flex items-center space-x-1 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Directorate</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-white mt-1 group-hover:text-amber-300 transition-colors">Bihar & Jharkhand</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -3, scale: 1.04 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 text-center shadow-lg hover:shadow-2xl hover:border-amber-400/80 transition-all group flex flex-col items-center justify-center ring-1 ring-white/10"
            >
              <div className="flex items-center space-x-1 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Campus Unit</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-white mt-1 group-hover:text-amber-300 transition-colors">SBU Ranchi Coy</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -3, scale: 1.04 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 text-center shadow-lg hover:shadow-2xl hover:border-amber-400/80 transition-all group flex flex-col items-center justify-center ring-1 ring-white/10"
            >
              <div className="flex items-center space-x-1 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>Certificates</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-white mt-1 group-hover:text-amber-300 transition-colors">'B' & 'C' Certs</p>
            </motion.div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
};
