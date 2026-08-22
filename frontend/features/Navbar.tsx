import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "@backend/lib/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  Search,
  Shield,
  User,
  X,
  Lock,
  Sparkles,
  Compass,
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
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "home", label: "Overview" },
    { id: "about", label: "About NCC" },
    { id: "activities", label: "Camps & Activities" },
    { id: "ranks", label: "Ranks & Syllabus" },
    { id: "faq", label: "FAQ" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPortalDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setPortalDropdownOpen(false);

    if (id === "enroll") {
      navigate("/enroll");
    } else if (id === "notices") {
      navigate("/notices");
    } else if (id === "admin" || id === "officer") {
      navigate("/admin");
    } else if (id === "cadet" || id === "signup" || id === "login") {
      navigate("/login");
    } else if (id === "home") {
      if (location.pathname !== "/") {
        navigate("/");
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById(`${id}-section`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      } else {
        const el = document.getElementById(`${id}-section`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 text-foreground">
      {/* NCC tricolor accent (Army / Navy / Air Force) */}
      <div className="h-[3px] w-full bg-gradient-to-r from-destructive via-primary to-info" />

      <div className="w-full bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="w-full max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6">
          {/* Left: Crest & Elite Unit Branding */}
          <div
            className="flex min-w-0 items-center gap-3.5 cursor-pointer group"

            onClick={() => handleNavClick("home")}
            id="nav-logo-brand"
          >
            {/* Overlapping crest cluster */}
            <div className="flex -space-x-2 shrink-0">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card border-2 border-background shadow-sm ring-1 ring-border flex items-center justify-center overflow-hidden group-hover:ring-primary/40 transition-all">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_5fO3j9MhxWCOALUorfuM3nZcChQfc2949oaRRyjpIQ&s=10"
                  alt="Sarala Birla University emblem"
                  className="w-full h-full object-contain rounded-full bg-card p-0.5"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card border-2 border-background shadow-sm ring-1 ring-border flex items-center justify-center overflow-hidden group-hover:ring-primary/40 transition-all">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZDvUjTIPyVWknpreMHXnyKTvz7-P_uljpSxjPHcXXw&s=10"
                  alt="19 JHR BN NCC Crest"
                  className="w-full h-full object-contain rounded-full bg-card p-0.5"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex";
                    }
                  }}
                />
                <div className="hidden w-full h-full bg-inverse-elevated rounded-full flex-col items-center justify-center text-primary">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Vertical keyline separating crests from the identity block */}
            <div className="hidden sm:block h-8 w-px shrink-0 bg-border" />

            <div className="min-w-0 text-left flex flex-col justify-center">
              <div className="mb-0.5 flex items-center gap-2">
                <h1 className="truncate font-display text-sm lg:text-[15px] font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                  19 Jharkhand Battalion NCC
                </h1>
              </div>
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-brand" />
                <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Sarala Birla University, Ranchi
                </p>
              </div>
            </div>
          </div>

          {/* Center: Segmented navigation — Synced Active Tab & Keyline Dividers */}
          <nav className="hidden xl:flex shrink-0 items-center rounded-full border border-border bg-secondary/80 p-1 shadow-2xs">
            {navItems.map((item, index) => {
              const isItemActive = (id: string) =>
                activeTab === id ||
                activeTab === `${id}-section` ||
                activeTab.replace("-section", "") === id;

              const isActive = isItemActive(item.id);
              const nextItem = navItems[index + 1];
              const isNextActive = nextItem ? isItemActive(nextItem.id) : false;

              return (
                <React.Fragment key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative px-4 py-1.5 rounded-full text-[13px] transition-colors cursor-pointer whitespace-nowrap select-none ${
                      isActive
                        ? "text-primary-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground font-semibold hover:bg-card/50"
                    }`}
                    id={`nav-link-${item.id}`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeNavTabIndicator"
                        className="absolute inset-0 rounded-full bg-primary shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </button>

                  {/* Clean Vertical Keyline Divider: ONLY rendered between two unselected adjacent tabs */}
                  {index < navItems.length - 1 && !isActive && !isNextActive && (
                    <span
                      aria-hidden="true"
                      className="h-3.5 w-px bg-border/80 self-center shrink-0 mx-1"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Right: Action Buttons Group */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Status Tracker */}
            <button
              onClick={openStatusModal}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-foreground bg-card hover:bg-secondary border border-border flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Track Application Status"
              id="nav-track-status-btn"
            >
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden lg:inline">Track Status</span>
            </button>

            {/* User Auth Dropdown / Dashboard Button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick(currentUserType === "admin" ? "admin" : "cadet")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer ${
                    currentUserType === "admin"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                  id="nav-user-portal-btn"
                >
                  {currentUserType === "admin" ? (
                    <Award className="w-4 h-4" />
                  ) : (
                    <GraduationCap className="w-4 h-4" />
                  )}
                  <span>{currentUserType === "admin" ? "Officer Portal" : "Cadet Dashboard"}</span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground bg-card hover:bg-secondary border border-border transition-colors cursor-pointer"
                  id="nav-logout-btn"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                  className="px-5 py-2 rounded-xl text-[13px] font-bold text-primary-foreground bg-gradient-to-r from-primary to-accent-brand flex items-center gap-2 transition-transform cursor-pointer shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                  id="nav-portal-dropdown-btn"
                  aria-expanded={portalDropdownOpen}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Portals</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${portalDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {portalDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2.5 w-64 max-w-[calc(100vw-2rem)] bg-popover border border-border rounded-2xl shadow-lg p-2 space-y-1 z-50 text-left"
                    >
                      <button
                        onClick={() => handleNavClick("cadet")}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-secondary flex items-center gap-3 transition-colors cursor-pointer group"
                        id="dropdown-cadet-login-btn"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-semibold text-foreground">Cadet Portal</span>
                          <span className="text-[10px] text-muted-foreground">
                            Student &amp; Cadet Login / Signup
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNavClick("admin")}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-secondary flex items-center gap-3 transition-colors cursor-pointer group"
                        id="dropdown-officer-login-btn"
                      >
                        <div className="w-8 h-8 rounded-lg bg-accent-brand/10 flex items-center justify-center shrink-0 text-accent-brand">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-semibold text-foreground">
                            ANO / Officer Access
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Command &amp; Battalion Portal
                          </span>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleNavClick("enroll")}
              className="bg-primary text-primary-foreground font-semibold px-3 py-2 rounded-xl text-xs shadow-sm"
            >
              Apply
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-foreground bg-card hover:bg-secondary border border-border"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border px-4 py-4 space-y-1.5 text-left"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                  activeTab === item.id
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}

            <div className="pt-3 border-t border-border grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAiAssistant();
                }}
                className="py-2.5 px-2 bg-accent-brand/10 hover:bg-accent-brand/15 text-accent-brand text-[11px] sm:text-xs font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                id="mobile-nav-ai-btn"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">AI Asst</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openStatusModal();
                }}
                className="py-2.5 px-2 bg-secondary hover:bg-secondary/80 text-foreground text-[11px] sm:text-xs font-semibold rounded-xl border border-border flex items-center justify-center gap-1 cursor-pointer transition-colors"
                id="mobile-nav-status-btn"
              >
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Status</span>
              </button>
              <button
                onClick={() => handleNavClick("signup")}
                className="py-2.5 px-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] sm:text-xs font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                id="mobile-nav-portal-btn"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Portal</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
