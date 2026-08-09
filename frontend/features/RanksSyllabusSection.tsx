import React, { useState } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  ChevronDown,
  FileText,
  Layers,
  CheckCircle2,
  Target,
  Award,
  ArrowRight,
} from "lucide-react";
import { EXAM_MARKS_AND_GRADING, NOTICES_DATA, RANKS_DATA, SYLLABUS_TOPICS } from "@/data/nccData";

const SectionHeading: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ eyebrow, title, description, icon: Icon }) => (
  <div className="space-y-2 max-w-2xl">
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
      <Icon className="w-3.5 h-3.5" />
      <span>{eyebrow}</span>
    </div>
    <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export const RanksSyllabusSection: React.FC = () => {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Who is eligible for Senior Division (SD) and Senior Wing (SW) NCC at Sarala Birla University?",
      a: "All regular 1st year and 2nd year undergraduate & diploma students of Sarala Birla University (B.Tech, BCA, BBA, B.Sc, MBA, BA, Diploma) under 26 years of age who satisfy physical fitness criteria (1600m run, pushups, height) are eligible to apply.",
    },
    {
      q: "What is the duration of NCC 'B' and 'C' Certificate courses?",
      a: "The Senior Division course is 3 years total. 'B' Certificate examination is taken after 2 years of training & 1 camp. 'C' Certificate examination is taken after 3 years of training & 2 camps.",
    },
    {
      q: "What is the marking scheme for NCC 'B' and 'C' Certificate examinations?",
      a: "The exam carries 500 Total Marks (350 Written Theory Marks + 150 Practical Marks). Candidates must score minimum 45% in each part and 50% aggregate overall. Grade 'A' requires 350+ marks (70%+).",
    },
    {
      q: "How does the Excel Nominal Roll export work for Battalion Officers?",
      a: "The ANO and Battalion Officers can log in to the Officer Portal and click 'Download Nominal Roll (.xlsx Excel)' to instantly receive an official 3-sheet Excel spreadsheet containing candidate details, physical scores, and bank DBT details for camp mess allowances.",
    },
    {
      q: "Are female candidates eligible for Senior Wing (SW) at SBU Ranchi?",
      a: "Yes! Sarala Birla University has active vacancies for Senior Wing (SW) female cadets under 19 Jharkhand Battalion. Female cadets participate in rifle firing, RDC parade, EBSB camps, and adventure mountaineering.",
    },
  ];

  return (
    <section
      className="py-16 sm:py-24 bg-background border-b border-border"
      id="ranks-syllabus-section"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16"
      >
        {/* Section Title */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-border" />
            <span>Bihar &amp; Jharkhand Directorate · Army Wing</span>
          </div>
          <h2 className="font-display text-3xl sm:text-[2.6rem] font-semibold leading-[1.1] tracking-tight text-foreground">
            Cadet Ranks &amp; Examination Syllabus
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            The non-commissioned officer hierarchy and the structured three-year Army Wing
            curriculum prescribed by HQ DG NCC, New Delhi.
          </p>
        </div>

        {/* 500-Mark Examination Scheme — Light Coffee Theme */}
        <div className="coffee-light-card rounded-[22px] overflow-hidden shadow-xl">
          <div className="px-6 sm:px-8 py-6 border-b border-[#D6C5B3] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8C5E3C]">
                <Target className="w-3.5 h-3.5 text-[#8C5E3C]" />
                <span>Certificate Assessment</span>
              </div>
              <h3 className="font-display text-2xl font-black tracking-tight text-[#3B281C]">
                500-Mark Written &amp; Practical Scheme
              </h3>
            </div>
            <div className="rounded-xl border border-[#D6C5B3] bg-[#EFE5D8]/80 px-4 py-2.5 text-xs font-bold text-[#5C3D26] backdrop-blur-md">
              Pass criteria: {EXAM_MARKS_AND_GRADING.passCriteria}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#D6C5B3]">
            {/* Written Theory */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7A5435]">
                  Written Theory
                </span>
                <span className="numeric font-display text-3xl font-black text-[#8C5E3C]">
                  {EXAM_MARKS_AND_GRADING.writtenMarks}
                </span>
              </div>
              <p className="text-sm text-[#4A3324] font-medium leading-relaxed">
                Common subjects — NCC history, drill theory, weapon training, leadership, disaster
                management — plus specialised Army Wing subjects: map reading, armed forces
                organisation, field &amp; battle craft.
              </p>
            </div>

            {/* Practical */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7A5435]">
                  Practical &amp; Range
                </span>
                <span className="numeric font-display text-3xl font-black text-[#8C5E3C]">
                  {EXAM_MARKS_AND_GRADING.practicalMarks}
                </span>
              </div>
              <ul className="space-y-2 text-sm text-[#4A3324] font-medium">
                {EXAM_MARKS_AND_GRADING.practicalStations.map((st, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-1 shrink-0 text-[#8C5E3C]" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Grading */}
            <div className="p-6 sm:p-8 space-y-4">
              <span className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7A5435]">
                Grading Benchmark
              </span>
              <div className="space-y-3">
                {EXAM_MARKS_AND_GRADING.grades.map((gr, i) => (
                  <div key={i} className="space-y-1 border-l-2 border-[#8C5E3C] pl-3">
                    <div className="flex items-baseline justify-between gap-2 text-sm font-bold text-[#3B281C]">
                      <span>{gr.grade}</span>
                      <span className="numeric text-xs font-black text-[#8C5E3C]">{gr.range}</span>
                    </div>
                    <p className="text-xs text-[#5C4230] font-medium leading-relaxed">{gr.perk}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Syllabus */}
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Training Curriculum"
            icon={BookOpen}
            title="SBU Army Wing Cadre Syllabus"
            description="Three-year structured syllabus split across common subjects and specialised Army Wing instruction."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SYLLABUS_TOPICS.map((sym, idx) => (
              <div
                key={idx}
                className="rounded-[18px] border border-border bg-card p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-foreground/15 transition-all"
              >
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                  <h4 className="font-display text-lg font-semibold tracking-tight text-foreground">
                    {sym.subject}
                  </h4>
                  <span className="numeric shrink-0 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {idx === 0 ? "110 Theory + 90 Practical" : "110 Theory + 60 Practical"}
                  </span>
                </div>

                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {sym.topics.map((tp, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-3 leading-relaxed">
                      <span className="numeric mt-0.5 w-5 shrink-0 text-[11px] font-semibold text-primary/70">
                        {String(tIdx + 1).padStart(2, "0")}
                      </span>
                      <span>{tp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Ranks */}
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Chain of Command"
            icon={Layers}
            title="Cadet Rank Hierarchy"
            description="NCO appointments awarded on drill efficiency, camp performance and ANO recommendation."
          />

          <div className="rounded-[18px] border border-border bg-card overflow-hidden shadow-sm divide-y divide-border">
            {RANKS_DATA.map((rank, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 px-6 py-5 hover:bg-muted/40 transition-colors"
              >
                <div className="sm:col-span-4 flex items-center gap-4">
                  <span className="numeric font-display text-2xl font-semibold text-muted-foreground/50 w-9 shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-display text-base font-semibold text-foreground truncate">
                      {rank.rank}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {rank.abbr} · {rank.level}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-3 flex items-center">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                    <Award className="w-3.5 h-3.5" />
                    {rank.insignia}
                  </span>
                </div>

                <p className="sm:col-span-5 text-sm text-muted-foreground leading-relaxed self-center">
                  {rank.responsibilities}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div>
          <header className="flex items-end justify-between gap-6 border-b border-border pb-6">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <FileText className="w-3.5 h-3.5" />
                Official Bulletins
              </p>
              <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                19 Jharkhand Battalion Circulars
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Official notices and circulars issued to the SBU NCC Coy by the parent battalion.
              </p>
            </div>
            <span className="hidden md:inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
              <span className="h-1.5 w-1.5 rounded-full bg-background/70" />
              Active Board
            </span>
          </header>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {NOTICES_DATA.map((notice) => {
              const category = String(notice.category).toLowerCase();
              const tone =
                category === "camp"
                  ? {
                      chip: "bg-accent/10 text-accent border-accent/20",
                      hover: "group-hover:text-accent",
                    }
                  : category === "exam"
                    ? {
                        chip: "bg-muted text-muted-foreground border-border",
                        hover: "group-hover:text-foreground/70",
                      }
                    : {
                        chip: "bg-primary/10 text-primary border-primary/20",
                        hover: "group-hover:text-primary",
                      };

              return (
                <article
                  key={notice.id}
                  className="group flex flex-col rounded-[18px] border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-foreground/15"
                >
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <span
                      className={`rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${tone.chip}`}
                    >
                      {notice.category}
                    </span>
                    <time className="numeric text-sm font-medium text-muted-foreground">
                      {notice.date}
                    </time>
                  </div>

                  <h4
                    className={`mb-3 font-display text-xl font-semibold leading-snug tracking-tight text-foreground transition-colors ${tone.hover}`}
                  >
                    {notice.title}
                  </h4>

                  <p className="mb-6 flex-grow text-[15px] leading-relaxed text-muted-foreground">
                    {notice.description}
                  </p>

                  <div className="border-t border-border/70 pt-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      Read circular
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            Showing {NOTICES_DATA.length} latest circulars &bull; Issued by HQ 19 Jharkhand Bn NCC,
            Ranchi
          </p>
        </div>

        {/* FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start space-y-6">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <BookOpen className="w-3.5 h-3.5" />
                Clarifications
              </p>
              <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Frequently Asked Questions
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Common queries on eligibility, certificate timelines and officer-side reporting.
              </p>
            </div>

            <div className="rounded-[18px] border border-border bg-muted/40 p-5">
              <p className="text-sm font-semibold text-foreground">Still need clarification?</p>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                Contact the ANO office at the SBU NCC Coy room, Sarala Birla University, Ranchi —
                open Monday to Friday, 10:00 to 16:00 hrs.
              </p>
              <p className="mt-3 numeric text-sm font-semibold text-primary">+91 651 660 0100</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="rounded-[18px] border border-border bg-card overflow-hidden shadow-sm divide-y divide-border">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={idx} className={isOpen ? "bg-muted/25" : ""}>
                    <button
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                      id={`faq-question-${idx}`}
                      className="w-full px-6 py-5 flex items-start gap-4 text-left transition-colors hover:bg-muted/40 cursor-pointer"
                    >
                      <span
                        className={`numeric mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold transition-colors ${
                          isOpen
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 font-display text-base font-semibold leading-snug text-foreground">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div
                        id={`faq-answer-${idx}`}
                        role="region"
                        aria-labelledby={`faq-question-${idx}`}
                        className="px-6 pb-6 pl-16"
                      >
                        <p className="rounded-r-lg border-l-2 border-accent bg-muted/60 p-4 text-sm leading-relaxed text-muted-foreground">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
