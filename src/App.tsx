import React, { useState } from "react";
import { motion } from "motion/react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { AboutNCC } from "./components/AboutNCC";
import { ActivitiesGallery } from "./components/ActivitiesGallery";
import { EnrollmentForm } from "./components/EnrollmentForm";
import { PrintableEnrollmentForm } from "./components/PrintableEnrollmentForm";
import { StatusTrackerModal } from "./components/StatusTrackerModal";
import { CadetDashboard } from "./components/CadetDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { SbuNccSignupPortal } from "./components/SbuNccSignupPortal";
import { AiCadreAssistant } from "./components/AiCadreAssistant";
import { RanksSyllabusSection } from "./components/RanksSyllabusSection";
import { FaqSection } from "./components/FaqSection";
import { NotificationsFeed } from "./components/NotificationsFeed";
import { Footer } from "./components/Footer";
import { CadetRecord } from "./types";
import { Bot, ShieldCheck, Sparkles, MessageSquare } from "lucide-react";

import { EnterpriseDataPlatform } from "./services/dataPlatform";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [statusQuery, setStatusQuery] = useState<string>("");
  const [aiAssistantOpen, setAiAssistantOpen] = useState<boolean>(false);
  const [printableRecord, setPrintableRecord] = useState<CadetRecord | null>(null);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUserType, setCurrentUserType] = useState<"cadet" | "admin" | null>(null);

  const handleOpenStatusModalWithQuery = (query: string) => {
    setStatusQuery(query);
    setStatusModalOpen(true);
  };

  const handleCadetSuccessSubmitted = (record: CadetRecord) => {
    // Keep record in context for instant printable slip
  };

  const handleStartEnrollment = () => {
    const el = document.getElementById("enrollment-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setActiveTab("enroll");
      setTimeout(() => {
        const target = document.getElementById("enrollment-section");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
    }
  };

  const handleLogout = async () => {
    await EnterpriseDataPlatform.logout();
    setIsLoggedIn(false);
    setCurrentUserType(null);
    setActiveTab("home");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col justify-between selection:bg-amber-200 selection:text-slate-900">
      <div>
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          openStatusModal={() => {
            setStatusQuery("");
            setStatusModalOpen(true);
          }}
          openAiAssistant={() => setAiAssistantOpen(true)}
          isLoggedIn={isLoggedIn}
          currentUserType={currentUserType}
          onLogout={handleLogout}
        />

        {/* View Switcher based on Active Tab */}
        <main>
          {activeTab === "home" && (
            <>
              <HeroSection
                onStartEnrollment={handleStartEnrollment}
                openStatusModal={() => {
                  setStatusQuery("");
                  setStatusModalOpen(true);
                }}
                onViewNotices={() => setActiveTab("notices")}
                onOpenOfficerPortal={() => {
                  if (isLoggedIn && currentUserType === "admin") {
                    setActiveTab("admin");
                  } else {
                    setActiveTab("admin");
                  }
                }}
              />
              <AboutNCC />
              <ActivitiesGallery />
              <RanksSyllabusSection />
              <FaqSection
                onStartEnrollment={handleStartEnrollment}
                openStatusModal={() => {
                  setStatusQuery("");
                  setStatusModalOpen(true);
                }}
                openAiAssistant={() => setAiAssistantOpen(true)}
              />
              <EnrollmentForm
                onSuccessSubmitted={handleCadetSuccessSubmitted}
                onOpenPrintableSlip={(record) => setPrintableRecord(record)}
                openStatusModalWithQuery={handleOpenStatusModalWithQuery}
              />
            </>
          )}

          {activeTab === "about" && <AboutNCC />}

          {activeTab === "activities" && <ActivitiesGallery />}

          {activeTab === "enroll" && (
            <EnrollmentForm
              onSuccessSubmitted={handleCadetSuccessSubmitted}
              onOpenPrintableSlip={(record) => setPrintableRecord(record)}
              openStatusModalWithQuery={handleOpenStatusModalWithQuery}
            />
          )}

          {activeTab === "faq" && (
            <FaqSection
              onStartEnrollment={handleStartEnrollment}
              openStatusModal={() => {
                setStatusQuery("");
                setStatusModalOpen(true);
              }}
              openAiAssistant={() => setAiAssistantOpen(true)}
            />
          )}

          {activeTab === "ranks" && <RanksSyllabusSection />}

          {activeTab === "signup" && (
            <SbuNccSignupPortal
              defaultSection="cadets"
              onLoginSuccess={(type) => {
                setIsLoggedIn(true);
                setCurrentUserType(type);
                setActiveTab(type);
              }}
              onOpenEnrollmentForm={() => setActiveTab("enroll")}
            />
          )}

          {activeTab === "cadet" && (
            isLoggedIn && currentUserType === "cadet" ? (
              <CadetDashboard onLogout={handleLogout} />
            ) : (
              <SbuNccSignupPortal
                defaultSection="cadets"
                onLoginSuccess={(type) => {
                  setIsLoggedIn(true);
                  setCurrentUserType(type);
                  setActiveTab(type);
                }}
                onOpenEnrollmentForm={() => setActiveTab("enroll")}
              />
            )
          )}

          {activeTab === "admin" && (
            isLoggedIn && currentUserType === "admin" ? (
              <AdminDashboard
                onOpenPrintableSlip={(record) => setPrintableRecord(record)}
              />
            ) : (
              <SbuNccSignupPortal
                defaultSection="admin"
                onLoginSuccess={(type) => {
                  setIsLoggedIn(true);
                  setCurrentUserType(type);
                  setActiveTab(type);
                }}
                onOpenEnrollmentForm={() => setActiveTab("enroll")}
              />
            )
          )}
        </main>
      </div>

      {/* Floating AI Cadre Guide Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 group">
        {/* Soft radial pulse background glow */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 opacity-75 blur-md animate-pulse group-hover:opacity-100 transition-opacity" />
        <span className="absolute -inset-2 rounded-full bg-yellow-400/25 animate-ping opacity-40 pointer-events-none" />

        <motion.button
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAiAssistantOpen(true)}
          className="relative bg-gradient-to-r from-[#002147] via-[#00193c] to-[#000d21] text-white pl-3.5 pr-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md border-2 border-yellow-400 flex items-center space-x-3 transition-all cursor-pointer ring-3 ring-yellow-400/30 hover:ring-yellow-400/60 hover:border-yellow-300"
          id="floating-ai-btn"
        >
          {/* Badge Avatar Icon Container */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-lg border-2 border-white/80 shrink-0">
            <Bot className="w-5.5 h-5.5 text-slate-950" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#002147] shadow-2xs" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>

          {/* Button Text & Label */}
          <div className="text-left flex flex-col justify-center">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black text-white tracking-wide drop-shadow-xs">
                Subedar Major AI
              </span>
              <span className="bg-yellow-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs flex items-center space-x-0.5 border border-yellow-200">
                <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                <span>24/7 CADRE</span>
              </span>
            </div>
            <span className="text-[10px] text-yellow-300 font-extrabold tracking-tight flex items-center space-x-1">
              <span>19 JHR BN NCC Helpdesk</span>
            </span>
          </div>
        </motion.button>
      </div>

      {/* Footer */}
      <Footer />

      {/* Modals & Overlay Components */}
      {statusModalOpen && (
        <StatusTrackerModal
          initialQuery={statusQuery}
          onClose={() => setStatusModalOpen(false)}
          onOpenPrintableSlip={(record) => {
            setStatusModalOpen(false);
            setPrintableRecord(record);
          }}
        />
      )}

      {printableRecord && (
        <PrintableEnrollmentForm
          record={printableRecord}
          onClose={() => setPrintableRecord(null)}
        />
      )}

      <AiCadreAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />
    </div>
  );
}
