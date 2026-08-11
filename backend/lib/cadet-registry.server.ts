/**
 * Server-only helpers for the unit Cadet Database (register of enrolled cadets).
 *
 * The `cadets` table holds cadet PII (Aadhaar, bank, next-of-kin), so it is
 * reachable only through the privileged server client behind an admin session.
 */
import roster from "../../src/data/cadetRoster.json" with { type: "json" };
import { getAdmin } from "./ncc-db.ts";

export interface AdminGate {
  ok: boolean;
  status: number;
  error?: string;
}

export function bearer(request: Request): string | null {
  const header = request.headers.get("authorization") || "";
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)ncc_session=([^;]+)/);
  return match ? match[1] : null;
}

/** Validates the portal session token and requires the officer (admin) role. */
export async function requireOfficer(request: Request): Promise<AdminGate> {
  const token = bearer(request);
  if (!token) return { ok: false, status: 401, error: "Officer sign-in required." };

  const admin = await getAdmin();
  const { data: session } = await admin
    .from("app_sessions")
    .select("id, role, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!session) return { ok: false, status: 401, error: "Session not found." };
  if (Date.now() > new Date(session.expires_at).getTime()) {
    return { ok: false, status: 401, error: "Session expired." };
  }
  if (session.role !== "admin") {
    return { ok: false, status: 403, error: "Officer privileges required." };
  }
  return { ok: true, status: 200 };
}

const MASK_KEEP = 4;

function maskTail(value: string | null | undefined) {
  if (!value) return null;
  const digits = String(value).replace(/\s+/g, "");
  if (digits.length <= MASK_KEEP) return digits;
  return `${"•".repeat(Math.min(8, digits.length - MASK_KEEP))}${digits.slice(-MASK_KEEP)}`;
}

/** DB row -> API shape. Sensitive identifiers are masked by default. */
export function mapCadet(row: Record<string, any>, revealSensitive = false) {
  const address = [row.house_no, row.building, row.area, row.city, row.state, row.pin_code]
    .filter(Boolean)
    .join(", ");

  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    batch: row.batch,
    rank: row.rank,
    fullName: row.full_name,
    gender: row.gender,
    wing: row.wing,
    mobile: row.mobile,
    email: row.email,
    dob: row.dob,
    fatherName: row.father_name,
    motherName: row.mother_name,
    nationality: row.nationality,
    institute: row.institute,
    anoName: row.ano_name,
    wingType: row.wing_type,
    groupHq: row.group_hq,
    address: address || null,
    city: row.city,
    state: row.state,
    pinCode: row.pin_code,
    nearestRailwayStation: row.nearest_railway_station,
    identificationMark: row.identification_mark,
    bloodGroup: row.blood_group,
    medicalComplaint: row.medical_complaint,
    nokName: row.nok_name,
    nokRelationship: row.nok_relationship,
    nokContact: row.nok_contact,
    nokAddress: row.nok_address,
    sportsGames: row.sports_games,
    coCurricular: row.co_curricular,
    willingMilitaryTraining: row.willing_military_training,
    willingServeNcc: row.willing_serve_ncc,
    previouslyApplied: row.previously_applied,
    sbuId: row.sbu_id,
    course: row.course,
    branch: row.branch,
    semester: row.semester,
    section: row.section,
    ifscCode: row.ifsc_code,
    accountHolderName: row.account_holder_name,
    bankAccountNumber: revealSensitive
      ? row.bank_account_number
      : maskTail(row.bank_account_number),
    aadhaarNumber: revealSensitive ? row.aadhaar_number : maskTail(row.aadhaar_number),
    stipendReceived: row.stipend_received,
    performance: row.performance,
    behaviour: row.behaviour,
    participation: row.participation,
    distinction: row.distinction,
  };
}

export type RosterRecord = Record<string, string | null>;

/** The official roster shipped with the portal (Batch-I and Batch-II nominal rolls). */
export function rosterRecords(): RosterRecord[] {
  return roster as RosterRecord[];
}

/** Upserts the shipped nominal roll into the cadets register. Idempotent. */
export async function syncRoster() {
  const admin = await getAdmin();
  const records = rosterRecords();
  const { error } = await admin
    .from("cadets")
    .upsert(records as any, { onConflict: "enrollment_id" });
  if (error) throw error;
  const { count } = await admin.from("cadets").select("id", { count: "exact", head: true });
  return { synced: records.length, total: count ?? records.length };
}

/**
 * Resolves a cadet in the register from any identifier a cadet knows:
 * SBU ID / roll no, NCC enrollment ID, registered email or mobile.
 */
export async function findCadetByIdentifier(identifier: string) {
  const value = identifier.trim();
  if (!value) return null;
  const admin = await getAdmin();
  const { data } = await admin
    .from("cadets")
    .select("*")
    .or(
      [
        `sbu_id.ilike.${value}`,
        `enrollment_id.ilike.${value}`,
        `email.ilike.${value}`,
        `mobile.ilike.%${value.replace(/\D/g, "")}`,
      ].join(","),
    )
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export interface CadetGate extends AdminGate {
  enrollmentId?: string | null;
  role?: string;
}

/** Validates the portal session token for a cadet (officers may also read a record). */
export async function requireCadetSession(request: Request): Promise<CadetGate> {
  const token = bearer(request);
  if (!token) return { ok: false, status: 401, error: "Cadet sign-in required." };

  const admin = await getAdmin();
  const { data: session } = await admin
    .from("app_sessions")
    .select("id, role, expires_at, cadet_enrollment_id")
    .eq("token", token)
    .maybeSingle();

  if (!session) return { ok: false, status: 401, error: "Session not found." };
  if (Date.now() > new Date(session.expires_at).getTime()) {
    return { ok: false, status: 401, error: "Session expired." };
  }
  return {
    ok: true,
    status: 200,
    role: session.role,
    enrollmentId: (session as any).cadet_enrollment_id ?? null,
  };
}

/** Fetches one register row by enrollment ID. */
export async function cadetByEnrollmentId(enrollmentId: string) {
  const admin = await getAdmin();
  const { data } = await admin
    .from("cadets")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();
  return data ?? null;
}
