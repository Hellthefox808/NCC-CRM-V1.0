import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion, Variants } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Shield,
  ExternalLink,
  Award,
  User,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const leadershipData = [
  {
    id: 1,
    name: "Prof. Gopal Pathak",
    title: "Director General, Sarala Birla University",
    tagline: "MESSAGE FROM DIRECTOR GENERAL",
    message:
      "Dedicated to fostering innovation, critical thinking, and holistic cadet development across all academic and NCC training programs at Sarala Birla University, Ranchi.",
    photo: "",
    officialLink: "https://sbu.ac.in/whoweare/universityadministration",
    initials: "GP",
    icon: GraduationCap,
    badge: "Director General",
    rank: "DG, SBU",
  },
  {
    id: 2,
    name: "Prof. (Dr.) Jagannath",
    title: "Vice Chancellor, Sarala Birla University",
    tagline: "FROM THE DESK OF HON'BLE VICE CHANCELLOR",
    message:
      "Empowering students through modern infrastructure, world-class educational practices, and active participation in 19 Jharkhand Battalion NCC activities and camps.",
    photo: "",
    officialLink:
      "https://sbu.ac.in/faculty-profile/SBU-A-01?faculty=faculty-of-engineering-and-computer-science",
    initials: "JP",
    icon: Award,
    badge: "Vice Chancellor",
    rank: "VC, SBU",
  },
  {
    id: 3,
    name: "Prof. S. B. Dandin",
    title: "Registrar, Sarala Birla University",
    tagline: "REGISTRAR'S DESK",
    message:
      "A vision of global standards and practical skills that will prepare students to meet real-world challenges with unwavering discipline, national pride, and ethical leadership.",
    photo: "",
    officialLink:
      "https://www.bhaskar.com/local/jharkhand/ranchi/news/sbu-sridhar-b-dandin-appointed-as-registrar-took-charge-134666528.html",
    initials: "SD",
    icon: Shield,
    badge: "Registrar",
    rank: "Registrar",
  },
  {
    id: 4,
    name: "Col. Rohit Nandan Prasad",
    title: "Commanding Officer, 19 JHR BN NCC",
    tagline: "COMMANDING OFFICER",
    message:
      "Inspiring youth to embody 'Unity & Discipline', excel in Physical Efficiency Tests, firing marksmanship, and step forward as future officers in the Indian Armed Forces.",
    photo: "",
    officialLink: "",
    initials: "RP",
    icon: Shield,
    badge: "19 JHR BN CO",
    rank: "Colonel (CO)",
  },
  {
    id: 5,
    name: "Prashant Kumar",
    title: "Associate NCC Officer (ANO)/(CTO), SBU",
    tagline: "ASSOCIATE NCC OFFICER DESK",
    message:
      "Guiding Senior Division and Senior Wing cadets through rigorous parade training, SSB entry guidance, and social service drives under 19 Jharkhand Battalion NCC.",
    photo: "",
    officialLink: "https://sbu.ac.in/faculty-profile/SBU-161",
    initials: "PK",
    icon: User,
    badge: "ANO / CTO SBU",
    rank: "ANO / CTO",
  },
];

interface LeadershipCarouselProps {
  autoPlayInterval?: number;
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 320, damping: 32 },
      opacity: { duration: 0.25 },
      scale: { duration: 0.35 },
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: "spring" as const, stiffness: 320, damping: 32 },
      opacity: { duration: 0.2 },
    },
  }),
};

const contentContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 380, damping: 28 },
  },
};

