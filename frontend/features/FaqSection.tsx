import React, { useState, useMemo } from "react";
import {
  ChevronDown,
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
  BookOpen,
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
    question:
      "Who is eligible to join NCC Senior Division (SD) and Senior Wing (SW) at Sarala Birla University?",
    answer:
      "All regular 1st year and 2nd year undergraduate and diploma students of Sarala Birla University, Ranchi (B.Tech, BCA, BBA, B.Sc, MBA, BA, Diploma, etc.) under 26 years of age who satisfy physical fitness standards are eligible. Male candidates join the Senior Division (SD) and female candidates join the Senior Wing (SW) under 19 Jharkhand Battalion NCC.",
    highlights: [
      "SBU Regular 1st & 2nd Year Students",
      "Age Limit: Under 26 Years",
      "SD (Male) & SW (Female) Vacancies",
    ],
  },
  {
    id: "faq-2",
    category: "physical",
    categoryLabel: "Physical Standards & Tests",
    question: "What are the physical fitness tests and standards during the recruitment rally?",
    answer:
      "The physical efficiency test (PET) conducted by the Battalion PI staff includes:\n• 1600m Run: Male candidates target under 6:00 mins; Female candidates run 800m.\n• Height Standards: Male (SD) minimum ~165 cm; Female (SW) minimum ~152 cm.\n• Strength Exercises: 20+ Push-ups, 20+ Sit-ups, and chin-ups.\n• Medical Fitness: Must produce a doctor-certified medical fitness report.",
    highlights: [
      "1600m Run (Male) / 800m Run (Female)",
      "Height: 165cm (SD) / 152cm (SW)",
      "Medical Certificate Mandatory",
    ],
  },
  {
    id: "faq-3",
    category: "eligibility",
    categoryLabel: "Recruitment & Eligibility",
    question: "What is the complete 3-stage selection procedure on campus?",
    answer:
      "Selection is conducted transparently by the Associate NCC Officer (ANO) and 19 JHR BN NCC Permanent Instructor (PI) staff in 3 sequential phases:\n1. Physical Efficiency Test (PET): 1600m run, pushups, sit-ups, and physical measurements.\n2. Written General Knowledge & Aptitude Test: Basic English, General Awareness, Indian Armed Forces history, and current affairs.\n3. Interview & Document Verification: Personal interview and verification of educational & identity credentials.",
    highlights: [
      "Phase 1: Physical Test",
      "Phase 2: Written GK Test",
      "Phase 3: Interview & Verification",
    ],
  },
  {
    id: "faq-4",
    category: "documents",
    categoryLabel: "Documents & DBT",
    question: "What documents are required to be attached with the Form 1 Application?",
    answer:
      "Applicants must attach self-attested copies of:\n1. SBU Identity Card / Admission Fee Receipt copy\n2. 10th & 12th Class Marksheets & Passing Certificates\n3. Aadhaar Card copy & Blood Group Certificate\n4. Bank Passbook first page (showing Account No. & IFSC for Direct Benefit Transfer of camp allowance)\n5. Doctor's Medical Fitness Certificate (Form 1 Annexure)\n6. 4 passport-size photographs in formal posture.",
    highlights: [
      "SBU ID / Admission Receipt",
      "Aadhaar & Bank Passbook (DBT)",
      "Medical Fitness Certificate",
    ],
  },
  {
    id: "faq-5",
    category: "benefits",
    categoryLabel: "Certificates & SSB Benefits",
    question: "Is there any enrollment fee or training charge for joining NCC at SBU?",
    answer:
      "No! NCC enrollment is 100% FREE OF COST. All uniforms, equipment, camp mess allowances, firing ammunition, and travel expenses during official training camps are fully funded by the Ministry of Defence, Government of India, and Bihar & Jharkhand Directorate.",
    highlights: [
      "100% Free of Cost",
      "Uniform & Camp Expenses Funded by MoD",
      "Camp Mess Allowance via Direct Benefit Transfer",
    ],
  },
  {
    id: "faq-6",
    category: "benefits",
    categoryLabel: "Certificates & SSB Benefits",
    question: "How does the NCC 'C' Certificate help in Indian Armed Forces & SSB Direct Entry?",
    answer:
      "Holders of NCC 'C' Certificate with 'A' or 'B' grading receive major career advantages:\n• Direct SSB Interview: Eligible for Indian Army NCC Special Entry Scheme (Officer rank) without taking the written UPSC CDS exam.\n• Bonus Marks: 10-15 bonus marks in Agniveer, State Police (Jharkhand Police), CAPF (BSF, CISF, CRPF), and paramilitary recruitment exams.\n• Preference in Corporate Security & PSUs: Reliance, Tata, and PSUs prioritize 'C' certificate cadets.",
    highlights: [
      "Direct SSB Interview (No Written Exam)",
      "Bonus Marks in Police & CAPF Exams",
      "Officer Entry in Army, Navy & Air Force",
    ],
  },
  {
    id: "faq-7",
    category: "training",
    categoryLabel: "Training & Camps",
    question: "Will NCC drill and parade sessions affect my university semester classes?",
    answer:
      "No. Routine drill and physical training parades are conducted early morning or on weekends so academic lectures and semester exams are never disrupted. Sarala Birla University grants official duty leave / attendance relaxation for cadets attending mandatory national camps (ATC, CATC, RDC, EBSB).",
    highlights: [
      "Morning/Weekend Parades Only",
      "Official SBU Duty Leave for Camps",
      "Zero Academic Conflict",
    ],
  },
  {
    id: "faq-8",
    category: "training",
    categoryLabel: "Training & Camps",
    question: "What is the course duration and criteria for 'B' & 'C' Certificate exams?",
    answer:
      "The Senior Division / Wing training spans 3 years:\n• Year 1 & 2: Complete 2 years of institutional training and 1 Annual Training Camp (ATC) to appear for the 'B' Certificate exam.\n• Year 3: Complete 1 additional year of advanced training and a second national camp to appear for the 'C' Certificate exam.",
    highlights: [
      "'B' Cert: 2 Years + 1 ATC Camp",
      "'C' Cert: 3 Years + 2 Camps",
      "Grading based on Drill, Firing & Written Exam",
    ],
  },
  {
    id: "faq-9",
    category: "documents",
    categoryLabel: "Documents & DBT",
    question: "Why is a Bank Account (DBT) mandatory during NCC registration?",
    answer:
      "Under Government of India Direct Benefit Transfer (DBT) norms, camp mess allowances, washing allowances, and travel reimbursements are credited directly to the cadet's personal bank account by 19 Jharkhand Battalion NCC.",
    highlights: [
      "Direct Allowance Credit from Battalion",
      "Prevents Payment Delays",
      "Requires Active Bank A/C & IFSC",
    ],
  },
  {
    id: "faq-10",
    category: "training",
    categoryLabel: "Training & Camps",
    question: "How can I track my enrollment application status online?",
    answer:
      "Click the 'Track Application' button on the navigation bar or home page and enter your 12-digit Application ID (e.g., SBU-NCC-2026-XXXX) or SBU Roll Number. You will see real-time updates (Pending Review, Verified, Physical Test Scheduled, or Enrolled) and can print your official Form 1 slip.",
    highlights: [
      "Instant Online Status Check",
      "Download Official Form 1 Slip",
      "Regimental No. Verification",
    ],
  },
];

