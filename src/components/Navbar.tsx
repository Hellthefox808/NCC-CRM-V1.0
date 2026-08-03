import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, 
  Bell,
  ChevronDown,
  GraduationCap, 
  LogOut,
  Menu, 
  Search,
  Shield, 
  User, 
  UserCheck, 
  X,
  Lock,
  Sparkles,
  FileText
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openStatusModal: () => void;
  openAiAssistant: () => void;
  isLoggedIn: boolean;
  currentUserType: "cadet" | "admin" | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openStatusModal,
  openAiAssistant,
  isLoggedIn,
  currentUserType,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Overview" },
    { id: "about", label: "About NCC & Cessation" },
    { id: "activities", label: "Activities & Camps" },
    { id: "ranks", label: "Ranks & Syllabus" },
    { id: "faq", label: "FAQ" },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setPortalDropdownOpen(false);

    if (id === "enroll") {
      setTimeout(() => {
        const el = document.getElementById("enrollment-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#001733]/95 backdrop-blur-2xl border-b border-yellow-500/30 text-white shadow-xl transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Left: Crest & Institution Brand */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
          onClick={() => handleNavClick("home")}
          id="nav-logo-brand"
        >
          {/* Emblem Crest Badge */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0 border-2 border-yellow-400 overflow-hidden ring-2 ring-yellow-400/20 group-hover:scale-105 transition-transform">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZDvUjTIPyVWknpreMHXnyKTvz7-P_uljpSxjPHcXXw&s=10" 
              alt="19 JHR BN NCC Crest" 
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div className="hidden w-full h-full bg-[#002147] rounded-full flex-col items-center justify-center text-yellow-400">
              <Shield className="w-5 h-5 text-yellow-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight leading-tight group-hover:text-yellow-300 transition-colors">
                19 JHARKHAND BATTALION NCC
              </h1>
              <span className="bg-yellow-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs shrink-0">
                SBU Ranchi
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              Army Wing • Bihar & Jharkhand Directorate
            </p>
          </div>
        </div>

        {/* Center: Clean Segmented Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                  isActive
                    ? "bg-yellow-400 text-slate-950 shadow-md font-black"
                    : "text-slate-200 hover:text-white hover:bg-white/10"
                }`}
                id={`nav-link-${item.id}`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Unified Action Group - Always Visible on Scroll */}
        <div className="hidden md:flex items-center space-x-2.5 shrink-0">
          
          {/* User Auth Dropdown or Direct Portal */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleNavClick(currentUserType === "admin" ? "admin" : "cadet")}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-2 shadow-md transition-all cursor-pointer ${
                  currentUserType === "admin"
                    ? "bg-yellow-400 text-slate-950 hover:bg-yellow-300 border border-yellow-300 uppercase tracking-wider"
                    : "bg-[#002147] text-white hover:bg-[#001838] border border-yellow-400/50"
                }`}
                id="nav-user-portal-btn"
              >
                {currentUserType === "admin" ? <Award className="w-4 h-4 text-slate-950" /> : <GraduationCap className="w-4 h-4 text-yellow-400" />}
                <span>{currentUserType === "admin" ? "Officer Portal" : "Cadet Dashboard"}</span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
                id="nav-logout-btn"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-100 bg-white/10 hover:bg-white/20 border border-white/20 flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                id="nav-portal-dropdown-btn"
              >
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                <span>Portals</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {/* Portal Dropdown Menu */}
              <AnimatePresence>
                {portalDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-48 bg-[#001733] border border-yellow-500/30 rounded-2xl shadow-2xl p-2 space-y-1 z-50 text-left backdrop-blur-xl"
                  >
                    <button
                      onClick={() => handleNavClick("signup")}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 flex items-center space-x-2 transition-all cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Cadet Login / Signup</span>
                    </button>
                    <button
                      onClick={() => handleNavClick("admin")}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 flex items-center space-x-2 transition-all cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-yellow-400" />
                      <span>ANO / Officer Portal</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

        </div>

        {/* Mobile Menu Trigger */}
        <div className="lg:hidden flex items-center space-x-2">
          <button
            onClick={() => handleNavClick("enroll")}
            className="bg-yellow-400 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs"
          >
            Apply
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 focus:outline-hidden"
            id="mobile-menu-toggle-btn"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#001229] border-t border-yellow-500/30 px-4 py-4 space-y-2 text-left"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  activeTab === item.id
                    ? "bg-yellow-400 text-slate-950"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}

            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
              <button
                onClick={openStatusModal}
                className="py-2.5 bg-white/10 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5"
              >
                <Search className="w-4 h-4 text-yellow-400" />
                <span>Track Status</span>
              </button>
              <button
                onClick={() => handleNavClick("signup")}
                className="py-2.5 bg-yellow-400 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center space-x-1.5"
              >
                <User className="w-4 h-4 text-slate-950" />
                <span>Cadet Portal</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
