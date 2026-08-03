import React, { useState } from "react";
import { 
  Award, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Lock, 
  ShieldCheck, 
  User, 
  UserCheck, 
  UserPlus, 
  FileText,
  AlertCircle,
  Building,
  Mail,
  Phone,
  BookOpen
} from "lucide-react";
import { BATTALION_DETAILS } from "../data/nccData";

interface SbuNccSignupPortalProps {
  onLoginSuccess: (userType: "cadet" | "admin", userData?: any) => void;
  onOpenEnrollmentForm: () => void;
  defaultSection?: "cadets" | "admin";
}

export const SbuNccSignupPortal: React.FC<SbuNccSignupPortalProps> = ({
  onLoginSuccess,
  onOpenEnrollmentForm,
  defaultSection = "cadets"
}) => {
  // Main Section Toggle: 'cadets' vs 'admin'
  const [activeSection, setActiveSection] = useState<"cadets" | "admin">(defaultSection);

  // Sub-mode for Cadets: 'login' vs 'signup'
  const [cadetMode, setCadetMode] = useState<"login" | "signup">("login");

  // Sub-mode for Admin: 'login' vs 'signup'
  const [adminMode, setAdminMode] = useState<"login" | "signup">("login");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Cadet Login State
  const [cadetIdentifier, setCadetIdentifier] = useState("SBU25BTECH042");
  const [cadetPassword, setCadetPassword] = useState("cadet123");

  // Cadet Signup State
  const [cadetForm, setCadetForm] = useState({
    sbuRollNo: "",
    fullName: "",
    email: "",
    mobile: "",
    gender: "SD",
    sbuCourse: "B.Tech Computer Science",
    sbuYear: "1st Year",
    password: "",
    confirmPassword: "",
    termsAgreed: true
  });

  // Admin Login State
  const [adminUsername, setAdminUsername] = useState("ano.sbu@ncc.in");
  const [adminPassword, setAdminPassword] = useState("admin123");

  // Admin Signup State
  const [adminForm, setAdminForm] = useState({
    fullName: "",
    designation: "Associate NCC Officer (ANO)",
    employeeId: "SBU-FAC-1904",
    email: "",
    mobile: "",
    accessKey: "",
    password: ""
  });

  // Handle Cadet Sign In
  const handleCadetLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadetIdentifier) {
      setNoticeMessage({ type: "error", text: "Please enter your SBU Roll No or Regimental Number." });
      return;
    }
    setNoticeMessage({ type: "success", text: "Cadet authentication successful! Welcome to SBU NCC Portal." });
    setTimeout(() => {
      onLoginSuccess("cadet", {
        fullName: cadetForm.fullName || "Aman Kumar Sharma",
        sbuRollNo: cadetIdentifier,
        gender: cadetForm.gender
      });
    }, 600);
  };

  // Handle Cadet New Registration (Sign Up)
  const handleCadetSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadetForm.sbuRollNo || !cadetForm.fullName || !cadetForm.mobile || !cadetForm.email) {
      setNoticeMessage({ type: "error", text: "Please fill in all mandatory SBU student details." });
      return;
    }
    if (cadetForm.password && cadetForm.password !== cadetForm.confirmPassword) {
      setNoticeMessage({ type: "error", text: "Passwords do not match. Please re-check." });
      return;
    }

    setNoticeMessage({
      type: "success",
      text: `Account created for ${cadetForm.fullName} (${cadetForm.sbuRollNo}). Proceeding to Enrollment!`
    });

    setTimeout(() => {
      onLoginSuccess("cadet", cadetForm);
      onOpenEnrollmentForm();
    }, 800);
  };

  // Handle Admin Sign In
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername) {
      setNoticeMessage({ type: "error", text: "Please enter your Official Officer Email or ID." });
      return;
    }
    setNoticeMessage({ type: "success", text: "Officer Credentials Verified! Welcome Associate NCC Officer." });
    setTimeout(() => {
      onLoginSuccess("admin");
    }, 600);
  };

  // Handle Admin Authorization Signup Request
  const handleAdminSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.fullName || !adminForm.employeeId || !adminForm.email) {
      setNoticeMessage({ type: "error", text: "Please provide all required officer registration details." });
      return;
    }
    setNoticeMessage({
      type: "success",
      text: "Officer authorization request submitted to 19 JHR BN HQ. Access granted for demo session."
    });
    setTimeout(() => {
      onLoginSuccess("admin");
    }, 800);
  };

  return (
    <section className="py-12 bg-slate-100 border-b border-slate-200 min-h-[80vh] flex items-center justify-center" id="sbu-signup-portal-section">
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Institutional Branding Header - Reference SBU Signup Portal */}
        <div className="bg-[#002147] text-white rounded-2xl p-6 shadow-xl border-t-4 border-t-yellow-500 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            {/* University & Battalion Emblem */}
            <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md flex items-center justify-center shrink-0 border-2 border-yellow-400">
              <div className="w-full h-full bg-[#002147] rounded-full flex flex-col items-center justify-center text-yellow-400">
                <ShieldCheck className="w-7 h-7 text-yellow-400" />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-0.5">
              <div className="inline-flex items-center space-x-2 bg-yellow-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                <span>sbu.ac.in/Signup • Official Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                NCC SARALA BIRLA UNIVERSITY, RANCHI
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                19 Jharkhand Battalion NCC • Bihar & Jharkhand Directorate
              </p>
            </div>
          </div>
        </div>

        {/* Notice Alert Banner */}
        {noticeMessage && (
          <div className={`p-4 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs ${
            noticeMessage.type === "success" 
              ? "bg-emerald-100 text-emerald-900 border border-emerald-300" 
              : "bg-red-100 text-red-900 border border-red-300"
          }`}>
            {noticeMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />}
            <span>{noticeMessage.text}</span>
          </div>
        )}

        {/* SECTION SWITCHER: 1. CADETS vs 2. ADMIN */}
        <div className="bg-white p-2 rounded-2xl shadow-md border border-slate-200 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setActiveSection("cadets");
              setNoticeMessage(null);
            }}
            className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center space-x-2.5 ${
              activeSection === "cadets"
                ? "bg-[#002147] text-yellow-400 shadow-md ring-2 ring-yellow-400"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
            id="sbu-portal-cadets-tab"
          >
            <GraduationCap className={`w-5 h-5 ${activeSection === "cadets" ? "text-yellow-400" : "text-slate-500"}`} />
            <div className="text-left">
              <span className="block text-[10px] uppercase font-mono tracking-wider opacity-80">Section 1</span>
              <span className="text-xs sm:text-sm">CADETS PORTAL</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveSection("admin");
              setNoticeMessage(null);
            }}
            className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center space-x-2.5 ${
              activeSection === "admin"
                ? "bg-yellow-500 text-slate-950 shadow-md ring-2 ring-[#002147]"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
            id="sbu-portal-admin-tab"
          >
            <Award className={`w-5 h-5 ${activeSection === "admin" ? "text-slate-950" : "text-slate-500"}`} />
            <div className="text-left">
              <span className="block text-[10px] uppercase font-mono tracking-wider opacity-80">Section 2</span>
              <span className="text-xs sm:text-sm">ADMIN / ANO PORTAL</span>
            </div>
          </button>
        </div>

        {/* SECTION 1: CADETS CONTAINER */}
        {activeSection === "cadets" && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6 text-left">
            {/* Cadet Sub-Mode Toggle: Sign In vs Sign Up */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-black text-[#002147]">
                  Cadet Access & Registration
                </h2>
                <p className="text-xs text-slate-600">
                  For SBU Students applying for Senior Division (SD) & Senior Wing (SW) NCC.
                </p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-300">
                <button
                  onClick={() => setCadetMode("login")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    cadetMode === "login"
                      ? "bg-[#002147] text-white shadow-xs"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCadetMode("signup")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    cadetMode === "signup"
                      ? "bg-[#002147] text-white shadow-xs"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  New Cadet Signup
                </button>
              </div>
            </div>

            {/* CADET MODE 1: SIGN IN FORM */}
            {cadetMode === "login" && (
              <form onSubmit={handleCadetLogin} className="space-y-4 max-w-lg mx-auto py-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SBU Admission Roll No / Regimental Number / Mobile No*
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={cadetIdentifier}
                      onChange={(e) => setCadetIdentifier(e.target.value)}
                      placeholder="e.g. SBU25BTECH042 or JHR/26/SD/19/204801"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cadet Portal Password / Security Code*
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={cadetPassword}
                      onChange={(e) => setCadetPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-[#002147] hover:bg-blue-900 text-yellow-400 font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                    id="cadet-signin-submit-btn"
                  >
                    <UserCheck className="w-4 h-4 text-yellow-400" />
                    <span>Sign In to Cadet Dashboard</span>
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-mono uppercase">Or Quick Test</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCadetIdentifier("SBU25BTECH042");
                      setCadetPassword("cadet123");
                      onLoginSuccess("cadet", {
                        fullName: "Aman Kumar Sharma",
                        sbuRollNo: "SBU25BTECH042",
                        gender: "SD"
                      });
                    }}
                    className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>⚡ One-Click Demo Cadet Sign In (Aman Kumar Sharma - L/Cpl)</span>
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-600">
                      Don't have an SBU Cadet Account?{" "}
                      <button
                        type="button"
                        onClick={() => setCadetMode("signup")}
                        className="text-[#002147] font-bold underline cursor-pointer"
                      >
                        Register New Cadet Account
                      </button>
                    </p>
                  </div>
                </div>
              </form>
            )}

            {/* CADET MODE 2: NEW CADET REGISTRATION (SIGN UP) */}
            {cadetMode === "signup" && (
              <form onSubmit={handleCadetSignup} className="space-y-4 py-2">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-[#002147] font-semibold flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-[#002147] shrink-0" />
                  <span>SBU Student Pre-Registration for 19 JHR BN NCC Army Wing Enrollment (2026-27).</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      SBU Admission Roll / Enrolment No*
                    </label>
                    <input
                      type="text"
                      required
                      value={cadetForm.sbuRollNo}
                      onChange={(e) => setCadetForm({ ...cadetForm, sbuRollNo: e.target.value })}
                      placeholder="e.g. SBU25BTECH042 or SBU25BBA018"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cadet Full Name (As per 10th Certificate)*
                    </label>
                    <input
                      type="text"
                      required
                      value={cadetForm.fullName}
                      onChange={(e) => setCadetForm({ ...cadetForm, fullName: e.target.value })}
                      placeholder="e.g. Aman Kumar Sharma"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Email Address*
                    </label>
                    <input
                      type="email"
                      required
                      value={cadetForm.email}
                      onChange={(e) => setCadetForm({ ...cadetForm, email: e.target.value })}
                      placeholder="e.g. aman.sharma@sbu.ac.in"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (WhatsApp Enabled)*
                    </label>
                    <input
                      type="tel"
                      required
                      value={cadetForm.mobile}
                      onChange={(e) => setCadetForm({ ...cadetForm, mobile: e.target.value })}
                      placeholder="e.g. 9431100223"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NCC Division / Wing Selection*
                    </label>
                    <select
                      value={cadetForm.gender}
                      onChange={(e) => setCadetForm({ ...cadetForm, gender: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    >
                      <option value="SD">Senior Division (SD - Male Cadets)</option>
                      <option value="SW">Senior Wing (SW - Female Cadets)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      SBU Academic Program & Year*
                    </label>
                    <input
                      type="text"
                      required
                      value={cadetForm.sbuCourse}
                      onChange={(e) => setCadetForm({ ...cadetForm, sbuCourse: e.target.value })}
                      placeholder="e.g. B.Tech Computer Science (1st Year)"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Create Security Password*
                    </label>
                    <input
                      type="password"
                      required
                      value={cadetForm.password}
                      onChange={(e) => setCadetForm({ ...cadetForm, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Security Password*
                    </label>
                    <input
                      type="password"
                      required
                      value={cadetForm.confirmPassword}
                      onChange={(e) => setCadetForm({ ...cadetForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cadetForm.termsAgreed}
                      onChange={(e) => setCadetForm({ ...cadetForm, termsAgreed: e.target.checked })}
                      className="mt-0.5 rounded text-[#002147]"
                    />
                    <span>
                      I declare that I am an active student of Sarala Birla University, Ranchi and solemnly agree to uphold NCC discipline, parade attendance, and battalion norms.
                    </span>
                  </label>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={!cadetForm.termsAgreed}
                    className="w-full bg-[#002147] hover:bg-blue-900 text-yellow-400 font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                    id="cadet-signup-submit-btn"
                  >
                    <UserPlus className="w-4 h-4 text-yellow-400" />
                    <span>Create Cadet Account & Fill Form 1 Enrollment</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* SECTION 2: ADMIN / ANO CONTAINER */}
        {activeSection === "admin" && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-black text-[#002147] flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>Associate NCC Officer (ANO) & Battalion Officer Portal</span>
                </h2>
                <p className="text-xs text-slate-600">
                  Restricted access for 19 JHR BN NCC Officers, SBU ANO, and PI Staff.
                </p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-300">
                <button
                  onClick={() => setAdminMode("login")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    adminMode === "login"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  Officer Login
                </button>
                <button
                  onClick={() => setAdminMode("signup")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    adminMode === "signup"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  Access Request
                </button>
              </div>
            </div>

            {/* ADMIN MODE 1: OFFICER LOGIN */}
            {adminMode === "login" && (
              <form onSubmit={handleAdminLogin} className="space-y-4 max-w-lg mx-auto py-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Email ID / Service ID*
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="e.g. ano.sbu@ncc.in or CO.19jhr@ncc.in"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Officer Security Password / PIN*
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter security password"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                    id="admin-login-submit-btn"
                  >
                    <Award className="w-4 h-4 text-slate-950" />
                    <span>Login to Officer Dashboard</span>
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-mono uppercase">Instant Demo</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminUsername("ano.sbu@ncc.in");
                      setAdminPassword("admin123");
                      onLoginSuccess("admin");
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-950 text-yellow-400 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>⚡ One-Click ANO Access (Lt. Dr. Rajeshwar M. - SBU Coy)</span>
                  </button>
                </div>
              </form>
            )}

            {/* ADMIN MODE 2: OFFICER ACCESS REQUEST (SIGN UP) */}
            {adminMode === "signup" && (
              <form onSubmit={handleAdminSignup} className="space-y-4 py-2">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 font-semibold flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>SBU Faculty & Battalion Staff Officer Access Authorization Request</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Officer Full Name & Military Rank*
                    </label>
                    <input
                      type="text"
                      required
                      value={adminForm.fullName}
                      onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                      placeholder="e.g. Lt. (Dr.) Rajeshwar M."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Designation / Role in Battalion*
                    </label>
                    <select
                      value={adminForm.designation}
                      onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    >
                      <option value="Associate NCC Officer (ANO)">Associate NCC Officer (ANO - SBU)</option>
                      <option value="Commanding Officer (CO)">Commanding Officer (19 JHR BN)</option>
                      <option value="Administrative Officer (AO)">Administrative Officer (AO)</option>
                      <option value="Permanent Instructor (PI Staff)">Permanent Instructor (Subedar / Havildar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      SBU Employee ID / Army Regimental No*
                    </label>
                    <input
                      type="text"
                      required
                      value={adminForm.employeeId}
                      onChange={(e) => setAdminForm({ ...adminForm, employeeId: e.target.value })}
                      placeholder="e.g. SBU-FAC-1904 or JC-204810"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Email Address*
                    </label>
                    <input
                      type="email"
                      required
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      placeholder="e.g. rajeshwar@sbu.ac.in"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Battalion Authorization Key (Security voucher)
                    </label>
                    <input
                      type="text"
                      value={adminForm.accessKey}
                      onChange={(e) => setAdminForm({ ...adminForm, accessKey: e.target.value })}
                      placeholder="e.g. 19JHR-AUTH-2026"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Desired Officer Password*
                    </label>
                    <input
                      type="password"
                      required
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      placeholder="Security password"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>Request Officer Authorization & Credentials</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
