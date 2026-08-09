import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  ExternalLink,
  Building2,
  Navigation,
  Sparkles,
  Compass,
} from "lucide-react";
import { REAL_LOCATIONS_DATA } from "@/data/nccData";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.3 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.96,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

export const LocationsCarousel: React.FC = () => {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  const total = REAL_LOCATIONS_DATA.length;
  const activeIndex = Math.abs(page % total);
  const activeLoc = REAL_LOCATIONS_DATA[activeIndex];

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prevPage]) => {
        let nextPage = prevPage + newDirection;
        if (nextPage < 0) nextPage = total - 1;
        if (nextPage >= total) nextPage = 0;
        return [nextPage, newDirection];
      });
    },
    [total],
  );

  const goToSlide = (index: number) => {
    const newDirection = index > activeIndex ? 1 : -1;
    setPage([index, newDirection]);
  };

  // Auto-slide every 5.5 seconds unless hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 5500);
    return () => clearInterval(timer);
  }, [isHovered, paginate]);

  return (
    <div
      className="space-y-6 text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Compass className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
            <span>Campus &amp; HQ Locator</span>
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[27px]">
            Unit Headquarters &amp; Campus Locations
          </h3>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            Browse validated addresses, landmarks, contact persons, and one-tap Google Maps
            directions for every location tied to the unit.
          </p>
        </div>

        {/* Slide counter, progress and controls */}
        <div className="flex shrink-0 items-center gap-4 self-start sm:self-end">
          <div className="space-y-2">
            <div className="flex items-baseline gap-1 font-mono text-xs text-muted-foreground">
              <span className="text-base font-semibold tabular-nums text-foreground">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <span>/ {String(total).padStart(2, "0")}</span>
            </div>
            <div className="flex items-center gap-1">
              {REAL_LOCATIONS_DATA.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-0.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? "w-7 bg-primary" : "w-3 bg-border"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => paginate(-1)}
              aria-label="Previous Location"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-2xs transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => paginate(1)}
              aria-label="Next Location"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-2xs transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quick Location Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {REAL_LOCATIONS_DATA.map((loc, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "border-primary/40 bg-primary/10 text-primary shadow-2xs"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <Building2
                className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-muted-foreground/60"}`}
                strokeWidth={1.75}
              />

              <span className="truncate max-w-[160px] sm:max-w-[200px]">
                {loc.title.replace(" Office", "").replace(" Headquarters", " HQ")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Sliding Container with Left & Right Floating Chevron Buttons and Stitched Seams */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg sm:p-2">
        {/* Ambient brand glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        {/* Left Floating Chevron */}
        <motion.button
          whileHover={{ scale: 1.15, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(-1)}
          aria-label="Previous Location Card"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-zinc-900/90 hover:bg-zinc-950 text-blue-500 border border-blue-500/50 shadow-xl hover:shadow-blue-600/20 backdrop-blur-sm transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>

        {/* Right Floating Chevron */}
        <motion.button
          whileHover={{ scale: 1.15, x: 2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(1)}
          aria-label="Next Location Card"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-zinc-900/90 hover:bg-zinc-950 text-blue-500 border border-blue-500/50 shadow-xl hover:shadow-blue-600/20 backdrop-blur-sm transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>

        {/* AnimatePresence Sliding Card Area */}
        <div className="min-h-[260px] sm:min-h-[220px] p-4 sm:p-6 md:p-8">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-100/80 border border-blue-300/60 px-3 py-1 rounded-full self-start">
                  {activeLoc.category}
                </span>

                <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-600 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-lg self-start sm:self-auto">
                  <Phone className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>{activeLoc.phone}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xl sm:text-2xl font-extrabold text-zinc-900 flex items-start space-x-2.5">
                  <MapPin className="w-6 h-6 text-[#18181B] shrink-0 mt-0.5" />
                  <span>{activeLoc.title}</span>
                </h4>

                <p className="text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed bg-zinc-50/80 p-3.5 rounded-xl border border-zinc-200/80">
                  {activeLoc.address}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-700 pt-1">
                <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-3">
                  <span className="font-extrabold text-zinc-900 block mb-0.5">Key Landmark:</span>
                  <span>{activeLoc.landmark}</span>
                </div>

                <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-3">
                  <span className="font-extrabold text-zinc-900 block mb-0.5 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Travel & Reachability:</span>
                  </span>
                  <span>{activeLoc.distance}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-xs text-zinc-600 font-semibold">
                  Official Contact:{" "}
                  <span className="text-zinc-900 font-extrabold">{activeLoc.contactPerson}</span>
                </span>

                <a
                  href={activeLoc.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-[#18181B] hover:bg-blue-600 hover:text-zinc-950 text-blue-500 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md hover:shadow-lg"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open Directions on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Dot Indicators */}
        <div className="flex justify-center items-center gap-2 pb-3">
          {REAL_LOCATIONS_DATA.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to location slide ${idx + 1}`}
              className="relative h-2.5 rounded-full cursor-pointer transition-all focus:outline-none"
              style={{ width: idx === activeIndex ? 28 : 10 }}
            >
              <div
                className={`w-full h-full rounded-full transition-colors ${
                  idx === activeIndex ? "bg-blue-600" : "bg-zinc-200 hover:bg-zinc-300"
                }`}
              />
              {idx === activeIndex && (
                <motion.div
                  layoutId="activeLocationDot"
                  className="absolute inset-0 rounded-full bg-blue-500 shadow-xs"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
