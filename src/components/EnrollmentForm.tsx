import React, { useState } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { 
  AlertCircle, 
  Award, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  CreditCard, 
  Download, 
  FileCheck2, 
  FileText, 
  GraduationCap, 
  Heart, 
  HeartPulse, 
  Info, 
  Printer, 
  ShieldCheck, 
  Sparkles, 
  User 
} from "lucide-react";
import { CadetRecord } from "../types";
import { EnterpriseDataPlatform } from "../services/dataPlatform";

interface EnrollmentFormProps {
  onSuccessSubmitted: (record: CadetRecord) => void;
  onOpenPrintableSlip: (record: CadetRecord) => void;
  openStatusModalWithQuery: (query: string) => void;
}

export const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  onSuccessSubmitted,
  onOpenPrintableSlip,
  openStatusModalWithQuery
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [submittedRecord, setSubmittedRecord] = useState<CadetRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "SD" as "SD" | "SW",
    dob: "2006-05-15",
    aadhaarNumber: "",
    mobile: "",
    email: "",
    fatherName: "",
    motherName: "",
    bloodGroup: "O+",
    heightCm: "172",
    weightKg: "64",
    identificationMark: "Mole on right wrist",

    // SBU Academic
    sbuDepartment: "Faculty of Engineering & Technology",
    sbuCourse: "B.Tech Computer Science",
    sbuRollNo: "",
    sbuYear: "1st Year",
    sbuSemester: "1st Sem",
    marksPercentage10th: "85.0",
    marksPercentage12th: "82.5",

    // Physical & Co-curricular
    run1600mTime: "6 min 15 sec",
    pushupsCount: "30",
    hasJuniorCertificate: false,
    juniorCertificateNo: "",
    sportsLevel: "District" as "None" | "College" | "District" | "State" | "National",
    sportsDetails: "",

    // Address & Bank
    presentAddress: "SBU Campus Hostel, Namkum, Ranchi, Jharkhand",
    permanentAddress: "",
    pinCode: "834010",
    bankName: "State Bank of India",
    accountNumber: "",
    ifscCode: "SBIN0001234",

    // Guardian
    guardianName: "",
    guardianRelation: "Father",
    guardianMobile: "",

    // Consent
    declarationAccepted: false,
    parentConsentAccepted: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Instant Physical Rating Estimator
  const getPhysicalRating = () => {
    const height = Number(formData.heightCm) || 0;
    const runSec = formData.run1600mTime.includes("5 min") ? 5 : 6;
    if (formData.gender === "SD") {
      if (height >= 170 && runSec <= 5) return { rating: "Excellent (Grade A)", color: "text-emerald-700 bg-emerald-50 border-emerald-300" };
      if (height >= 168) return { rating: "Good (Eligible)", color: "text-blue-800 bg-blue-50 border-blue-300" };
      return { rating: "Height Relaxation Subject to Tribal/State Norms", color: "text-amber-800 bg-amber-50 border-amber-300" };
    } else {
      if (height >= 152) return { rating: "Eligible for Senior Wing (SW)", color: "text-emerald-700 bg-emerald-50 border-emerald-300" };
      return { rating: "Height Relaxation as per Army Norms", color: "text-amber-800 bg-amber-50 border-amber-300" };
    }
  };

  const handleNextStep = () => {
    setErrorMessage("");
    if (activeStep === 1) {
      if (!formData.fullName.trim()) return setErrorMessage("Please enter Cadet Full Name.");
      if (!formData.aadhaarNumber.trim() || formData.aadhaarNumber.length < 12) return setErrorMessage("Please enter valid 12-digit Aadhaar Number.");
      if (!formData.mobile.trim() || formData.mobile.length < 10) return setErrorMessage("Please enter valid 10-digit Mobile Number.");
      if (!formData.fatherName.trim()) return setErrorMessage("Please enter Father's Name.");
    }
    if (activeStep === 2) {
      if (!formData.sbuRollNo.trim()) return setErrorMessage("Please enter your Sarala Birla University Roll / Enrollment Number.");
      if (!formData.sbuCourse.trim()) return setErrorMessage("Please select your SBU Course.");
    }
    if (activeStep === 3) {
      if (!formData.heightCm || Number(formData.heightCm) < 140) return setErrorMessage("Please enter valid height in cm.");
    }
    if (activeStep === 4) {
      if (!formData.bankName.trim() || !formData.accountNumber.trim()) return setErrorMessage("Please provide Bank Name and Account Number for camp allowance DBT.");
      if (!formData.presentAddress.trim()) return setErrorMessage("Please enter Present Address.");
    }

    setActiveStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage("");
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.declarationAccepted || !formData.parentConsentAccepted) {
      return setErrorMessage("Please check both Declaration and Parent/Guardian Consent checkboxes.");
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        heightCm: Number(formData.heightCm),
        weightKg: Number(formData.weightKg),
        marksPercentage10th: Number(formData.marksPercentage10th),
        marksPercentage12th: Number(formData.marksPercentage12th),
        pushupsCount: Number(formData.pushupsCount),
        permanentAddress: formData.permanentAddress || formData.presentAddress,
        guardianName: formData.guardianName || formData.fatherName,
        guardianMobile: formData.guardianMobile || formData.mobile,
      };

      const res = await EnterpriseDataPlatform.submitEnrollment(payload);

      if (!res.success || !res.data?.enrollment) {
        throw new Error(res.error || "Failed to submit enrollment application.");
      }

      setSubmittedRecord(res.data.enrollment);
      onSuccessSubmitted(res.data.enrollment);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while submitting the application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-10 bg-white border-b border-slate-200" id="enrollment-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 text-xs font-bold text-[#002147]">
            <FileCheck2 className="w-3.5 h-3.5 text-[#002147]" />
            <span>Form 1 (Rules 7 & 11) • NCC Act 1948</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Application Form for NCC Senior Division / Senior Wing Enrollment
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            19 Jharkhand Battalion NCC, Ranchi • Sarala Birla University Company
          </p>
        </div>

        {/* Successful Submission View */}
        {submittedRecord ? (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-6 sm:p-8 space-y-6 text-left shadow-md">
            <div className="flex items-center space-x-3 border-b border-emerald-200 pb-4">
              <div className="w-12 h-12 rounded-full bg-[#002147] text-yellow-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-7 h-7 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#002147]">
                  Enrollment Application Submitted Successfully!
                </h3>
                <p className="text-xs text-emerald-800 font-medium mt-0.5">
                  Registered with 19 Jharkhand Battalion NCC, Ranchi
                </p>
              </div>
            </div>

            {/* Application Registration Ticket */}
            <div className="bg-white border border-emerald-300 rounded-xl p-5 space-y-4 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-500 font-semibold">Application Tracking ID:</p>
                  <p className="text-lg font-black text-[#002147] tracking-wide font-mono mt-0.5">
                    {submittedRecord.id}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold">Cadet Full Name:</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {submittedRecord.fullName} ({submittedRecord.gender})
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold">SBU Roll Number:</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {submittedRecord.sbuRollNo}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold">Status:</p>
                  <span className="inline-block bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded text-xs mt-0.5 border border-amber-300">
                    {submittedRecord.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
                <strong>Next Instructions:</strong> Please take a printout of Form 1 application slip. Bring original 10th/12th marksheets, Aadhaar card, SBU ID card, Bank passbook photocopy, and medical fitness certificate to SBU Sports Ground on parade day at 06:00 AM.
              </div>
            </div>

            {/* Action Buttons for Printable Slip & Status */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onOpenPrintableSlip(submittedRecord)}
                className="bg-[#002147] hover:bg-[#001733] text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center space-x-2 shadow-sm cursor-pointer border-l-4 border-l-yellow-500"
                id="print-form-slip-btn"
              >
                <Printer className="w-4 h-4 text-yellow-400" />
                <span>Print Official Form 1 Application Slip</span>
              </button>

              <button
                onClick={() => openStatusModalWithQuery(submittedRecord.id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center space-x-2 cursor-pointer uppercase tracking-wider shadow-sm"
                id="track-new-application-btn"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Track Application Online</span>
              </button>

              <button
                onClick={() => {
                  setSubmittedRecord(null);
                  setActiveStep(1);
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-xs border border-slate-300 cursor-pointer"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Step Form Layout */
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 text-left">
            
            {/* Step Indicators Bar */}
            <div className="grid grid-cols-5 gap-2 pb-4 border-b border-slate-200 text-center">
              {[
                { num: 1, label: "Personal" },
                { num: 2, label: "Academic" },
                { num: 3, label: "Physical" },
                { num: 4, label: "Bank & Addr" },
                { num: 5, label: "Consent" },
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (s.num < activeStep) setActiveStep(s.num);
                  }}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                    activeStep === s.num
                      ? "bg-[#002147] text-yellow-400 shadow-sm border-b-2 border-yellow-500"
                      : activeStep > s.num
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-white text-slate-400 border border-slate-200 opacity-70"
                  }`}
                >
                  <span>Step {s.num}: {s.label}</span>
                </button>
              ))}
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-300 text-red-900 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: PERSONAL DETAILS */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-900" />
                    <span>Cadet Personal & Identification Details</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name of Cadet (in BLOCK Letters)*
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. RAJESH KUMAR MAHATO"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Division / Wing (Gender)*
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                      >
                        <option value="SD">Senior Division (SD - Male Cadet)</option>
                        <option value="SW">Senior Wing (SW - Female Cadet)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Date of Birth*
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        12-Digit Aadhaar Card Number*
                      </label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={formData.aadhaarNumber}
                        onChange={handleChange}
                        placeholder="8472 1928 4012"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number (WhatsApp Enabled)*
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="9835123456"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address*
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="cadet@sbu.ac.in"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Father's Full Name*
                      </label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        placeholder="Father's Name"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mother's Full Name*
                      </label>
                      <input
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleChange}
                        placeholder="Mother's Name"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Blood Group*
                      </label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                      >
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Identification Mark (Scar/Mole)
                      </label>
                      <input
                        type="text"
                        name="identificationMark"
                        value={formData.identificationMark}
                        onChange={handleChange}
                        placeholder="e.g. Mole on right wrist"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SBU ACADEMIC DETAILS */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-blue-900" />
                    <span>Sarala Birla University Academic Information</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Faculty / Department at SBU Ranchi*
                      </label>
                      <select
                        name="sbuDepartment"
                        value={formData.sbuDepartment}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                      >
                        <option value="Faculty of Engineering & Technology">Faculty of Engineering & Tech</option>
                        <option value="Department of Computer Applications">Department of Computer Applications (BCA/MCA)</option>
                        <option value="Faculty of Management & Commerce">Faculty of Management & Commerce (BBA/MBA)</option>
                        <option value="Faculty of Applied Sciences">Faculty of Applied Sciences (B.Sc/M.Sc)</option>
                        <option value="Faculty of Humanities & Social Sciences">Faculty of Humanities & Arts</option>
                        <option value="Faculty of Nursing & Allied Health">Faculty of Nursing & Allied Health</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Course / Program Enrolled*
                      </label>
                      <input
                        type="text"
                        name="sbuCourse"
                        value={formData.sbuCourse}
                        onChange={handleChange}
                        placeholder="e.g. B.Tech Computer Science / BCA / BBA"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        SBU University Roll No / Registration No*
                      </label>
                      <input
                        type="text"
                        name="sbuRollNo"
                        value={formData.sbuRollNo}
                        onChange={handleChange}
                        placeholder="e.g. SBU25BTECH042"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Year of Study & Semester*
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          name="sbuYear"
                          value={formData.sbuYear}
                          onChange={handleChange}
                          className="bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                        </select>
                        <select
                          name="sbuSemester"
                          value={formData.sbuSemester}
                          onChange={handleChange}
                          className="bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                        >
                          <option value="1st Sem">1st Sem</option>
                          <option value="2nd Sem">2nd Sem</option>
                          <option value="3rd Sem">3rd Sem</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Class 10th (Matric) Percentage (%)*
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="marksPercentage10th"
                        value={formData.marksPercentage10th}
                        onChange={handleChange}
                        placeholder="85.0"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Class 12th / Diploma Percentage (%)*
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="marksPercentage12th"
                        value={formData.marksPercentage12th}
                        onChange={handleChange}
                        placeholder="82.5"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PHYSICAL & CO-CURRICULAR */}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center space-x-2">
                    <HeartPulse className="w-4 h-4 text-red-600" />
                    <span>Physical Fitness & Co-Curricular Assessment</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Height in Centimeters (cm)*
                      </label>
                      <input
                        type="number"
                        name="heightCm"
                        value={formData.heightCm}
                        onChange={handleChange}
                        placeholder="172"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Weight in Kilograms (kg)*
                      </label>
                      <input
                        type="number"
                        name="weightKg"
                        value={formData.weightKg}
                        onChange={handleChange}
                        placeholder="64"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Estimated 1600m Run Time
                      </label>
                      <input
                        type="text"
                        name="run1600mTime"
                        value={formData.run1600mTime}
                        onChange={handleChange}
                        placeholder="e.g. 5 min 45 sec"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Max Continuous Push-ups Count
                      </label>
                      <input
                        type="number"
                        name="pushupsCount"
                        value={formData.pushupsCount}
                        onChange={handleChange}
                        placeholder="30"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2 bg-white border border-slate-200 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="hasJuniorCertCheck"
                          name="hasJuniorCertificate"
                          checked={formData.hasJuniorCertificate}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-900 rounded border-slate-300"
                        />
                        <label htmlFor="hasJuniorCertCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                          I possess NCC Junior Division/Wing 'A' Certificate from School
                        </label>
                      </div>

                      {formData.hasJuniorCertificate && (
                        <div className="pl-6 pt-1">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Junior Division 'A' Certificate Number:
                          </label>
                          <input
                            type="text"
                            name="juniorCertificateNo"
                            value={formData.juniorCertificateNo}
                            onChange={handleChange}
                            placeholder="e.g. JHR/JD/22/1042"
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Highest Sports / Athletics Level
                      </label>
                      <select
                        name="sportsLevel"
                        value={formData.sportsLevel}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                      >
                        <option value="None">None</option>
                        <option value="College">Inter-College / SBU Level</option>
                        <option value="District">District Championship</option>
                        <option value="State">State Championship</option>
                        <option value="National">National Level Player</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Sports Achievement Details
                      </label>
                      <input
                        type="text"
                        name="sportsDetails"
                        value={formData.sportsDetails}
                        onChange={handleChange}
                        placeholder="e.g. 100m Athletics Bronze Medalist"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                      />
                    </div>
                  </div>

                  {/* Physical Rating Calculator Widget */}
                  <div className={`p-3.5 rounded-xl border text-xs ${getPhysicalRating().color}`}>
                    <span className="font-bold">Physical Criteria Status: </span>
                    <span>{getPhysicalRating().rating}</span>
                  </div>
                </div>
              )}

              {/* STEP 4: BANK DETAILS & ADDRESS */}
              {activeStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span>Bank DBT Details & Emergency Address</span>
                  </h3>

                  <p className="text-xs text-slate-500">
                    Bank details are mandated by 19 Jharkhand Battalion for Direct Benefit Transfer (DBT) of camp mess allowances, washing allowances, and travel reimbursements.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bank Name*
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        placeholder="e.g. State Bank of India"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Account Number*
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        placeholder="38920194821"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        IFSC Code*
                      </label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleChange}
                        placeholder="SBIN0001234"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium uppercase"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Present Residence Address (Ranchi / Hostel)*
                      </label>
                      <textarea
                        name="presentAddress"
                        value={formData.presentAddress}
                        onChange={handleChange}
                        rows={2}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Permanent Address & Pin Code
                      </label>
                      <textarea
                        name="permanentAddress"
                        value={formData.permanentAddress}
                        onChange={handleChange}
                        placeholder="Leave blank if same as Present Address"
                        rows={2}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: DECLARATIONS & PARENT CONSENT */}
              {activeStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Declarations & Parent/Guardian Consent</span>
                  </h3>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs text-slate-700 leading-relaxed">
                    <h4 className="font-bold text-slate-900 uppercase">Declaration by Applicant Cadet:</h4>
                    <p>
                      I hereby declare that the details provided above are true to the best of my knowledge. I promise that I will undergo National Cadet Corps training willingly, abide by the rules of 19 Jharkhand Battalion NCC Ranchi, and maintain high standards of discipline.
                    </p>

                    <div className="flex items-start space-x-2 pt-2 border-t border-slate-100">
                      <input
                        type="checkbox"
                        id="decCheck"
                        name="declarationAccepted"
                        checked={formData.declarationAccepted}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-900 rounded border-slate-300 mt-0.5"
                      />
                      <label htmlFor="decCheck" className="font-bold text-slate-900 cursor-pointer">
                        I accept the Cadet Declaration and agree to undergo NCC parades & camps.
                      </label>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs text-slate-700 leading-relaxed">
                    <h4 className="font-bold text-slate-900 uppercase">Parent / Guardian Consent:</h4>
                    <p>
                      I permit my son/daughter/ward to join the Senior Division/Wing NCC at Sarala Birla University under 19 Jharkhand Battalion. I understand that NCC training involves parade drill, physical exercise, rifle firing, and residential camps.
                    </p>

                    <div className="flex items-start space-x-2 pt-2 border-t border-slate-100">
                      <input
                        type="checkbox"
                        id="parentCheck"
                        name="parentConsentAccepted"
                        checked={formData.parentConsentAccepted}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-900 rounded border-slate-300 mt-0.5"
                      />
                      <label htmlFor="parentCheck" className="font-bold text-slate-900 cursor-pointer">
                        Parent / Guardian has consented to NCC enrollment & camp participation.
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                {activeStep > 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 rounded-lg font-bold text-xs sm:text-sm flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors backdrop-blur-xs"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-700" />
                    <span>Previous Step</span>
                  </motion.button>
                ) : <div />}

                {activeStep < 5 ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 sm:px-7 sm:py-3.5 bg-[#002147] hover:bg-[#001733] text-yellow-400 rounded-lg font-extrabold text-xs sm:text-sm flex items-center space-x-2 shadow-sm cursor-pointer border-l-4 border-yellow-500 transition-all backdrop-blur-xs"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4.5 h-4.5 text-yellow-400" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3.5 sm:px-8 sm:py-4 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-lg font-black text-xs sm:text-sm flex items-center space-x-2.5 shadow-md cursor-pointer disabled:opacity-50 uppercase tracking-wider transition-all border border-yellow-600/50 backdrop-blur-xs"
                    id="submit-enrollment-form-btn"
                  >
                    {isSubmitting ? (
                      <span>Submitting Application to Battalion...</span>
                    ) : (
                      <>
                        <FileCheck2 className="w-5 h-5 text-slate-950 shrink-0" />
                        <span>Submit Official Form 1 Application</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>

            </form>
          </div>
        )}

      </div>
    </section>
  );
};
