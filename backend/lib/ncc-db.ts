/**
 * Server-side data access for the NCC portal API routes.
 *
 * Mirrors the original Express + Prisma behaviour and response contracts so the
 * frontend SDK (`/api/v1/...`) keeps working unchanged.
 */

export type CadetRow = Record<string, unknown>;

/** Loads the privileged client lazily so it never enters a client bundle. */
export async function getAdmin() {
  const { supabaseAdmin } = await import("@backend/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const CADET_COLUMNS = "*";

/** DB row -> CadetRecord shape expected by the frontend. */
export function mapToCadetRecord(row: CadetRow) {
  return {
    id: (row.id as string) || "",
    enrollmentNo: (row.enrollment_no as string) || undefined,
    applicationDate: String(row.application_date || ""),
    fullName: (row.full_name as string) || "",
    gender: (row.gender as "SD" | "SW") || "SD",
    dob: String(row.dob || ""),
    aadhaarNumber: (row.aadhaar_number as string) || "",
    mobile: (row.mobile as string) || "",
    email: (row.email as string) || "",
    bloodGroup: (row.blood_group as string) || "",
    identificationMark: (row.identification_mark as string) || "",
    status:
      (row.status as
        | "Submitted"
        | "Physical Scheduled"
        | "Medical Cleared"
        | "Selected"
        | "Enrolled"
        | "Rejected") || "Submitted",
    officerRemarks: (row.officer_remarks as string) || undefined,
    selectionRank: (row.selection_rank as number) ?? undefined,

    sbuCourse: (row.sbu_course as string) || "",
    sbuDepartment: (row.sbu_department as string) || "",
    sbuRollNo: (row.sbu_roll_no as string) || "",
    sbuYear: (row.sbu_year as string) || "",
    sbuSemester: (row.sbu_semester as string) || "",
    marksPercentage10th: Number(row.marks_percentage_10th) || 0,
    marksPercentage12th: Number(row.marks_percentage_12th) || 0,

    heightCm: Number(row.height_cm) || 0,
    weightKg: Number(row.weight_kg) || 0,
    run1600mTime: (row.run_1600m_time as string) || "",
    pushupsCount: Number(row.pushups_count) || 0,
    hasJuniorCertificate: Boolean(row.has_junior_certificate),
    juniorCertificateNo: (row.junior_certificate_no as string) || undefined,
    sportsLevel:
      (row.sports_level as "None" | "College" | "District" | "State" | "National") || "None",
    sportsDetails: (row.sports_details as string) || undefined,

    presentAddress: (row.present_address as string) || "",
    permanentAddress: (row.permanent_address as string) || "",
    pinCode: (row.pin_code as string) || "",
    bankName: (row.bank_name as string) || "",
    accountNumber: (row.account_number as string) || "",
    ifscCode: (row.ifsc_code as string) || "",
    guardianName: (row.guardian_name as string) || "",
    guardianRelation: (row.guardian_relation as string) || "",
    guardianMobile: (row.guardian_mobile as string) || "",

    fatherName: row.guardian_relation === "Father" ? (row.guardian_name as string) : "",
    motherName: row.guardian_relation === "Mother" ? (row.guardian_name as string) : "",
  };
}

/** Generate 18-digit Application Number (19 Battalion + YYYYMMDD + 8 random digits) */
export function generate18DigitApplicationNo(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random8 = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `19${dateStr}${random8}`;
}

/** Incoming enrollment payload -> DB row. */
export function buildEnrollmentRow(data: Record<string, unknown>) {
  const id =
    (data.applicationNo as string) ||
    (data.applicationId as string) ||
    generate18DigitApplicationNo();
  return {
    id,
    application_date: new Date().toISOString().slice(0, 10),
    full_name: (data.fullName as string) || "",
    gender: (data.gender as string) || "SD",
    dob: (data.dob as string) || "2000-01-01",
    aadhaar_number: (data.aadhaarNumber as string) || "",
    mobile: (data.mobile as string) || "",
    email: (data.email as string) || `${data.aadhaarNumber || "cadet"}@sbu.ac.in`,
    blood_group: (data.bloodGroup as string) || "O+",
    identification_mark: (data.identificationMark as string) || "NIL",
    status: "PENDING_ANO_REVIEW",
    officer_remarks: "Application received and pending ANO review.",
    sbu_course: (data.sbuCourse as string) || "Unknown",
    sbu_department: (data.sbuDepartment as string) || "Sarala Birla University",
    sbu_roll_no: (data.sbuRollNo as string) || "",
    sbu_year: (data.sbuYear as string) || "1st Year",
    sbu_semester: (data.sbuSemester as string) || "1st Sem",
    marks_percentage_10th: Number(data.marksPercentage10th) || 0,
    marks_percentage_12th: Number(data.marksPercentage12th) || 0,
    height_cm: Number(data.heightCm) || 170,
    weight_kg: Number(data.weightKg) || 60,
    run_1600m_time: (data.run1600mTime as string) || "N/A",
    pushups_count: Number(data.pushupsCount) || 0,
    has_junior_certificate: Boolean(data.hasJuniorCertificate),
    junior_certificate_no: (data.juniorCertificateNo as string) || null,
    sports_level: (data.sportsLevel as string) || "None",
    sports_details: (data.sportsDetails as string) || null,
    present_address: (data.presentAddress as string) || "N/A",
    permanent_address:
      (data.permanentAddress as string) || (data.presentAddress as string) || "N/A",
    pin_code: (data.pinCode as string) || "834010",
    bank_name: (data.bankName as string) || "N/A",
    account_number: (data.accountNumber as string) || "N/A",
    ifsc_code: (data.ifscCode as string) || "N/A",
    guardian_name: (data.guardianName as string) || (data.fatherName as string) || "N/A",
    guardian_relation: (data.guardianRelation as string) || "Father",
    guardian_mobile: (data.guardianMobile as string) || (data.mobile as string) || "N/A",
  };
}

export function mapNotification(row: CadetRow) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    priority: row.priority,
    date: new Date(String(row.created_at || "")).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    }),
    body: row.body,
    read: false,
    actionType: row.action_type || "general",
    actionLabel: row.action_label || "View Details",
  };
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header && header.startsWith("Bearer ")) {
    return header.substring(7);
  }
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)ncc_session=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

/** Returns a strictly minimized record for public tracking, stripping all PII. */
export function maskPublicRecord(record: ReturnType<typeof mapToCadetRecord>) {
  return {
    id: record.id,
    fullName: record.fullName,
    enrollmentNo: record.enrollmentNo || undefined,
    status: record.status,
    applicationDate: record.applicationDate,
    officerRemarks: record.officerRemarks || undefined,
    selectionRank: record.selectionRank ?? undefined,
    sbuCourse: record.sbuCourse || "",
    sbuDepartment: record.sbuDepartment || "",
  };
}

/** Escapes special characters to prevent PostgREST filter injection. */
export function sanitizePostgrestQuery(input: string): string {
  return input.replace(/[%,.()\\]/g, "");
}

export type UserRole =
  "SUPER_ADMIN" | "ADMIN" | "CTO" | "PI_STAFF" | "INSTRUCTOR" | "CADET" | "VIEW_ONLY";

export function isRoleAuthorized(userRole: string | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  if (userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "officer") return true;
  return allowedRoles.includes(userRole as UserRole);
}

export { mapCadet } from "./cadet-registry.server.ts";
