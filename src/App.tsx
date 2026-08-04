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
    setActiveTab("enroll");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setAiAssistantOpen(true)}
          className="relative bg-[#00193c]/95 hover:bg-[#002147] text-white pl-2.5 pr-4 py-1.5 rounded-full shadow-xl backdrop-blur-md border border-amber-400/80 flex items-center space-x-2.5 transition-all cursor-pointer ring-2 ring-amber-400/20 hover:ring-amber-400/50 hover:border-amber-300"
          id="floating-ai-btn"
        >
          {/* Official NCC Crest Avatar with Online Indicator */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center border border-amber-400 overflow-hidden ring-1 ring-amber-400/30">
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
              <div className="hidden w-full h-full bg-[#002147] rounded-full flex items-center justify-center text-amber-400 font-bold text-[9px]">
                NCC
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#00193c]" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>

          {/* Compact Label */}
          <div className="text-left flex flex-col justify-center">
            <span className="text-[11px] font-black text-white tracking-wide leading-tight">
              Subedar Major AI
            </span>
            <span className="text-[9px] text-amber-300/90 font-bold tracking-tight leading-tight">
              19 JHR BN NCC Helpdesk
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
