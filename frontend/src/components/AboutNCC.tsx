import React, { useState } from "react";
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Compass, 
  Flag, 
  HeartHandshake, 
  Music, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Users,
  Activity,
  CheckSquare,
  Zap,
  Target,
  MapPin,
  ExternalLink,
  Phone,
  Navigation
} from "lucide-react";
import { 
  BATTALION_DETAILS, 
  CERTIFICATE_BENEFITS, 
  CORE_VALUES, 
  PHYSICAL_FITNESS_STANDARDS,
  REAL_LOCATIONS_DATA,
  SSB_SPECIAL_ENTRY_DETAILS 
} from "../data/nccData";

export const AboutNCC: React.FC = () => {
  const [showSongModal, setShowSongModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"sd" | "sw">("sd");

  return (
    <section className="py-12 bg-white border-b border-slate-200" id="about-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What Makes the National Cadet Corps Special?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            The National Cadet Corps (NCC) is the youth wing of the Indian Armed Forces. Headquartered in New Delhi, it is open to school and college students on a voluntary basis, instilling patriotism, character, camaraderie, and selfless service.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_VALUES.map((pillar, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-[#002147] transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[#002147] text-yellow-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <ShieldCheck className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{pillar.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* Deep Dive Grid: Motto, Aims & Song */}
        <div className="bg-[#002147] text-white rounded-xl p-6 sm:p-8 shadow-md border border-slate-800 text-left border-l-4 border-l-yellow-500">
          <div className="space-y-4 text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              "{BATTALION_DETAILS.motto}"
            </h3>
            <p className="text-yellow-400 font-bold text-base">
              ({BATTALION_DETAILS.mottoHindi})
            </p>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-4xl">
              The NCC aims at developing character, comradeship, discipline, a secular outlook, the spirit of adventure, and ideals of selfless service amongst young citizens. Further, it aims to create a pool of organized, trained, and motivated youth with leadership qualities in all walks of life.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowSongModal(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center space-x-2 shadow-xs transition-all cursor-pointer uppercase tracking-wider"
                id="ncc-song-btn"
              >
                <Music className="w-4 h-4 text-slate-950" />
                <span>Read NCC Song ("Hum Sab Bharatiya Hain")</span>
              </button>
            </div>
          </div>
        </div>

        {/* Verified Research: Physical Fitness Benchmarks (SD & SW) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-left shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Physical Efficiency Test (PET) Benchmarks
              </h3>
            </div>

            <div className="flex items-center space-x-2 bg-white border border-slate-300 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("sd")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === "sd" 
                    ? "bg-[#002147] text-white shadow-xs" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Senior Division (SD - Male)
              </button>
              <button
                onClick={() => setActiveTab("sw")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === "sw" 
                    ? "bg-[#002147] text-white shadow-xs" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Senior Wing (SW - Female)
              </button>
            </div>
          </div>

          {/* Physical Standards Display */}
          {activeTab === "sd" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Endurance Test</span>
                <p className="text-sm font-black text-slate-900">{PHYSICAL_FITNESS_STANDARDS.sdMale.run}</p>
                <p className="text-emerald-700 font-semibold">• {PHYSICAL_FITNESS_STANDARDS.sdMale.runTimeExcellent}</p>
                <p className="text-slate-600">• {PHYSICAL_FITNESS_STANDARDS.sdMale.runTimeGood}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Strength Exercises</span>
                <p className="text-sm font-black text-slate-900">Upper Body & Core</p>
                <p className="text-slate-700 font-semibold">• Pull-ups: {PHYSICAL_FITNESS_STANDARDS.sdMale.pullups}</p>
                <p className="text-slate-700 font-semibold">• Push-ups: {PHYSICAL_FITNESS_STANDARDS.sdMale.pushups}</p>
                <p className="text-slate-700 font-semibold">• Sit-ups: {PHYSICAL_FITNESS_STANDARDS.sdMale.situps}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Anthropometric Standards</span>
                <p className="text-sm font-black text-slate-900">Height & Chest</p>
                <p className="text-slate-700 font-semibold">• Min Height: {PHYSICAL_FITNESS_STANDARDS.sdMale.minHeightCm} cm</p>
                <p className="text-slate-700 font-semibold">• Chest: {PHYSICAL_FITNESS_STANDARDS.sdMale.minChestCm}</p>
                <p className="text-slate-600">• BMI: {PHYSICAL_FITNESS_STANDARDS.sdMale.bmiRange}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Endurance Test</span>
                <p className="text-sm font-black text-slate-900">{PHYSICAL_FITNESS_STANDARDS.swFemale.run}</p>
                <p className="text-emerald-700 font-semibold">• Excellent: {PHYSICAL_FITNESS_STANDARDS.swFemale.runTimeExcellent}</p>
                <p className="text-slate-600">• Good: {PHYSICAL_FITNESS_STANDARDS.swFemale.runTimeGood}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Agility & Core</span>
                <p className="text-sm font-black text-slate-900">Flexibility & Speed</p>
                <p className="text-slate-700 font-semibold">• Shuttle Run: {PHYSICAL_FITNESS_STANDARDS.swFemale.shuttleRun}</p>
                <p className="text-slate-700 font-semibold">• Core Strength: {PHYSICAL_FITNESS_STANDARDS.swFemale.flexedArmHang}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Anthropometric Standards</span>
                <p className="text-sm font-black text-slate-900">Height & BMI</p>
                <p className="text-slate-700 font-semibold">• Min Height: {PHYSICAL_FITNESS_STANDARDS.swFemale.minHeightCm} cm</p>
                <p className="text-slate-600">• BMI: {PHYSICAL_FITNESS_STANDARDS.swFemale.bmiRange}</p>
              </div>
            </div>
          )}

          {/* Medical mandatory bullets */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Mandatory Medical Fitness Standards</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-amber-900/90">
              {PHYSICAL_FITNESS_STANDARDS.medicalMandatory.map((med, i) => (
                <div key={i} className="flex items-start space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>{med}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SSB Special Entry Highlight Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#002147] to-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 text-left border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-2xl font-extrabold text-white">
                {SSB_SPECIAL_ENTRY_DETAILS.schemeName}
              </h3>
              <p className="text-xs sm:text-sm text-yellow-200 font-semibold">
                ★ {SSB_SPECIAL_ENTRY_DETAILS.noExamAdvantage}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cadets holding 'C' Certificate with Grade 'A' or 'B' can directly appear for the 5-Day SSB Interview for Officer rank (Short Service Commission) without writing the written CDS examination.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-xs space-y-2 shrink-0 max-w-xs">
              <div className="flex justify-between text-yellow-300 font-bold border-b border-white/10 pb-1.5">
                <span>Training Academy:</span>
                <span className="text-white">OTA Chennai</span>
              </div>
              <div className="flex justify-between text-yellow-300 font-bold border-b border-white/10 pb-1.5">
                <span>Duration:</span>
                <span className="text-white">49 Weeks</span>
              </div>
              <div className="flex justify-between text-yellow-300 font-bold">
                <span>Annual Vacancies:</span>
                <span className="text-emerald-400">100 Cadets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Researched Real Location & Map Directions Section */}
        <div className="space-y-6">
          <div className="text-left space-y-1">
            <h3 className="text-2xl font-black text-slate-900">
              Unit Headquarters & Campus Locations
            </h3>
            <p className="text-xs text-slate-600">
              Validated addresses, landmarks, and pincodes for Sarala Birla University Coy, 19 JHR BN Headquarters, Group HQ, and Bihar & Jharkhand Directorate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {REAL_LOCATIONS_DATA.map((loc, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-xs hover:border-[#002147] transition-all text-left flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-end gap-2 border-b border-slate-100 pb-2.5">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{loc.phone}</span>
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <MapPin className="w-4.5 h-4.5 text-[#002147] shrink-0" />
                    <span>{loc.title}</span>
                  </h4>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {loc.address}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <span className="font-bold text-slate-800">Landmark:</span> {loc.landmark}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Reach:</span> {loc.distance}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 truncate font-semibold">
                    Contact: <span className="text-slate-800">{loc.contactPerson}</span>
                  </span>

                  <a
                    href={loc.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 bg-[#002147] hover:bg-blue-900 text-yellow-400 font-bold px-3 py-1.5 rounded-lg text-xs shrink-0 transition-all shadow-2xs"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 text-yellow-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Perks & Benefits Section */}
        <div className="space-y-6">
          <div className="text-left space-y-1">
            <h3 className="text-2xl font-bold text-slate-900">
              Incentives & Career Benefits for SBU NCC Cadets
            </h3>
            <p className="text-xs text-slate-600">
              Why joining 19 JHR BN NCC at Sarala Birla University gives you a significant career advantage in Defence, Police, and Corporate sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CERTIFICATE_BENEFITS.map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left shadow-2xs space-y-3">
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm border-b border-slate-200 pb-3">
                  <Award className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{item.cert}</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-700">
                  {item.benefits.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Official NCC Act: Cessation of Enrollment & Discharge Rules Section */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-left shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                <span>Statutory Regulations • NCC Act 1948</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Cessation of Enrollment & Discharge Regulations
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              19 JHR BN NCC • SBU Battalion Standing Orders
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            As mandated under Section 12 & 13 of the National Cadet Corps Act 1948 and Rule 13 of NCC Rules, enrollment in Senior Division / Senior Wing at Sarala Birla University shall cease under the following statutory circumstances:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <h4 className="font-extrabold text-yellow-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1. Completion of Tenure & Graduation</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                On completion of the prescribed 3-year tenure in Senior Division/Wing or on ceasing to be a regular student of Sarala Birla University, Ranchi.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <h4 className="font-extrabold text-yellow-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>2. Medical Unfitness / Discharge</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                If certified by a Military Medical Officer or Registered Medical Practitioner as permanently unfit for further drill and physical training.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <h4 className="font-extrabold text-yellow-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>3. Voluntary Resignation with Approval</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                On application by the cadet submitted through the Associate NCC Officer (ANO) to the Commanding Officer 19 JHR BN NCC, citing genuine academic or medical reasons.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <h4 className="font-extrabold text-yellow-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>4. Disciplinary Discharge & Equipment Return</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                If discharged for indiscipline or failing parade attendance (&lt;75%). All issued uniform items, badges, and equipment must be returned to 19 JHR BN Stores.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Song Modal */}
      {showSongModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-300 text-left relative">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Music className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">{BATTALION_DETAILS.nccSongTitle}</h3>
              </div>
              <button
                onClick={() => setShowSongModal(false)}
                className="text-slate-500 hover:text-slate-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed bg-amber-50/60 p-4 rounded-xl border border-amber-200 max-h-80 overflow-y-auto">
              {BATTALION_DETAILS.nccSongLyrics}
            </pre>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowSongModal(false)}
                className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
