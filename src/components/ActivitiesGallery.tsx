import React, { useState } from "react";
import { 
  Award, 
  Calendar, 
  Camera, 
  CheckCircle2, 
  Compass, 
  Flag, 
  Flame, 
  MapPin, 
  ShieldCheck, 
  Target 
} from "lucide-react";
import { ACTIVITIES_DATA, CAMPS_DATA } from "../data/nccData";

export const ActivitiesGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Institutional", "Shooting", "Camps", "Social Service", "Adventure"];

  const filteredActivities = selectedCategory === "All"
    ? ACTIVITIES_DATA
    : ACTIVITIES_DATA.filter(a => a.category === selectedCategory);

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200" id="activities-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            NCC Cadre Life at Sarala Birla University
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            From parade drill & 0.22 Rifle shooting at Namkum range to high-altitude trekking, Republic Day Camp at Rajpath, and Swachh Bharat community drives.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-950 text-amber-400 shadow-md scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
              id={`activity-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CAMPS_DATA.map((camp) => (
              <div key={camp.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {camp.status}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Vacancies: {camp.vacancies}</span>
                </div>

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

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
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
