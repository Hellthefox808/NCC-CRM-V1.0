import React from "react";
import { Download } from "lucide-react";

interface StudyMaterialSectionProps {
  showToast: (msg: string) => void;
}

export const StudyMaterialSection: React.FC<StudyMaterialSectionProps> = ({ showToast }) => {
  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Study Materials & Question Banks</h2>
          <p className="text-xs text-slate-500">Official Directorate Handbooks for 'A', 'B' & 'C' Certificate Examinations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-extrabold text-slate-900 text-sm">NCC Cadet Common Subjects Handbook 2026</p>
              <p className="text-xs text-slate-500">Drill, Leadership, Disaster Management, Health & Hygiene (PDF 12 MB)</p>
            </div>
            <button
              onClick={() => showToast("Downloading Common Subjects Handbook PDF...")}
              className="p-2.5 rounded-xl bg-[#002147] text-yellow-400 hover:bg-[#001838] cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-extrabold text-slate-900 text-sm">Weapon Training 0.22 Rifle & SLR Guide</p>
              <p className="text-xs text-slate-500">Stripping, Assembly, Safety Rules & Firing Positions Diagram (PDF 8 MB)</p>
            </div>
            <button
              onClick={() => showToast("Downloading Weapon Training Guide PDF...")}
              className="p-2.5 rounded-xl bg-[#002147] text-yellow-400 hover:bg-[#001838] cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-extrabold text-slate-900 text-sm">Map Reading & Prismatic Compass Manual</p>
              <p className="text-xs text-slate-500">Finding Own Position, Grid References, Bearings calculation (PDF 10 MB)</p>
            </div>
            <button
              onClick={() => showToast("Downloading Map Reading Manual PDF...")}
              className="p-2.5 rounded-xl bg-[#002147] text-yellow-400 hover:bg-[#001838] cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-extrabold text-slate-900 text-sm">'B' Certificate Solved Sample Question Bank</p>
              <p className="text-xs text-slate-500">10-year past papers with answer key for Army Wing (PDF 6 MB)</p>
            </div>
            <button
              onClick={() => showToast("Downloading Solved Sample Papers PDF...")}
              className="p-2.5 rounded-xl bg-[#002147] text-yellow-400 hover:bg-[#001838] cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
