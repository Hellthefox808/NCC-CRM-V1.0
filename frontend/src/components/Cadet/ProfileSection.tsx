import React from "react";
import { Edit3, QrCode, User, Shield, Lock, Building, Heart, ShieldCheck, FileCheck } from "lucide-react";
import { CadetProfile } from "../../types";

interface ProfileSectionProps {
  cadetProfile: CadetProfile;
  setIsEditingProfile: (val: boolean) => void;
  setShowIdCardModal: (val: boolean) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  cadetProfile,
  setIsEditingProfile,
  setShowIdCardModal
}) => {
  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-4">
            <img
              src={cadetProfile.photoUrl}
              alt={cadetProfile.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-yellow-400 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-slate-900">{cadetProfile.fullName}</h2>
                <span className="bg-yellow-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase">
                  {cadetProfile.rank}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-600 font-bold mt-1">
                Regimental No: {cadetProfile.regNo}
              </p>
              <p className="text-xs text-slate-500">
                {cadetProfile.coy} • {cadetProfile.sbuCourse}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="bg-[#002147] hover:bg-[#001838] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Edit3 className="w-4 h-4 text-yellow-400" />
              <span>Edit Contact & Sizes</span>
            </button>
            <button
              onClick={() => setShowIdCardModal(true)}
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <QrCode className="w-4 h-4 text-slate-950" />
              <span>Print ID Card</span>
            </button>
          </div>
        </div>

        {/* Profile Grid Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Personal Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-yellow-500" />
              <span>Personal Details</span>
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between"><span className="text-slate-500">Full Name:</span><span className="font-bold">{cadetProfile.fullName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Gender & Wing:</span><span className="font-bold">{cadetProfile.gender}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date of Birth:</span><span className="font-bold">{cadetProfile.dob}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Blood Group:</span><span className="font-bold text-red-600">{cadetProfile.bloodGroup}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Mobile Phone:</span><span className="font-bold">{cadetProfile.mobile}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Email:</span><span className="font-bold text-blue-700">{cadetProfile.email}</span></div>
            </div>
          </div>

          {/* Official NCC Info (Read-only) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-2">
              <Shield className="w-4 h-4 text-[#002147]" />
              <span>NCC Official Information</span>
              <Lock className="w-3.5 h-3.5 text-slate-400 ml-auto" />
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between"><span className="text-slate-500">Battalion Unit:</span><span className="font-bold text-slate-900">{cadetProfile.unit}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Company Unit:</span><span className="font-bold">{cadetProfile.coy}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Group HQ:</span><span className="font-bold">{cadetProfile.groupHQ}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Directorate:</span><span className="font-bold">{cadetProfile.directorate}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Enrollment Batch:</span><span className="font-bold text-emerald-800">{cadetProfile.batch}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Joining Year:</span><span className="font-bold">{cadetProfile.joiningYear}</span></div>
            </div>
          </div>

          {/* University Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>University Credentials</span>
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between"><span className="text-slate-500">University:</span><span className="font-bold">Sarala Birla University</span></div>
              <div className="flex justify-between"><span className="text-slate-500">SBU Roll No:</span><span className="font-mono font-bold text-slate-900">{cadetProfile.sbuRollNo}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Course / Branch:</span><span className="font-bold">{cadetProfile.sbuCourse}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Year / Semester:</span><span className="font-bold">{cadetProfile.sbuYear}</span></div>
            </div>
          </div>

          {/* Physical Fitness & Medical */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Physical & Medical Parameters</span>
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between"><span className="text-slate-500">Height / Weight:</span><span className="font-bold">{cadetProfile.heightCm} cm / {cadetProfile.weightKg} kg</span></div>
              <div className="flex justify-between"><span className="text-slate-500">BMI Rating:</span><span className="font-bold text-emerald-700">{cadetProfile.bmi}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Chest Circumference:</span><span className="font-bold">{cadetProfile.chestCm}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Physical Test Score:</span><span className="font-bold text-emerald-800">{cadetProfile.fitnessStatus}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Medical Fitness:</span><span className="font-bold text-slate-900">{cadetProfile.medicalRemarks}</span></div>
            </div>
          </div>

          {/* Uniform Size Specifications */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Uniform Size Specifications</span>
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between"><span className="text-slate-500">Beret Size:</span><span className="font-bold">{cadetProfile.beretSize}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Khaki Shirt Size:</span><span className="font-bold">{cadetProfile.shirtSize}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Trouser Waist:</span><span className="font-bold">{cadetProfile.trouserWaist}"</span></div>
              <div className="flex justify-between"><span className="text-slate-500">DMS Boots Size:</span><span className="font-bold">{cadetProfile.bootSize}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Hackle Color:</span><span className="font-bold">{cadetProfile.hackleColor}</span></div>
            </div>
          </div>

          {/* Document & Bank Account Verification */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>DBT & Verified Documents</span>
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between items-center"><span className="text-slate-500">Aadhaar Verification:</span><span className="font-bold text-emerald-700">Verified ✓</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">Bank Passbook (DBT):</span><span className="font-bold text-emerald-700">Verified ✓</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">Parent Consent Form:</span><span className="font-bold text-emerald-700">Verified ✓</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">Bank Account No:</span><span className="font-mono font-bold">{cadetProfile.accountNo}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">Bank IFSC:</span><span className="font-mono font-bold">{cadetProfile.ifscCode}</span></div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
