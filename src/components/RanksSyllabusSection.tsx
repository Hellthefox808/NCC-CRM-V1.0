import React, { useState } from "react";
import { 
  Award, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Info, 
  ShieldCheck, 
  Star,
  CheckCircle2,
  Layers,
  GraduationCap,
  Target
} from "lucide-react";
import { 
  EXAM_MARKS_AND_GRADING, 
  NOTICES_DATA, 
  RANKS_DATA, 
  SYLLABUS_TOPICS 
} from "../data/nccData";

export const RanksSyllabusSection: React.FC = () => {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Who is eligible for Senior Division (SD) and Senior Wing (SW) NCC at Sarala Birla University?",
      a: "All regular 1st year and 2nd year undergraduate & diploma students of Sarala Birla University (B.Tech, BCA, BBA, B.Sc, MBA, BA, Diploma) under 26 years of age who satisfy physical fitness criteria (1600m run, pushups, height) are eligible to apply."
    },
    {
      q: "What is the duration of NCC 'B' and 'C' Certificate courses?",
      a: "The Senior Division course is 3 years total. 'B' Certificate examination is taken after 2 years of training & 1 camp. 'C' Certificate examination is taken after 3 years of training & 2 camps."
    },
    {
      q: "What is the marking scheme for NCC 'B' and 'C' Certificate examinations?",
      a: "The exam carries 500 Total Marks (350 Written Theory Marks + 150 Practical Marks). Candidates must score minimum 45% in each part and 50% aggregate overall. Grade 'A' requires 350+ marks (70%+)."
    },
    {
      q: "How does the Excel Nominal Roll export work for Battalion Officers?",
      a: "The ANO and Battalion Officers can log in to the Officer Portal and click 'Download Nominal Roll (.xlsx Excel)' to instantly receive an official 3-sheet Excel spreadsheet containing candidate details, physical scores, and bank DBT details for camp mess allowances."
    },
    {
      q: "Are female candidates eligible for Senior Wing (SW) at SBU Ranchi?",
      a: "Yes! Sarala Birla University has active vacancies for Senior Wing (SW) female cadets under 19 Jharkhand Battalion. Female cadets participate in rifle firing, RDC parade, EBSB camps, and adventure mountaineering."
    }
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-200" id="ranks-syllabus-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            NCC Cadet Ranks & Examination Syllabus
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Hierarchy of cadet non-commissioned officer ranks (NCOs) and structured 3-year Army Wing training curriculum under Bihar & Jharkhand Directorate.
          </p>
        </div>

        {/* 500-Mark Examination Scheme & Grading Card */}
        <div className="bg-[#002147] text-white rounded-2xl p-6 sm:p-8 space-y-6 text-left shadow-xl border border-slate-800 border-l-4 border-l-yellow-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                500-Mark Written & Practical Assessment Scheme
              </h3>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 text-xs font-bold text-yellow-300 shrink-0">
              <span>Pass Criteria: {EXAM_MARKS_AND_GRADING.passCriteria}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Written Theory */}
            <div className="bg-[#003366] border border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="font-bold text-yellow-400 uppercase tracking-wider text-[11px]">Written Theory Exam</span>
                <span className="bg-yellow-500 text-slate-950 font-black px-2 py-0.5 rounded text-[11px]">
                  {EXAM_MARKS_AND_GRADING.writtenMarks} Marks
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Covers Common Subjects (History, Drill theory, WT, Leadership, Disaster Mgmt) & Specialized Army Wing Subjects (Map Reading, Armed Forces, FC/BC).
              </p>
            </div>

            {/* Practical & Drill */}
            <div className="bg-[#003366] border border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="font-bold text-yellow-400 uppercase tracking-wider text-[11px]">Practical & Range Testing</span>
                <span className="bg-yellow-500 text-slate-950 font-black px-2 py-0.5 rounded text-[11px]">
                  {EXAM_MARKS_AND_GRADING.practicalMarks} Marks
                </span>
              </div>
              <ul className="space-y-1.5 text-slate-200 text-[11px]">
                {EXAM_MARKS_AND_GRADING.practicalStations.map((st, i) => (
                  <li key={i} className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Grading Scale */}
            <div className="bg-[#003366] border border-white/10 rounded-xl p-5 space-y-3">
              <span className="font-bold text-yellow-400 uppercase tracking-wider text-[11px] block border-b border-white/10 pb-2">
                Grading Benchmark Scale
              </span>
              <div className="space-y-2 text-[11px]">
                {EXAM_MARKS_AND_GRADING.grades.map((gr, i) => (
                  <div key={i} className="bg-white/5 p-2 rounded border border-white/10 space-y-0.5">
                    <div className="flex justify-between font-bold text-white">
                      <span>{gr.grade}</span>
                      <span className="text-yellow-300">{gr.range}</span>
                    </div>
                    <p className="text-[10px] text-slate-300">{gr.perk}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Structured Training Syllabus Breakdown */}
        <div className="space-y-6 text-left">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#002147]" />
              <span>SBU Army Wing Cadre Training Syllabus</span>
            </h3>
            <p className="text-xs text-slate-600">
              3-Year structured training syllabus prescribed by HQ DG NCC, New Delhi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SYLLABUS_TOPICS.map((sym, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
                <h4 className="text-sm font-bold text-[#002147] border-b border-slate-200 pb-2.5 flex items-center justify-between">
                  <span>{sym.subject}</span>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                    {idx === 0 ? "110 Theory + 90 Practical" : "110 Theory + 60 Practical"}
                  </span>
                </h4>

                <ul className="space-y-2 text-xs text-slate-700">
                  {sym.topics.map((tp, tIdx) => (
                    <li key={tIdx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#002147] shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{tp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Ranks Cards Grid */}
        <div className="space-y-4 text-left">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#002147]" />
              <span>Cadet Rank Hierarchy & Leadership Chain</span>
            </h3>
            <p className="text-xs text-slate-600">
              Non-Commissioned Officer (NCO) appointments awarded based on drill efficiency, camp performance, and ANO recommendation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {RANKS_DATA.map((rank, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-[#002147] transition-all space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-[#002147] text-yellow-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    {rank.abbr}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{rank.level}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{rank.rank}</h3>

                <p className="text-xs font-semibold text-amber-700">
                  Insignia: {rank.insignia}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200">
                  {rank.responsibilities}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Official Notices Grid */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 text-left shadow-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Official 19 Jharkhand Battalion Circulars & Notices</span>
            </h3>
            <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded">
              HQ Ranchi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NOTICES_DATA.map((notice) => (
              <div key={notice.id} className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                    {notice.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{notice.date}</span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">{notice.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{notice.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Frequently Asked Questions Accordion */}
        <div className="max-w-3xl mx-auto space-y-4 text-left">
          <h3 className="text-xl font-bold text-slate-900 text-center">
            Frequently Asked Questions (FAQ)
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-slate-900 text-sm flex items-center justify-between hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaqIdx === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#002147]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {openFaqIdx === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
