import React from "react";
import { Calendar, Heart } from "lucide-react";

export const ActivitiesSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-black text-zinc-900">Activities, Camps & Social Drives</h2>
          <p className="text-xs text-zinc-500">
            Participate in 19 JHR BN NCC camps, shooting trials, and university community events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event 1 */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3 relative">
            <div className="flex justify-between items-start">
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Nominated
              </span>
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">
              Annual Training Camp (ATC Ranchi 2026)
            </h3>
            <p className="text-xs text-zinc-600">
              10-day intensive military training camp covering firing, map reading, obstacle course
              & parade drill.
            </p>
            <div className="text-xs text-zinc-700 space-y-1 bg-white p-3 rounded-xl border border-zinc-200">
              <p>
                <strong>Dates:</strong> 15 Aug - 24 Aug 2026
              </p>
              <p>
                <strong>Venue:</strong> Namkum Military Garrison, Ranchi
              </p>
              <p>
                <strong>Kit Required:</strong> Khaki Uniform 2 sets, DMS Boots, Webbing Belt, Mess
                Tin, Bedding
              </p>
            </div>
          </div>

          {/* Event 2 */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3 relative">
            <div className="flex justify-between items-start">
              <span className="bg-blue-100 text-zinc-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Upcoming Event
              </span>
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">
              Swachh Bharat & Mega Blood Donation Drive
            </h3>
            <p className="text-xs text-zinc-600">
              Social service initiative organized by SBU NCC Company in collaboration with RIMS
              Ranchi.
            </p>
            <div className="text-xs text-zinc-700 space-y-1 bg-white p-3 rounded-xl border border-zinc-200">
              <p>
                <strong>Date:</strong> 12 August 2026 • 09:00 AM
              </p>
              <p>
                <strong>Venue:</strong> SBU Main Auditorium & Health Center
              </p>
              <p>
                <strong>Duty:</strong> Volunteer & Blood Donor Cadet List
              </p>
            </div>
          </div>
        </div>

        {/* Event Photo Gallery */}
        <div className="space-y-3 pt-4 border-t border-zinc-200">
          <h3 className="font-black text-zinc-900 text-base">NCC Cadre Event Photo Gallery</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="space-y-1 text-center group">
              <div className="h-28 overflow-hidden rounded-xl border border-zinc-300 shadow-2xs bg-zinc-900">
                <img
                  src="/images/activities/vip_guard_escort.jpg"
                  alt="VIP Guard of Honor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[11px] font-bold text-zinc-800">VIP Guard Escort</p>
            </div>

            <div className="space-y-1 text-center group">
              <div className="h-28 overflow-hidden rounded-xl border border-zinc-300 shadow-2xs bg-zinc-900">
                <img
                  src="/images/activities/national_youth_day_awards.jpg"
                  alt="Youth Day Felicitation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[11px] font-bold text-zinc-800">Youth Day 2026 Awards</p>
            </div>

            <div className="space-y-1 text-center group">
              <div className="h-28 overflow-hidden rounded-xl border border-zinc-300 shadow-2xs bg-zinc-900">
                <img
                  src="/images/activities/tiranga_yatra_rally.jpg"
                  alt="Tiranga Yatra"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[11px] font-bold text-zinc-800">Tiranga Yatra Rally</p>
            </div>

            <div className="space-y-1 text-center group">
              <div className="h-28 overflow-hidden rounded-xl border border-zinc-300 shadow-2xs bg-zinc-900">
                <img
                  src="/images/activities/yoga_day_wellness.jpg"
                  alt="Yoga Day Session"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[11px] font-bold text-zinc-800">International Yoga Day</p>
            </div>

            <div className="space-y-1 text-center group">
              <div className="h-28 overflow-hidden rounded-xl border border-zinc-300 shadow-2xs bg-zinc-900">
                <img
                  src="/images/activities/ncc_squad_formation.jpg"
                  alt="Company Squad Formation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[11px] font-bold text-zinc-800">Squad Formation</p>
            </div>

            <div className="space-y-1 text-center group">
              <div className="h-28 overflow-hidden rounded-xl border border-zinc-300 shadow-2xs bg-zinc-900">
                <img
                  src="/images/activities/cultural_dance_youth_day.jpg"
                  alt="Classical Dance Event"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[11px] font-bold text-zinc-800">Cultural Dance Event</p>
            </div>

            <div className="space-y-1 text-center group">
              <div className="h-28 overflow-hidden rounded-xl border border-zinc-300 shadow-2xs bg-zinc-900">
                <img
                  src="/images/activities/swachh_bharat_posters.jpg"
                  alt="Swachh Bharat Campaign"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[11px] font-bold text-zinc-800">Swachh Bharat Posters</p>
            </div>

            <div className="space-y-1 text-center group">
              <div className="h-28 overflow-hidden rounded-xl border border-zinc-300 shadow-2xs bg-zinc-900">
                <img
                  src="/images/activities/awareness_rally_march.jpg"
                  alt="Awareness Rally"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[11px] font-bold text-zinc-800">Community Rally March</p>
            </div>

            <div className="space-y-1 text-center group">
              <div className="h-28 overflow-hidden rounded-xl border border-zinc-300 shadow-2xs bg-zinc-900">
                <img
                  src="/images/activities/rifle_shooting_range.jpg"
                  alt="0.22 Rifle Firing Range"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[11px] font-bold text-zinc-800">0.22 Rifle Firing Range</p>
            </div>

            <div className="space-y-1 text-center group">
              <div className="h-28 overflow-hidden rounded-xl border border-zinc-300 shadow-2xs bg-zinc-900">
                <img
                  src="/images/activities/swachh_bharat_cleaning.jpg"
                  alt="Road Sanitation Drive"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[11px] font-bold text-zinc-800">Road Sanitation Drive</p>
            </div>

            <div className="space-y-1 text-center group">
              <div className="h-28 overflow-hidden rounded-xl border border-zinc-300 shadow-2xs bg-zinc-900">
                <img
                  src="/images/activities/ncc_mountain_trekking.jpg"
                  alt="Mountain Trekking Camp"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[11px] font-bold text-zinc-800">Mountain Trekking Camp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
