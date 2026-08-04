import React, { useState, useMemo } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Search, 
  ShieldCheck, 
  FileText, 
  Award, 
  Activity, 
  PhoneCall, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  BookOpen
} from "lucide-react";

interface FaqItem {
  id: string;
  category: "eligibility" | "physical" | "documents" | "benefits" | "training";
  categoryLabel: string;
  question: string;
  answer: string;
  highlights?: string[];
}

const FAQ_DATA: FaqItem[] = [
  {
    id: "faq-1",
    category: "eligibility",
    categoryLabel: "Recruitment & Eligibility",
    question: "Who is eligible to join NCC Senior Division (SD) and Senior Wing (SW) at Sarala Birla University?",
    answer: "All regular 1st year and 2nd year undergraduate and diploma students of Sarala Birla University, Ranchi (B.Tech, BCA, BBA, B.Sc, MBA, BA, Diploma, etc.) under 26 years of age who satisfy physical fitness standards are eligible. Male candidates join the Senior Division (SD) and female candidates join the Senior Wing (SW) under 19 Jharkhand Battalion NCC.",
    highlights: ["SBU Regular 1st & 2nd Year Students", "Age Limit: Under 26 Years", "SD (Male) & SW (Female) Vacancies"]
  },
  {
    id: "faq-2",
    category: "physical",
    categoryLabel: "Physical Standards & Tests",
    question: "What are the physical fitness tests and standards during the recruitment rally?",
    answer: "The physical efficiency test (PET) conducted by the Battalion PI staff includes:\n• 1600m Run: Male candidates target under 6:00 mins; Female candidates run 800m.\n• Height Standards: Male (SD) minimum ~165 cm; Female (SW) minimum ~152 cm.\n• Strength Exercises: 20+ Push-ups, 20+ Sit-ups, and chin-ups.\n• Medical Fitness: Must produce a doctor-certified medical fitness report.",
    highlights: ["1600m Run (Male) / 800m Run (Female)", "Height: 165cm (SD) / 152cm (SW)", "Medical Certificate Mandatory"]
  },
  {
    id: "faq-3",
    category: "eligibility",
    categoryLabel: "Recruitment & Eligibility",
    question: "What is the complete 3-stage selection procedure on campus?",
    answer: "Selection is conducted transparently by the Associate NCC Officer (ANO) and 19 JHR BN NCC Permanent Instructor (PI) staff in 3 sequential phases:\n1. Physical Efficiency Test (PET): 1600m run, pushups, sit-ups, and physical measurements.\n2. Written General Knowledge & Aptitude Test: Basic English, General Awareness, Indian Armed Forces history, and current affairs.\n3. Interview & Document Verification: Personal interview and verification of educational & identity credentials.",
    highlights: ["Phase 1: Physical Test", "Phase 2: Written GK Test", "Phase 3: Interview & Verification"]
  },
  {
    id: "faq-4",
    category: "documents",
    categoryLabel: "Documents & DBT",
    question: "What documents are required to be attached with the Form 1 Application?",
    answer: "Applicants must attach self-attested copies of:\n1. SBU Identity Card / Admission Fee Receipt copy\n2. 10th & 12th Class Marksheets & Passing Certificates\n3. Aadhaar Card copy & Blood Group Certificate\n4. Bank Passbook first page (showing Account No. & IFSC for Direct Benefit Transfer of camp allowance)\n5. Doctor's Medical Fitness Certificate (Form 1 Annexure)\n6. 4 passport-size photographs in formal posture.",
    highlights: ["SBU ID / Admission Receipt", "Aadhaar & Bank Passbook (DBT)", "Medical Fitness Certificate"]
  },
  {
    id: "faq-5",
    category: "benefits",
    categoryLabel: "Certificates & SSB Benefits",
    question: "Is there any enrollment fee or training charge for joining NCC at SBU?",
    answer: "No! NCC enrollment is 100% FREE OF COST. All uniforms, equipment, camp mess allowances, firing ammunition, and travel expenses during official training camps are fully funded by the Ministry of Defence, Government of India, and Bihar & Jharkhand Directorate.",
    highlights: ["100% Free of Cost", "Uniform & Camp Expenses Funded by MoD", "Camp Mess Allowance via Direct Benefit Transfer"]
  },
  {
    id: "faq-6",
    category: "benefits",
    categoryLabel: "Certificates & SSB Benefits",
    question: "How does the NCC 'C' Certificate help in Indian Armed Forces & SSB Direct Entry?",
    answer: "Holders of NCC 'C' Certificate with 'A' or 'B' grading receive major career advantages:\n• Direct SSB Interview: Eligible for Indian Army NCC Special Entry Scheme (Officer rank) without taking the written UPSC CDS exam.\n• Bonus Marks: 10-15 bonus marks in Agniveer, State Police (Jharkhand Police), CAPF (BSF, CISF, CRPF), and paramilitary recruitment exams.\n• Preference in Corporate Security & PSUs: Reliance, Tata, and PSUs prioritize 'C' certificate cadets.",
    highlights: ["Direct SSB Interview (No Written Exam)", "Bonus Marks in Police & CAPF Exams", "Officer Entry in Army, Navy & Air Force"]
  },
  {
    id: "faq-7",
    category: "training",
    categoryLabel: "Training & Camps",
    question: "Will NCC drill and parade sessions affect my university semester classes?",
    answer: "No. Routine drill and physical training parades are conducted early morning or on weekends so academic lectures and semester exams are never disrupted. Sarala Birla University grants official duty leave / attendance relaxation for cadets attending mandatory national camps (ATC, CATC, RDC, EBSB).",
    highlights: ["Morning/Weekend Parades Only", "Official SBU Duty Leave for Camps", "Zero Academic Conflict"]
  },
  {
    id: "faq-8",
    category: "training",
    categoryLabel: "Training & Camps",
    question: "What is the course duration and criteria for 'B' & 'C' Certificate exams?",
    answer: "The Senior Division / Wing training spans 3 years:\n• Year 1 & 2: Complete 2 years of institutional training and 1 Annual Training Camp (ATC) to appear for the 'B' Certificate exam.\n• Year 3: Complete 1 additional year of advanced training and a second national camp to appear for the 'C' Certificate exam.",
    highlights: ["'B' Cert: 2 Years + 1 ATC Camp", "'C' Cert: 3 Years + 2 Camps", "Grading based on Drill, Firing & Written Exam"]
  },
  {
    id: "faq-9",
    category: "documents",
    categoryLabel: "Documents & DBT",
    question: "Why is a Bank Account (DBT) mandatory during NCC registration?",
    answer: "Under Government of India Direct Benefit Transfer (DBT) norms, camp mess allowances, washing allowances, and travel reimbursements are credited directly to the cadet's personal bank account by 19 Jharkhand Battalion NCC.",
    highlights: ["Direct Allowance Credit from Battalion", "Prevents Payment Delays", "Requires Active Bank A/C & IFSC"]
  },
  {
    id: "faq-10",
    category: "training",
    categoryLabel: "Training & Camps",
    question: "How can I track my enrollment application status online?",
    answer: "Click the 'Track Application' button on the navigation bar or home page and enter your 12-digit Application ID (e.g., SBU-NCC-2026-XXXX) or SBU Roll Number. You will see real-time updates (Pending Review, Verified, Physical Test Scheduled, or Enrolled) and can print your official Form 1 slip.",
    highlights: ["Instant Online Status Check", "Download Official Form 1 Slip", "Regimental No. Verification"]
  }
];

