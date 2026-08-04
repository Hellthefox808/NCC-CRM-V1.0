import React, { useState } from "react";
import { 
  Award, 
  Calendar, 
  Camera, 
  CheckCircle2, 
  Compass, 
  Flag, 
  Flame, 
  Layers,
  MapPin, 
  RotateCcw,
  ShieldCheck, 
  Sparkles,
  Target 
} from "lucide-react";
import { ACTIVITIES_DATA, CAMPS_DATA } from "../data/nccData";

export const ActivitiesGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    { name: "All", label: "All Activities", icon: Layers },
    { name: "Institutional", label: "Institutional Drill", icon: ShieldCheck },
    { name: "Shooting", label: "Rifle Shooting", icon: Target },
    { name: "Camps", label: "National Camps", icon: Calendar },
    { name: "Social Service", label: "Social Service", icon: Flag },
    { name: "Adventure", label: "Adventure Training", icon: Flame },
  ];

  const getCategoryCount = (catName: string) => {
    if (catName === "All") return ACTIVITIES_DATA.length;
    return ACTIVITIES_DATA.filter(a => a.category === catName).length;
  };

  const filteredActivities = selectedCategory === "All"
    ? ACTIVITIES_DATA
    : ACTIVITIES_DATA.filter(a => a.category === selectedCategory);

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200" id="activities-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            <span>19 Jharkhand Battalion Cadre Life</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            NCC Activities & Cadre Gallery
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore company parades, VIP guard escorts, rifle firing, national youth camps, Tiranga Yatras, and Swachh Bharat community drives at Sarala Birla University.
          </p>
        </div>

        {/* Enhanced Category Filter Tabs Container */}
        <div className="space-y-4 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-2 bg-slate-200/70 backdrop-blur-md rounded-2xl border border-slate-300/80 shadow-xs max-w-full">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const count = getCategoryCount(cat.name);
              const isActive = selectedCategory === cat.name;

              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                    isActive
                      ? "bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-amber-400 shadow-md shadow-blue-950/20 scale-[1.03] ring-2 ring-amber-400/40"
                      : "bg-white/90 text-slate-700 hover:text-blue-950 hover:bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs"
                  }`}
                  id={`activity-tab-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-amber-400 animate-pulse" : "text-slate-500"}`} />
                  <span>{cat.name}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full transition-colors ${
                      isActive
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-2 max-w-7xl mx-auto pt-1">
            <span className="font-medium flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Showing <strong className="text-slate-900 font-bold">{filteredActivities.length}</strong> {filteredActivities.length === 1 ? "activity" : "activities"}
                {selectedCategory !== "All" && (
                  <> under category <span className="text-blue-950 font-extrabold uppercase tracking-wide px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">{selectedCategory}</span></>
                )}
              </span>
            </span>

            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="flex items-center space-x-1 text-blue-700 hover:text-blue-950 font-bold hover:underline cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filter ({ACTIVITIES_DATA.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Activities Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => (
            <div 
              key={act.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Card Image */}
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={act.image}
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border border-amber-400/40">
                    {act.category}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3 text-left">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {act.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Key Highlights:</p>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {act.highlights.map((hl, hIdx) => (
                        <li key={hIdx} className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 text-left font-medium">
                Unit: 19 JHR BN NCC • SBU Ground Ranchi
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Annual Camp Calendar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <span>Annual Training Camp Schedule 2026</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Compulsory 10-day residential camps conducted by 19 Jharkhand Battalion for 'B' & 'C' Certificate eligibility.
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full w-fit">
              100% Attendance Mandate
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CAMPS_DATA.map((camp) => (
              <div key={camp.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  {camp.image && (
                    <div className="relative h-36 overflow-hidden bg-slate-900">
                      <img
                        src={camp.image}
                        alt={camp.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 text-[10px] font-bold text-amber-800 bg-amber-100/90 backdrop-blur-xs px-2 py-0.5 rounded border border-amber-300">
                        {camp.status}
                      </div>
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    {!camp.image && (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {camp.status}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Vacancies: {camp.vacancies}</span>
                      </div>
                    )}
                    {camp.image && (
                      <div className="flex items-center justify-end">
                        <span className="text-xs text-slate-500 font-medium">Vacancies: {camp.vacancies}</span>
                      </div>
                    )}

                    <h4 className="text-sm font-bold text-slate-900">{camp.name}</h4>

                    <div className="text-xs space-y-1 text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{camp.location}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">{camp.dates}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-200 text-[11px] text-slate-500 bg-slate-100/50">
                  Eligibility: <strong className="text-slate-700">{camp.eligibility}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
