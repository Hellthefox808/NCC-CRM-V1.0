import React from "react";
import { Trophy, Star, Target } from "lucide-react";

export const AchievementsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Awards, Medals & Badges</h2>
          <p className="text-xs text-slate-500">Recognitions awarded during battalion drills, sports selections & shooting trials</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-400/20 text-yellow-600 flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Best Turned Out Cadet</h3>
            <p className="text-xs text-slate-600">Awarded for flawless uniform turnout, boots polish & drill precision at Kargil Vijay Diwas Parade.</p>
            <span className="text-[10px] bg-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded-full inline-block">
              July 2026
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">1600m Battalion Athletics Winner</h3>
            <p className="text-xs text-slate-600">Clocked 5 min 45 sec in 1.6 KM run selection test among 54 cadets at SBU Ground.</p>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-2 py-0.5 rounded-full inline-block">
              Gold Medal
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">0.22 Rifle Firing Marksman</h3>
            <p className="text-xs text-slate-600">Scored 45/50 in grouping shot practice at Namkum Firing Range.</p>
            <span className="text-[10px] bg-blue-100 text-blue-900 font-black px-2 py-0.5 rounded-full inline-block">
              Marksman Badge
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
