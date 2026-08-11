import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json, mapToCadetRecord } from "@backend/lib/ncc-db";

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function generateCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const headerRow = headers.map(escapeCsvField).join(",");
  const dataRows = data.map((row) => headers.map((h) => escapeCsvField(row[h])).join(","));
  return [headerRow, ...dataRows].join("\r\n");
}

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

          const csvContent = "\uFEFF" + generateCsv(nominalRollData);

          // Record audit log event for export data action
          const { logAuditEvent } = await import("@backend/lib/audit-log.server");
          const { extractClientIp } = await import("@backend/lib/validation.schemas");
          logAuditEvent({
            actor: "ANO Officer",
            action: "export_data",
            target: "Nominal Roll CSV Export",
            ip: extractClientIp(request),
            metadata: { count: enrollments.length },
          });

          return new Response(csvContent, {
            headers: {
              "Content-Disposition": 'attachment; filename="NCC_19JHR_BN_Enrollments.csv"',
              "Content-Type": "text/csv; charset=utf-8",
            },
          });
        } catch {
          return json({ success: false, error: "Failed to generate CSV export." }, 500);
        }
      },
    },
  },
});