export const LeadershipCarousel: React.FC<LeadershipCarouselProps> = ({
  autoPlayInterval = 4500,
}) => {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const shouldReduceMotion = useReducedMotion();
  const activeIndex = Math.abs(page % leadershipData.length);
  const activeItem = leadershipData[activeIndex];

  const paginate = useCallback((newDirection: number) => {
    setPage(([prevPage]) => {
      let nextPage = prevPage + newDirection;
      if (nextPage < 0) nextPage = leadershipData.length - 1;
      if (nextPage >= leadershipData.length) nextPage = 0;
      return [nextPage, newDirection];
    });
  }, []);

  const goToSlide = (index: number) => {
    const newDirection = index > activeIndex ? 1 : -1;
    setPage([index, newDirection]);
  };

  useEffect(() => {
    if (!isPlaying || isHovered) return;

    const timer = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, autoPlayInterval, paginate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      paginate(-1);
    } else if (e.key === "ArrowRight") {
      paginate(1);
    } else if (e.key === " ") {
      e.preventDefault();
      setIsPlaying((prev) => !prev);
    }
  };

  return (
    <div
      className="mx-auto my-10 max-w-5xl px-4 outline-none sm:px-6"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-roledescription="carousel"
      aria-label="University and Battalion Leadership Carousel"
    >
      {/* Section heading */}
      <div className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-xs">
          <Shield className="h-3.5 w-3.5" />
          <span>Leadership &amp; Governance</span>
          <Sparkles className="h-3 w-3 text-accent-brand" />
        </span>
        <h3 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          University &amp; Battalion{" "}
          <span className="bg-gradient-to-r from-primary to-accent-brand bg-clip-text text-transparent">
            Leadership
          </span>
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          Guiding the 19 JHR BN NCC SBU Unit with vision, patriotism, and military discipline
        </p>
      </div>

      {/* Main card */}
      <div
        className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-xl transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Brand hairline */}
        <div className="brand-gradient absolute inset-x-0 top-0 h-0.5 opacity-90" />

        {/* Auto-play progress */}
        {isPlaying && !isHovered && (
          <div className="absolute inset-x-0 top-0.5 h-1 overflow-hidden bg-muted">
            <motion.div
              key={page}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
              className="h-full bg-gradient-to-r from-primary to-accent-brand"
            />
          </div>
        )}

        {/* Slide container (arrows are anchored to this box so they stay optically centred) */}
        <div className="relative">
          <div className="relative min-h-[340px] overflow-hidden sm:min-h-[300px] md:min-h-[268px]">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000) paginate(1);
                  else if (swipe > 10000) paginate(-1);
                }}
                className="w-full cursor-grab px-5 py-8 active:cursor-grabbing sm:px-16 sm:py-10 lg:px-20"
              >
                <div className="mx-auto max-w-3xl">
                  <motion.div
                    variants={contentContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="min-w-0 text-center md:text-left"
                  >
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col items-center gap-3 md:items-start lg:flex-row lg:items-start lg:justify-between lg:gap-6"
                    >
                      <div className="min-w-0">
                        <h4 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-[32px] md:leading-tight">
                          {activeItem.name}
                        </h4>
                        <p className="mt-1.5 text-sm font-semibold text-primary sm:text-base">
                          {activeItem.title}
                        </p>
                      </div>

                      {activeItem.officialLink && activeItem.officialLink.startsWith("http") && (
                        <a
                          href={activeItem.officialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 lg:mt-1"
                          title={`View ${activeItem.name} profile`}
                        >
                          <span>Official Profile</span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary" />
                        </a>
                      )}
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="mt-5 border-t border-border/70 pt-4 md:mt-6"
                    >
                      <p className="text-sm leading-relaxed text-muted-foreground italic sm:text-[15px] sm:leading-7">
                        <Quote className="mr-1.5 inline-block h-4 w-4 -translate-y-0.5 text-primary/70" />
                        &ldquo;{activeItem.message}&rdquo;
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows (overlay from sm up, where there is gutter room) */}
          <button
            onClick={() => paginate(-1)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-foreground shadow-md transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-95 sm:grid"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => paginate(1)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-foreground shadow-md transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-95 sm:grid"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Control bar: mobile arrows sit inline with the dots so nothing overlaps the copy */}
        <div className="relative z-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-border/60 px-4 py-3.5 sm:grid-cols-1 sm:px-5 sm:py-4">
          <button
            onClick={() => paginate(-1)}
            aria-label="Previous slide"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/30 hover:text-primary active:scale-95 sm:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center justify-center gap-2">
            {leadershipData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className="relative h-2 rounded-full transition-all focus:outline-none"
                style={{ width: index === activeIndex ? 26 : 8 }}
              >
                <div
                  className={`h-full w-full rounded-full transition-colors ${
                    index === activeIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/25 hover:bg-muted-foreground/40"
                  }`}
                />
                {index === activeIndex && (
                  <motion.div
                    layoutId="activeIndicatorDot"
                    className="absolute inset-0 rounded-full bg-primary shadow-xs"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(1)}
            aria-label="Next slide"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/30 hover:text-primary active:scale-95 sm:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick-select bar */}
      <div className="mt-5 flex snap-x snap-mandatory items-stretch gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
        {leadershipData.map((leader, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={leader.id || index}
              onClick={() => goToSlide(index)}
              className={`group/chip relative flex shrink-0 snap-start items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all duration-200 ${
                isActive
                  ? "border-primary/30 bg-primary/5 font-semibold text-foreground shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:border-border-strong hover:bg-surface hover:text-foreground"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {leader.initials}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="max-w-[120px] truncate text-[11px] font-semibold leading-none sm:max-w-[140px]">
                  {leader.name.split(" ")[0]} {leader.name.split(" ")[1] || ""}
                </span>
                <span
                  className={`truncate text-[9px] leading-none ${isActive ? "text-primary" : "text-muted-foreground"}`}
                >
                  {leader.badge}
                </span>
              </div>

              {isActive && (
                <motion.div
                  layoutId="activeLeaderTabGlow"
                  className="pointer-events-none absolute inset-0 rounded-xl border-2 border-primary/50"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite">
        Showing slide {activeIndex + 1} of {leadershipData.length}: {activeItem.name},{" "}
        {activeItem.title}
      </div>
    </div>
  );
};
