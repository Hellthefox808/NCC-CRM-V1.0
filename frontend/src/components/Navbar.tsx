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
    { id: "about", label: "About NCC & Battalion" },
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
    <header className="sticky top-0 z-50 bg-[#001733]/95 backdrop-blur-2xl border-b border-amber-500/30 text-white shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Left: Crest & Institution Brand */}
        <div 
          className="flex items-center space-x-3.5 cursor-pointer group shrink-0"
          onClick={() => handleNavClick("home")}
          id="nav-logo-brand"
        >
          {/* Emblem Crest Badge */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0 border-2 border-amber-400 overflow-hidden ring-2 ring-amber-400/30 group-hover:scale-105 transition-transform">
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
            <div className="hidden w-full h-full bg-[#002147] rounded-full flex-col items-center justify-center text-amber-400">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div className="text-left">
            <h1 className="text-sm sm:text-base font-black text-white tracking-tight leading-tight group-hover:text-amber-300 transition-colors">
              19 JHARKHAND BATTALION NCC
            </h1>
            <p className="text-[11px] text-amber-300/90 font-bold tracking-wide">
              Sarala Birla University • Bihar & Jharkhand Directorate
            </p>
          </div>
        </div>

        {/* Center: Clean Segmented Navigation Links Capsule */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/80 border border-white/20 rounded-full p-1.5 backdrop-blur-2xl shadow-xl">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 select-none ${
                  isActive
                    ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-md font-black scale-[1.02]"
                    : "text-slate-200 hover:text-white hover:bg-white/15"
                }`}
                id={`nav-link-${item.id}`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Unified Action Group */}
        <div className="hidden md:flex items-center space-x-3 shrink-0">
          
          {/* Status Tracker Quick Access */}
          <button
            onClick={openStatusModal}
            className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-100 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            title="Track Application Status"
            id="nav-track-status-btn"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Track Status</span>
          </button>

          {/* User Auth Dropdown or Direct Portal */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleNavClick(currentUserType === "admin" ? "admin" : "cadet")}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-2 shadow-md transition-all cursor-pointer ${
                  currentUserType === "admin"
                    ? "bg-amber-400 text-slate-950 hover:bg-yellow-300 border border-yellow-300 uppercase tracking-wider"
                    : "bg-[#002147] text-white hover:bg-[#001838] border border-amber-400/50"
                }`}
                id="nav-user-portal-btn"
              >
                {currentUserType === "admin" ? <Award className="w-4 h-4 text-slate-950" /> : <GraduationCap className="w-4 h-4 text-amber-400" />}
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
              {/* Featured Prominent Portals Button */}
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 border border-amber-300 flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.03] active:scale-[0.97]"
                id="nav-portal-dropdown-btn"
              >
                <Lock className="w-3.5 h-3.5 text-slate-950" />
                <span>Portals Login</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-950" />
              </button>

              {/* Portal Dropdown Menu */}
              <AnimatePresence>
                {portalDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2.5 w-56 bg-[#001733]/95 backdrop-blur-2xl border border-amber-500/40 rounded-2xl shadow-2xl p-2 space-y-1.5 z-50 text-left ring-1 ring-amber-400/20"
                  >
                    <button
                      onClick={() => handleNavClick("signup")}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-100 hover:bg-amber-400/15 hover:text-amber-300 flex items-center space-x-2.5 transition-all cursor-pointer border border-transparent hover:border-amber-400/30"
                    >
                      <User className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="block font-black">Cadet Login / Signup</span>
                        <span className="text-[10px] text-slate-300 font-normal">Student & Cadet Portal</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleNavClick("admin")}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-100 hover:bg-amber-400/15 hover:text-amber-300 flex items-center space-x-2.5 transition-all cursor-pointer border border-transparent hover:border-amber-400/30"
                    >
                      <Award className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="block font-black">ANO / Officer Access</span>
                        <span className="text-[10px] text-slate-300 font-normal">Battalion Administrative Portal</span>
                      </div>
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
