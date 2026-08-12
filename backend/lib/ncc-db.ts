/**
 * Server-side data access for the NCC portal API routes.
 *
 * Mirrors the original Express + Prisma behaviour and response contracts so the
 * frontend SDK (`/api/v1/...`) keeps working unchanged.
 */

export interface CadetRow {
  [key: string]: any;
}

/** Loads the privileged client lazily so it never enters a client bundle. */
export async function getAdmin() {
  const { supabaseAdmin } = await import("@backend/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const CADET_COLUMNS = "*";

/** DB row -> CadetRecord shape expected by the frontend. */
export function mapToCadetRecord(row: CadetRow) {
  return {
    id: row.id,
    enrollmentNo: row.enrollment_no || undefined,
    applicationDate: String(row.application_date),
    fullName: row.full_name,
    gender: row.gender,
    dob: String(row.dob),
    aadhaarNumber: row.aadhaar_number,
    mobile: row.mobile,
    email: row.email || "",
    bloodGroup: row.blood_group,
    identificationMark: row.identification_mark,
    status: row.status,
    officerRemarks: row.officer_remarks || undefined,
    selectionRank: row.selection_rank ?? undefined,

    sbuCourse: row.sbu_course || "",
    sbuDepartment: row.sbu_department || "",
    sbuRollNo: row.sbu_roll_no || "",
    sbuYear: row.sbu_year || "",
    sbuSemester: row.sbu_semester || "",
    marksPercentage10th: Number(row.marks_percentage_10th) || 0,
    marksPercentage12th: Number(row.marks_percentage_12th) || 0,

    heightCm: Number(row.height_cm) || 0,
    weightKg: Number(row.weight_kg) || 0,
    run1600mTime: row.run_1600m_time || "",
    pushupsCount: Number(row.pushups_count) || 0,
    hasJuniorCertificate: Boolean(row.has_junior_certificate),
    juniorCertificateNo: row.junior_certificate_no || undefined,
    sportsLevel: row.sports_level || "None",
    sportsDetails: row.sports_details || undefined,

    presentAddress: row.present_address || "",
    permanentAddress: row.permanent_address || "",
    pinCode: row.pin_code || "",
    bankName: row.bank_name || "",
    accountNumber: row.account_number || "",
    ifscCode: row.ifsc_code || "",
    guardianName: row.guardian_name || "",
    guardianRelation: row.guardian_relation || "",
    guardianMobile: row.guardian_mobile || "",

    fatherName: row.guardian_relation === "Father" ? row.guardian_name : "",
    motherName: row.guardian_relation === "Mother" ? row.guardian_name : "",
  };
}

/** Generate 18-digit Application Number (19 Battalion + YYYYMMDD + 8 random digits) */
export function generate18DigitApplicationNo(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random8 = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `19${dateStr}${random8}`;
}

/** Incoming enrollment payload -> DB row. */
export function buildEnrollmentRow(data: any) {
  const id = data.applicationNo || data.applicationId || generate18DigitApplicationNo();
  return {
    id,
    application_date: new Date().toISOString().slice(0, 10),
    full_name: data.fullName,
    gender: data.gender || "SD",
    dob: data.dob || "2000-01-01",
    aadhaar_number: data.aadhaarNumber,
    mobile: data.mobile,
    email: data.email || `${data.aadhaarNumber}@sbu.ac.in`,
    blood_group: data.bloodGroup || "O+",
    identification_mark: data.identificationMark || "NIL",
    status: "PENDING_ANO_REVIEW",
    officer_remarks: "Application received and pending ANO review.",
    sbu_course: data.sbuCourse || "Unknown",
    sbu_department: data.sbuDepartment || "Sarala Birla University",
    sbu_roll_no: data.sbuRollNo,
    sbu_year: data.sbuYear || "1st Year",
    sbu_semester: data.sbuSemester || "1st Sem",
    marks_percentage_10th: Number(data.marksPercentage10th) || 0,
    marks_percentage_12th: Number(data.marksPercentage12th) || 0,
    height_cm: Number(data.heightCm) || 170,
    weight_kg: Number(data.weightKg) || 60,
    run_1600m_time: data.run1600mTime || "N/A",
    pushups_count: Number(data.pushupsCount) || 0,
    has_junior_certificate: Boolean(data.hasJuniorCertificate),
    junior_certificate_no: data.juniorCertificateNo || null,
    sports_level: data.sportsLevel || "None",
    sports_details: data.sportsDetails || null,
    present_address: data.presentAddress || "N/A",
    permanent_address: data.permanentAddress || data.presentAddress || "N/A",
    pin_code: data.pinCode || "834010",
    bank_name: data.bankName || "N/A",
    account_number: data.accountNumber || "N/A",
    ifsc_code: data.ifscCode || "N/A",
    guardian_name: data.guardianName || data.fatherName || "N/A",
    guardian_relation: data.guardianRelation || "Father",
    guardian_mobile: data.guardianMobile || data.mobile || "N/A",
  };
}

export function mapNotification(row: CadetRow) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    priority: row.priority,
    date: new Date(row.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
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