interface FaqSectionProps {
  onStartEnrollment?: () => void;
  openStatusModal?: () => void;
  openAiAssistant?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  onStartEnrollment,
  openStatusModal,
  openAiAssistant
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIds, setOpenIds] = useState<string[]>(["faq-1", "faq-2"]);

  const categories = [
    { id: "all", label: "All Questions", icon: BookOpen },
    { id: "eligibility", label: "Eligibility & Selection", icon: ShieldCheck },
    { id: "physical", label: "Physical Standards", icon: Activity },
    { id: "documents", label: "Documents & DBT", icon: FileText },
    { id: "benefits", label: "Certificates & SSB", icon: Award },
    { id: "training", label: "Training & Camps", icon: CheckCircle2 },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch = 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        (item.highlights && item.highlights.some(h => h.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExpandAll = () => {
    setOpenIds(filteredFaqs.map((f) => f.id));
  };

  const handleCollapseAll = () => {
    setOpenIds([]);
  };

  return (
    <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200" id="faq-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Recruitment & Eligibility FAQ
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Find clear, official answers regarding SBU NCC Coy enrollment, physical fitness benchmarks, SSB direct entry benefits, required documents, and camp training.
          </p>
        </div>

        {/* Search & Action Controls */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. '1600m run', 'height', 'SSB', 'fee', 'documents', 'female')..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-10 py-3.5 text-sm font-medium text-slate-900 shadow-sm focus:ring-2 focus:ring-[#002147] focus:border-[#002147] focus:outline-hidden transition-all"
              id="faq-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-900 px-2 py-1 bg-slate-100 rounded-md cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#002147] text-white shadow-sm border-b-2 border-yellow-500"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                  id={`faq-cat-${cat.id}`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-yellow-400" : "text-slate-500"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Expand / Collapse All Controls */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
            <span>
              Showing <strong className="text-slate-900">{filteredFaqs.length}</strong> questions
              {selectedCategory !== "all" ? ` in ${categories.find(c => c.id === selectedCategory)?.label}` : ""}
            </span>

            <div className="flex items-center space-x-3 font-semibold">
              <button
                onClick={handleExpandAll}
                className="hover:text-[#002147] cursor-pointer"
                id="faq-expand-all"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                onClick={handleCollapseAll}
                className="hover:text-[#002147] cursor-pointer"
                id="faq-collapse-all"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-4xl mx-auto space-y-3 text-left">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No matching questions found</h3>
              <p className="text-xs text-slate-500">
                Try adjusting your search term or selecting "All Questions". You can also ask our AI Assistant.
              </p>
              {openAiAssistant && (
                <button
                  onClick={openAiAssistant}
                  className="bg-[#002147] text-white font-bold px-4 py-2 rounded-lg text-xs inline-flex items-center space-x-2 shadow-sm cursor-pointer border-l-2 border-yellow-500"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>Ask Subedar Major AI Assistant</span>
                </button>
              )}
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
                    isOpen 
                      ? "border-[#002147] shadow-sm ring-1 ring-[#002147]/10" 
                      : "border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-slate-900 text-sm sm:text-base flex items-start justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                    id={`faq-btn-${faq.id}`}
                  >
                    <div className="space-y-1">
                      <h3 className="text-slate-900 font-extrabold text-sm sm:text-base leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-100 text-[#002147] shrink-0 mt-1">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#002147]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 pt-0 sm:px-5 space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      <div className="pt-3 whitespace-pre-line font-normal text-slate-700">
                        {faq.answer}
                      </div>

                      {faq.highlights && faq.highlights.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {faq.highlights.map((hl, i) => (
                            <span 
                              key={i}
                              className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center space-x-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{hl}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Contact & Quick Assistance Box */}
        <div className="max-w-4xl mx-auto bg-[#002147] text-white rounded-xl p-6 sm:p-8 shadow-md border border-slate-800 border-l-4 border-l-yellow-500 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-yellow-400 text-xs font-bold uppercase tracking-wider">
              <PhoneCall className="w-4 h-4 text-yellow-400" />
              <span>Still Have Questions?</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              SBU NCC Coy Officer & Battalion Helpdesk
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Visit the NCC Office at SBU Birla Campus, Mahilong, Ranchi or ask our 24/7 Subedar Major AI Assistant for instant rules & syllabus guidance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onStartEnrollment && (
              <button
                onClick={onStartEnrollment}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer uppercase tracking-wider"
                id="faq-apply-now-btn"
              >
                <span>Apply Form 1</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
