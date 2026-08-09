import React from "react";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLocation } from "@tanstack/react-router";
import { Navbar } from "@frontend/features/Navbar";
import { Footer } from "@frontend/features/Footer";
import { StatusTrackerModal } from "@frontend/features/StatusTrackerModal";
import { AiCadreAssistant } from "@agent/components/AiCadreAssistant";
import { PrintableEnrollmentForm } from "@frontend/features/PrintableEnrollmentForm";
import { Breadcrumbs } from "@frontend/components/Breadcrumbs";
import { useAppShell } from "@backend/lib/app-shell";

const AI_GREETINGS = [
  "Need help with enrollment?",
  "Ask AI about NCC Physical Criteria",
  "Have questions on 'C' Cert & SSB?",
  "Need help with application status?",
  "Subedar Major AI is here to help!",
];

const SBU_CREST =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_5fO3j9MhxWCOALUorfuM3nZcChQfc2949oaRRyjpIQ&s=10";
const NCC_CREST =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZDvUjTIPyVWknpreMHXnyKTvz7-P_uljpSxjPHcXXw&s=10";

const PORTAL_PATHS = ["/login", "/cadet", "/admin"];

const DYNAMIC_TAB_TITLES = [
  "🇮🇳 19 JHR BN NCC | Sarala Birla University, Ranchi",
  "🛡️ SBU NCC Cadet Portal | Form 1 Enrollment 2026-27",
  "🎖️ Unity & Discipline — 19 Jharkhand Battalion",
  "⭐ Senior Division & Senior Wing Command Centre",
];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const shell = useAppShell();
  const location = useLocation();
  const [greetingIndex, setGreetingIndex] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState("home");

  const pathname = location.pathname;
  const isPortal = PORTAL_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Hide the floating AI trigger on the enrollment form so it never covers the primary CTA.
  const hideAiTrigger = pathname === "/enroll" || isPortal;

  React.useEffect(() => {
    const timer = setInterval(() => {
      setGreetingIndex((i) => (i + 1) % AI_GREETINGS.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic Browser Tab Title Sliding / Cycling
  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % DYNAMIC_TAB_TITLES.length;
      document.title = DYNAMIC_TAB_TITLES[index];
    }, 3500);

    const handleVisibility = () => {
      if (document.hidden) {
        document.title = "👋 Return to 19 JHR BN NCC | SBU Ranchi";
      } else {
        document.title = DYNAMIC_TAB_TITLES[index];
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Scroll-spy: keep the navbar active tab in sync with the visible home-page section.
  React.useEffect(() => {
    if (pathname !== "/") return;

    const sectionIds = [
      "home-section",
      "about-section",
      "activities-section",
      "ranks-syllabus-section",
      "faq-section",
    ];
    const idToTab: Record<string, string> = {
      "home-section": "home",
      "about-section": "about",
      "activities-section": "activities",
      "ranks-syllabus-section": "ranks",
      "faq-section": "faq",
    };

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const visibilityRef: Record<string, number> = {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibilityRef[entry.target.id] = entry.intersectionRatio;
        });

        const sorted = Object.entries(visibilityRef)
          .filter(([id]) => idToTab[id])
          .sort((a, b) => b[1] - a[1]);

        if (sorted.length > 0 && sorted[0][1] > 0) {
          setActiveTab(idToTab[sorted[0][0]]);
        }
      },
      {
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen w-full max-w-full flex-col justify-between bg-background font-sans text-foreground antialiased">
      <div>
        {!isPortal && (
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openStatusModal={() => shell.openStatusModal()}
            openAiAssistant={shell.openAiAssistant}
            isLoggedIn={shell.isLoggedIn}
            currentUserType={shell.currentUserType}
            onLogout={() => void shell.signOut()}
          />
        )}
        {!isPortal && <Breadcrumbs />}
        <main>{children}</main>
      </div>

      {!isPortal && <Footer />}

      {/* Persistent floating AI Cadre Assistant trigger */}
      {!hideAiTrigger && (
        <div className="pointer-events-auto fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 sm:bottom-8 sm:right-8">
          <AnimatePresence mode="wait">
            <motion.button
              key={greetingIndex}
              initial={{ opacity: 0, x: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={shell.openAiAssistant}
              className="group hidden max-w-[16rem] cursor-pointer items-center gap-2 rounded-2xl border border-border/70 bg-card/85 py-2 pl-2.5 pr-3 text-left shadow-[0_12px_32px_-16px_color-mix(in_oklab,var(--foreground)_28%,transparent)] backdrop-blur-xl transition-colors hover:border-primary/40 sm:flex"
            >
              <span className="flex -space-x-1 shrink-0">
                <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-background bg-card ring-1 ring-border">
                  <img
                    src={SBU_CREST}
                    alt="Sarala Birla University emblem"
                    className="h-full w-full object-contain p-px"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </span>
                <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-background bg-card ring-1 ring-border">
                  <img
                    src={NCC_CREST}
                    alt="19 Jharkhand Battalion NCC crest"
                    className="h-full w-full object-contain p-px"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </span>
              </span>

              <span className="flex flex-col leading-tight">
                <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Subedar Major AI
                </span>
                <span className="text-[11px] font-semibold tracking-tight text-card-foreground">
                  {AI_GREETINGS[greetingIndex]}
                </span>
              </span>
            </motion.button>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            onClick={shell.openAiAssistant}
            id="floating-ai-assistant-btn"
            aria-label="Open Subedar Major AI Assistant"
            className="group relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-full border border-primary/40 bg-primary pl-2 pr-2 py-2 text-primary-foreground shadow-[0_18px_40px_-14px_color-mix(in_oklab,var(--primary)_55%,transparent)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:pr-5"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-accent/35 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="relative flex -space-x-2 shrink-0">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-card ring-1 ring-primary-foreground/30">
                <img
                  src={SBU_CREST}
                  alt="Sarala Birla University emblem"
                  className="h-full w-full object-contain p-0.5"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </span>
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-card ring-1 ring-primary-foreground/30">
                <img
                  src={NCC_CREST}
                  alt="19 Jharkhand Battalion NCC crest"
                  className="h-full w-full object-contain p-0.5"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex";
                    }
                  }}
                />
                <Sparkles className="hidden h-4 w-4 text-primary" />
              </span>
            </span>

            <span className="relative hidden flex-col items-start leading-tight sm:flex">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary-foreground/70">
                Ask
              </span>
              <span className="text-xs font-bold tracking-tight">AI Cadre Assistant</span>
            </span>
          </motion.button>
        </div>
      )}

      <StatusTrackerModal
        isOpen={shell.statusModalOpen}
        onClose={shell.closeStatusModal}
        initialQuery={shell.statusQuery}
        onOpenPrintableSlip={shell.setPrintableRecord}
      />

      <AiCadreAssistant isOpen={shell.aiAssistantOpen} onClose={shell.closeAiAssistant} />

      {shell.printableRecord && (
        <PrintableEnrollmentForm
          record={shell.printableRecord}
          onClose={() => shell.setPrintableRecord(null)}
        />
      )}
    </div>
  );
}