interface FaqSectionProps {
  onStartEnrollment?: () => void;
  openStatusModal?: () => void;
  openAiAssistant?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  onStartEnrollment,
  openStatusModal,
  openAiAssistant,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIds, setOpenIds] = useState<string[]>(["faq-1"]);
  const [showAllFaqs, setShowAllFaqs] = useState<boolean>(false);

  const categories = [
    { id: "all", label: "Top Essential FAQs", icon: BookOpen },
    { id: "eligibility", label: "Eligibility & Selection", icon: ShieldCheck },
    { id: "physical", label: "Physical Standards", icon: Activity },
    { id: "documents", label: "Documents & DBT", icon: FileText },
    { id: "benefits", label: "Certificates & SSB", icon: Award },
    { id: "training", label: "Training & Camps", icon: CheckCircle2 },
  ];

  const filteredFaqs = useMemo(() => {
    let items = FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        (item.highlights && item.highlights.some((h) => h.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });

    // If showing "all" category with no search query and showAllFaqs is false, restrict to top 3 FAQs
    if (selectedCategory === "all" && !searchQuery && !showAllFaqs) {
      items = items.slice(0, 3);
    }

    return items;
  }, [selectedCategory, searchQuery, showAllFaqs]);

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleExpandAll = () => {
    setOpenIds(filteredFaqs.map((f) => f.id));
  };

  const handleCollapseAll = () => {
    setOpenIds([]);
  };

  return (
    <section className="py-16 sm:py-20 bg-muted/40 border-b border-border" id="faq-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Recruitment &amp; Eligibility
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Official answers on SBU NCC Coy enrollment, physical benchmarks, SSB direct entry
            benefits, documents and camp training.
          </p>
        </div>

        {/* Search */}
        <div className="space-y-4">
          <div className="relative group">
            <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, questions or keywords (e.g. '1600m run', 'SSB', 'documents')"
              className="w-full bg-card border border-border rounded-[18px] pl-12 pr-20 py-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-hidden transition-all"
              id="faq-search-input"
              aria-label="Search frequently asked questions"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-1.5 bg-muted rounded-lg cursor-pointer tap-target"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="FAQ categories"
          >
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground border border-border hover:border-foreground/20 hover:text-foreground"
                  }`}
                  id={`faq-cat-${cat.id}`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ List Panel */}
        <div className="bg-card rounded-[18px] border border-border overflow-hidden shadow-sm">
          <div className="px-5 sm:px-6 py-4 bg-muted/50 border-b border-border flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Showing <span className="numeric text-foreground">{filteredFaqs.length}</span>{" "}
              question{filteredFaqs.length === 1 ? "" : "s"}
              {selectedCategory !== "all"
                ? ` · ${categories.find((c) => c.id === selectedCategory)?.label}`
                : ""}
            </span>
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={handleExpandAll}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                id="faq-expand-all"
              >
                Expand All
              </button>
              <button
                onClick={handleCollapseAll}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                id="faq-collapse-all"
              >
                Collapse All
              </button>
            </div>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-semibold text-foreground">
                No matching questions found
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Try a different search term or switch back to “Top Essential FAQs”. You can also ask
                the Subedar Major AI Assistant.
              </p>
              {openAiAssistant && (
                <button
                  onClick={openAiAssistant}
                  className="mt-2 inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl text-sm shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ask Subedar Major AI Assistant</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredFaqs.map((faq) => {
                const isOpen = openIds.includes(faq.id);
                return (
                  <div key={faq.id} className="group">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-5 sm:px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-muted/40 transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                      id={`faq-btn-${faq.id}`}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${
                              faq.category === "benefits" || faq.category === "training"
                                ? "bg-accent/10 text-accent"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {faq.categoryLabel}
                          </span>
                        </div>
                        <h3 className="font-display text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground mt-1 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 space-y-3">
                        <div className="p-4 bg-muted/60 border-l-2 border-accent rounded-r-lg text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </div>

                        {faq.highlights && faq.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {faq.highlights.map((hl, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 bg-card border border-border text-foreground text-xs font-medium px-2.5 py-1 rounded-md"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{hl}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* View all toggle */}
          {selectedCategory === "all" && !searchQuery && (
            <div className="p-4 flex justify-center border-t border-border bg-card">
              <button
                onClick={() => {
                  setShowAllFaqs(!showAllFaqs);
                  if (!showAllFaqs) {
                    setOpenIds(["faq-1", "faq-2", "faq-3"]);
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                id="faq-toggle-more-btn"
              >
                <span>
                  {showAllFaqs
                    ? "Show Top 3 Essential FAQs Only"
                    : `View All ${FAQ_DATA.length} Questions & Answers`}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showAllFaqs ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Helpdesk CTA Band - Light Coffee & NCC Tricolor Theme */}
        <div className="relative overflow-hidden rounded-[22px] bg-[#FAF7F2] border border-[#8C5E3C]/35 p-6 sm:p-8 text-[#3B281C] shadow-lg">
          {/* Top NCC Tricolor Bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 grid grid-cols-3">
            <div className="bg-[#1E3A8A]" title="Navy Blue - Indian Navy Wing" />
            <div className="bg-[#DC2626]" title="Army Red - Indian Army Wing" />
            <div className="bg-[#0284C7]" title="Light Blue - Indian Air Force Wing" />
          </div>

          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#8C5E3C]/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#8C5E3C] text-xs font-black uppercase tracking-wider">
                <PhoneCall className="w-4 h-4 text-[#8C5E3C]" />
                <span>Still have questions?</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-black text-[#3B281C] tracking-tight">
                SBU NCC Coy Officer &amp; Battalion Helpdesk
              </h3>
              <p className="text-xs sm:text-sm text-[#5C3D26] max-w-xl leading-relaxed font-bold">
                Visit the NCC Office at SBU Birla Campus, Mahilong, Ranchi, or ask the 24/7 Subedar
                Major AI Assistant for instant rules &amp; syllabus guidance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {openAiAssistant && (
                <button
                  onClick={openAiAssistant}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F5ECE3] hover:bg-[#8C5E3C] text-[#5C3D26] hover:text-white border border-[#D6C5B3] text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#8C5E3C] group-hover:text-white" />
                  <span>Ask AI Assistant</span>
                </button>
              )}
              {onStartEnrollment && (
                <button
                  onClick={onStartEnrollment}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#DC2626] via-[#1E3A8A] to-[#0284C7] hover:brightness-110 text-white text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer uppercase tracking-wider"
                  id="faq-apply-now-btn"
                >
                  <span>Apply Form 1</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
