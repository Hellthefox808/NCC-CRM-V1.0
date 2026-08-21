import React from "react";
import { Award, ShieldCheck, Download } from "lucide-react";

export interface CertificateItem {
  title: string;
  certNo: string;
  issueDate: string;
  authority: string;
  grade: string;
}

interface CertificatesSectionProps {
  setSelectedCert: (cert: CertificateItem | null) => void;
  handleDownloadCertificate: (name: string) => void;
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({
  setSelectedCert,
  handleDownloadCertificate,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-black text-zinc-900">Official Certificates & Awards</h2>
          <p className="text-xs text-zinc-500">
            Issued by 19 Jharkhand Battalion NCC & Bihar-Jharkhand Directorate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cert 1 */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-start">
              <Award className="w-8 h-8 text-blue-600" />
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Grade 'Alpha'
              </span>
            </div>
            <h3 className="text-lg font-black text-zinc-900">NCC 'A' Certificate</h3>
            <p className="text-xs text-zinc-600">
              Passed Junior Division exam with distinction in firing and drill proficiency.
            </p>
            <div className="text-[11px] text-zinc-500 font-mono space-y-0.5">
              <p>Cert Serial: JHR/2025/A-10482</p>
              <p>Issue Date: 15 March 2025</p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() =>
                  setSelectedCert({
                    title: "NCC 'A' Certificate",
                    certNo: "JHR/2025/A-10482",
                    issueDate: "15 March 2025",
                    authority: "Commanding Officer 19 JHR BN NCC",
                    grade: "Alpha (Distinction)",
                  })
                }
                className="flex-1 py-2 bg-[#18181B] text-white rounded-xl text-xs font-bold hover:bg-[#09090B] cursor-pointer"
              >
                Verify & View
              </button>
              <button
                onClick={() => handleDownloadCertificate("NCC 'A' Certificate")}
                className="py-2 px-3 bg-blue-500 text-zinc-950 rounded-xl text-xs font-bold hover:bg-blue-300 cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cert 2 */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-start">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              <span className="bg-blue-100 text-zinc-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Camp Certificate
              </span>
            </div>
            <h3 className="text-lg font-black text-zinc-900">
              Combined Annual Training Camp (CATC-I)
            </h3>
            <p className="text-xs text-zinc-600">
              Completed 10 days CATC at Namkum Military Station with 1600m athletics badge.
            </p>
            <div className="text-[11px] text-zinc-500 font-mono space-y-0.5">
              <p>Cert Serial: CATC-I/2025/SBU-08</p>
              <p>Issue Date: 28 October 2025</p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() =>
                  setSelectedCert({
                    title: "Combined Annual Training Camp (CATC-I)",
                    certNo: "CATC-I/2025/SBU-08",
                    issueDate: "28 October 2025",
                    authority: "Camp Commandant CATC-I Namkum",
                    grade: "Completed with Merit",
                  })
                }
                className="flex-1 py-2 bg-[#18181B] text-white rounded-xl text-xs font-bold hover:bg-[#09090B] cursor-pointer"
              >
                Verify & View
              </button>
              <button
                onClick={() => handleDownloadCertificate("CATC-I Camp Certificate")}
                className="py-2 px-3 bg-blue-500 text-zinc-950 rounded-xl text-xs font-bold hover:bg-blue-300 cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
