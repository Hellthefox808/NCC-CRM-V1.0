import React from "react";
import { Award, Flag, Globe, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { BATTALION_DETAILS } from "../data/nccData";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#002147] text-white border-t-4 border-yellow-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-left">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Unit Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-yellow-400">
              <ShieldCheck className="w-6 h-6 text-yellow-400" />
              <h3 className="font-extrabold text-base text-white tracking-tight">
                {BATTALION_DETAILS.unitCode}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Official Senior Division / Senior Wing NCC Portal for Sarala Birla University, Ranchi under 19 Jharkhand Battalion, NCC Group HQ Ranchi & Bihar and Jharkhand Directorate.
            </p>
            <p className="text-xs font-bold text-yellow-400">
              Motto: "{BATTALION_DETAILS.motto}"
            </p>
          </div>

          {/* Column 2: Battalion HQ Address */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-yellow-400 uppercase tracking-wider text-sm">
              Battalion Headquarters
            </h4>
            <div className="space-y-2 text-slate-300">
              <p className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span>19 Jharkhand Battalion NCC, Military Station, Namkum, Ranchi, Jharkhand - 834010</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>+91 (0651) 2260480 / 2261942</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>co.19jhrbn@ncc.gov.in</span>
              </p>
            </div>
          </div>

          {/* Column 3: SBU University Campus Unit */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-yellow-400 uppercase tracking-wider text-sm">
              Sarala Birla University Unit
            </h4>
            <div className="space-y-2 text-slate-300">
              <p className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span>NCC Office, Sarala Birla University, Birla Campus, Mahilong, Purulia Road, Ranchi, Jharkhand - 835103</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>+91 77070 04282 (SBU Helpline)</span>
              </p>
              <p className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>www.sbu.ac.in</span>
              </p>
            </div>
          </div>

          {/* Column 4: Directorate & HQ Dte General */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-yellow-400 uppercase tracking-wider text-sm">
              Directorate & HQ
            </h4>
            <div className="space-y-2 text-slate-300">
              <p className="font-semibold text-white">Bihar & Jharkhand Directorate</p>
              <p className="text-slate-400">Headquarters Directorate General NCC, West Block-IV, R.K. Puram, New Delhi - 110066</p>
              <p className="text-emerald-300 font-bold mt-2">Ministry of Defence, Government of India</p>
            </div>
          </div>

        </div>

        {/* Bottom Rights Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-3">
          <p>
            © {new Date().getFullYear()} 19 Jharkhand Battalion NCC, Ranchi • Sarala Birla University. All Rights Reserved.
          </p>
          <p className="text-yellow-400 font-medium">
            Unity & Discipline • Unity is Strength
          </p>
        </div>

      </div>
    </footer>
  );
};
