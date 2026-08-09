import React from "react";
import { Download, Printer, Shield, X } from "lucide-react";
import { CadetRecord } from "@/types";
import { BATTALION_DETAILS } from "@/data/nccData";

interface PrintableEnrollmentFormProps {
  record: CadetRecord;
  onClose: () => void;
}

export const PrintableEnrollmentForm: React.FC<PrintableEnrollmentFormProps> = ({
  record,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-xs overflow-y-auto flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white text-zinc-900 max-w-3xl w-full p-6 sm:p-10 rounded-2xl shadow-2xl border border-zinc-300 relative print:shadow-none print:border-none print:max-w-none print:p-0 my-auto">
        {/* Floating Screen Actions */}
        <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-6 print:hidden">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-zinc-900" />
            <span className="font-bold text-sm text-zinc-900">
              Form 1 NCC Enrollment Application Slip
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="bg-zinc-900 hover:bg-zinc-900 text-blue-500 text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-xs cursor-pointer"
              id="print-document-modal-btn"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 rounded-lg border border-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Document Content */}
        <div className="space-y-6 text-left font-serif text-zinc-900" id="printable-form-container">
          {/* Header Emblem & Title */}
          <div className="text-center border-b-2 border-zinc-900 pb-4 space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              NATIONAL CADET CORPS • BIHAR & JHARKHAND DIRECTORATE
            </h2>
            <h1 className="text-lg font-bold text-zinc-900 uppercase">
              FORM 1 — APPLICATION FOR ENROLLMENT IN SENIOR DIVISION / WING
            </h1>
            <p className="text-xs font-sans font-semibold text-zinc-700">
              {BATTALION_DETAILS.unitName} • {BATTALION_DETAILS.institution}
            </p>
            <p className="text-[10px] font-sans text-zinc-500">
              (See Rules 7 and 11 of NCC Act 1948)
            </p>
          </div>

          {/* Registration Summary Bar */}
          <div className="bg-zinc-100 border border-zinc-300 p-3 rounded font-sans text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-zinc-500 block">Application ID:</span>
              <strong className="text-zinc-900 font-mono text-sm">{record.id}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block">Date of Application:</span>
              <strong>{record.applicationDate}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block">Wing / Division:</span>
              <strong>
                {record.gender === "SD" ? "Senior Division (SD)" : "Senior Wing (SW)"}
              </strong>
            </div>
            <div>
              <span className="text-zinc-500 block">SBU Roll No:</span>
              <strong>{record.sbuRollNo}</strong>
            </div>
          </div>

          {/* Section 1: Cadet Personal Information */}
          <div className="space-y-2 font-sans text-xs">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-400 pb-1 uppercase">
              1. Personal Particulars of Applicant
            </h3>

            <table className="w-full border-collapse border border-zinc-300 text-left">
              <tbody>
                <tr className="border-b border-zinc-300">
                  <td className="p-2 font-semibold bg-zinc-50 w-1/3">Full Name of Applicant:</td>
                  <td className="p-2 font-bold uppercase">{record.fullName}</td>
                </tr>
                <tr className="border-b border-zinc-300">
                  <td className="p-2 font-semibold bg-zinc-50">Father's Name:</td>
                  <td className="p-2">{record.fatherName}</td>
                </tr>
                <tr className="border-b border-zinc-300">
                  <td className="p-2 font-semibold bg-zinc-50">Mother's Name:</td>
                  <td className="p-2">{record.motherName}</td>
                </tr>
                <tr className="border-b border-zinc-300">
                  <td className="p-2 font-semibold bg-zinc-50">Date of Birth / Age:</td>
                  <td className="p-2">{record.dob}</td>
                </tr>
                <tr className="border-b border-zinc-300">
                  <td className="p-2 font-semibold bg-zinc-50">Aadhaar Card No:</td>
                  <td className="p-2 font-mono">{record.aadhaarNumber}</td>
                </tr>
                <tr className="border-b border-zinc-300">
                  <td className="p-2 font-semibold bg-zinc-50">Mobile & Email:</td>
                  <td className="p-2">
                    {record.mobile} | {record.email}
                  </td>
                </tr>
                <tr className="border-b border-zinc-300">
                  <td className="p-2 font-semibold bg-zinc-50">Height / Weight / Blood Group:</td>
                  <td className="p-2">
                    {record.heightCm} cm | {record.weightKg} kg | {record.bloodGroup}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold bg-zinc-50">Identification Marks:</td>
                  <td className="p-2">{record.identificationMark}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Educational Details at SBU */}
          <div className="space-y-2 font-sans text-xs">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-400 pb-1 uppercase">
              2. Educational Details (Sarala Birla University, Ranchi)
            </h3>

            <table className="w-full border-collapse border border-zinc-300 text-left">
              <tbody>
                <tr className="border-b border-zinc-300">
                  <td className="p-2 font-semibold bg-zinc-50 w-1/3">Course & Department:</td>
                  <td className="p-2">
                    {record.sbuCourse} ({record.sbuDepartment})
                  </td>
                </tr>
                <tr className="border-b border-zinc-300">
                  <td className="p-2 font-semibold bg-zinc-50">University Roll No / Year:</td>
                  <td className="p-2">
                    {record.sbuRollNo} ({record.sbuYear}, {record.sbuSemester})
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold bg-zinc-50">10th / 12th Marks (%):</td>
                  <td className="p-2">
                    10th: {record.marksPercentage10th}% | 12th: {record.marksPercentage12th}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Physical Assessment & Bank Details */}
          <div className="space-y-2 font-sans text-xs">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-400 pb-1 uppercase">
              3. Physical Standards & Bank Details (For Camp DBT)
            </h3>

            <table className="w-full border-collapse border border-zinc-300 text-left">
              <tbody>
                <tr className="border-b border-zinc-300">
                  <td className="p-2 font-semibold bg-zinc-50 w-1/3">1600m Run Time / Pushups:</td>
                  <td className="p-2">
                    {record.run1600mTime} | {record.pushupsCount} Pushups
                  </td>
                </tr>
                <tr className="border-b border-zinc-300">
                  <td className="p-2 font-semibold bg-zinc-50">Junior Division 'A' Cert:</td>
                  <td className="p-2">
                    {record.hasJuniorCertificate ? `Yes (${record.juniorCertificateNo})` : "No"}
                  </td>
                </tr>
                <tr className="border-b border-zinc-300">
                  <td className="p-2 font-semibold bg-zinc-50">Bank Name & Account No:</td>
                  <td className="p-2">
                    {record.bankName} — A/C: {record.accountNumber}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold bg-zinc-50">IFSC Code:</td>
                  <td className="p-2 font-mono">{record.ifscCode}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Declaration and Signatures */}
          <div className="pt-6 font-sans text-xs space-y-8">
            <div className="flex justify-between items-end border-t border-zinc-300 pt-6">
              <div className="text-center space-y-8">
                <p>Date: __________________</p>
                <p className="font-bold">Signature of Parent / Guardian</p>
              </div>

              <div className="text-center space-y-8">
                <p>Place: SBU Ranchi</p>
                <p className="font-bold">Signature of Applicant Cadet</p>
              </div>
            </div>

            {/* Verification Block for ANO & CO */}
            <div className="bg-zinc-50 border border-zinc-300 p-4 rounded text-center space-y-6">
              <p className="font-bold text-zinc-800 uppercase">
                TO BE FILLED BY ASSOCIATE NCC OFFICER / COMMANDING OFFICER
              </p>
              <div className="flex justify-between items-end pt-4">
                <div className="text-center">
                  <p className="font-bold text-zinc-800">Lt. (Dr.) Rajeshwar M.</p>
                  <p className="text-[10px] text-zinc-500">ANO, SBU NCC Company</p>
                </div>

                <div className="text-center">
                  <p className="font-bold text-zinc-800">Col. S. K. Sharma</p>
                  <p className="text-[10px] text-zinc-500">Commanding Officer, 19 JHR BN NCC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
