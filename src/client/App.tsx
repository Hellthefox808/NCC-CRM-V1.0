import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { EnrollmentForm } from "./pages/Enrollment";
import { PrintableEnrollmentForm } from "./components/PrintableEnrollmentForm";
import { StatusTrackerModal } from "./components/StatusTrackerModal";
import { CadetDashboard } from "./components/CadetDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { Login } from "./pages/Login";
import { AiCadreAssistant } from "./components/AiCadreAssistant";
import { NotificationsFeed } from "./components/NotificationsFeed";
import { Footer } from "./components/Footer";
import { CadetRecord } from "./types";
import { EnterpriseDataPlatform } from "./services/dataPlatform";
import { Home } from "./pages/Home";

export default function App() {
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [statusQuery, setStatusQuery] = useState<string>("");
  const [aiAssistantOpen, setAiAssistantOpen] = useState<boolean>(false);
  const [printableRecord, setPrintableRecord] = useState<CadetRecord | null>(null);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUserType, setCurrentUserType] = useState<"cadet" | "admin" | null>(null);

  const handleLogout = async () => {
    await EnterpriseDataPlatform.logout();
    setIsLoggedIn(false);
    setCurrentUserType(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col justify-between selection:bg-amber-200 selection:text-slate-900">
        <div>
          <Navbar
            activeTab="home"
            setActiveTab={() => {}}
            openStatusModal={() => setStatusModalOpen(true)}
            openAiAssistant={() => setAiAssistantOpen(true)}
            isLoggedIn={isLoggedIn}
            currentUserType={currentUserType}
            onLogout={handleLogout}
          />

          <main>
            <Routes>
              <Route path="/" element={<Home openStatusModal={() => setStatusModalOpen(true)} />} />
              <Route path="/enroll" element={
                <EnrollmentForm 
                  onSuccess={(record: CadetRecord) => setPrintableRecord(record)} 
                  onCancel={() => window.history.back()} 
                />
              } />
              <Route path="/notices" element={<NotificationsFeed />} />
              <Route path="/admin" element={
                isLoggedIn && currentUserType === "admin" ? (
                  <AdminDashboard onOpenPrintableSlip={setPrintableRecord} />
                ) : (
                  <Login 
                    onLoginSuccess={(type, user) => {
                      setIsLoggedIn(true);
                      setCurrentUserType(type);
                    }} 
                    onBack={() => window.history.back()}
                  />
                )
              } />
              <Route path="/cadet" element={
                isLoggedIn && currentUserType === "cadet" ? (
                  <CadetDashboard />
                ) : (
                  <Navigate to="/admin" replace />
                )
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        <Footer />

        <StatusTrackerModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          initialQuery={statusQuery}
        />

        <AiCadreAssistant
          isOpen={aiAssistantOpen}
          onClose={() => setAiAssistantOpen(false)}
        />

        {printableRecord && (
          <PrintableEnrollmentForm
            record={printableRecord}
            onClose={() => setPrintableRecord(null)}
          />
        )}
      </div>
    </Router>
  );
}
