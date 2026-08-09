import { createFileRoute } from "@tanstack/react-router";
import * as XLSX from "xlsx";
import { getAdmin, json, mapToCadetRecord } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/export-excel")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("cadet_enrollments")
            .select("*")
            .order("application_date", { ascending: false });

          if (error) throw error;
          const enrollments = (data ?? []).map(mapToCadetRecord);

          const nominalRollData = enrollments.map((e, idx) => ({
            "S.No": idx + 1,
            "Application ID": e.id,
            "NCC Regimental No": e.enrollmentNo || "Pending Allocation",
            "Cadet Full Name": e.fullName,
            "Wing/Gender": e.gender === "SD" ? "Senior Division (Male)" : "Senior Wing (Female)",
            "SBU Course": e.sbuCourse,
            "SBU Roll No": e.sbuRollNo,
            "Year/Sem": `${e.sbuYear} / ${e.sbuSemester}`,
            DOB: e.dob,
            "Aadhaar Number": e.aadhaarNumber,
            "Mobile No": e.mobile,
            "Email ID": e.email,
            "Height (cm)": e.heightCm,
            "Weight (kg)": e.weightKg,
            "Blood Group": e.bloodGroup,
            "1600m Run Score": e.run1600mTime,
            Pushups: e.pushupsCount,
            "10th %": e.marksPercentage10th,
            "12th %": e.marksPercentage12th,
            "Junior 'A' Cert": e.hasJuniorCertificate ? "Yes" : "No",
            "Sports Level": e.sportsLevel,
            "Application Status": e.status,
            "Officer Remarks": e.officerRemarks || "",
          }));

          const bankData = enrollments.map((e, idx) => ({
            "S.No": idx + 1,
            "Application ID": e.id,
            "Cadet Name": e.fullName,
            "SBU Roll No": e.sbuRollNo,
            "Bank Name": e.bankName,
            "Account Number": e.accountNumber,
            "IFSC Code": e.ifscCode,
            "Aadhaar Number": e.aadhaarNumber,
            "Mobile Number": e.mobile,
          }));

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(
            workbook,
            XLSX.utils.json_to_sheet(nominalRollData),
            "Nominal Roll 19 JHR BN",
          );
          XLSX.utils.book_append_sheet(
            workbook,
            XLSX.utils.json_to_sheet(bankData),
            "Bank Details",
          );

          const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

          return new Response(buffer, {
            headers: {
              "Content-Disposition": 'attachment; filename="NCC_19JHR_BN_Enrollments.xlsx"',
              "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          });
        } catch {
          return json({ success: false, error: "Failed to generate Excel sheet." }, 500);
        }
      },
    },
  },
});
