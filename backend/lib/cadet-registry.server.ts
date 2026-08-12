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
export function mapCadet(row: Record<string, unknown>, revealSensitive = false) {
  const r = row as Record<string, string | number | boolean | null | undefined>;
  const address = [r.house_no, r.building, r.area, r.city, r.state, r.pin_code]
    .filter(Boolean)
    .join(", ");

  return {
    id: r.id,
    enrollmentId: r.enrollment_id,
    batch: r.batch,
    rank: r.rank,
    fullName: r.full_name,
    gender: r.gender,
    wing: r.wing,
    mobile: r.mobile,
    email: r.email,
    dob: r.dob,
    fatherName: r.father_name,
    motherName: r.mother_name,
    nationality: r.nationality,
    institute: r.institute,
    anoName: r.ano_name,
    wingType: r.wing_type,
    groupHq: r.group_hq,
    address: address || null,
    city: r.city,
    state: r.state,
    pinCode: r.pin_code,
    nearestRailwayStation: r.nearest_railway_station,
    identificationMark: r.identification_mark,
    bloodGroup: r.blood_group,
    medicalComplaint: r.medical_complaint,
    nokName: r.nok_name,
    nokRelationship: r.nok_relationship,
    nokContact: r.nok_contact,
    nokAddress: r.nok_address,
    sportsGames: r.sports_games,
    coCurricular: r.co_curricular,
    willingMilitaryTraining: r.willing_military_training,
    willingServeNcc: r.willing_serve_ncc,
    previouslyApplied: r.previously_applied,
    sbuId: r.sbu_id,
    course: r.course,
    branch: r.branch,
    semester: r.semester,
    section: r.section,
    ifscCode: r.ifsc_code,
    accountHolderName: r.account_holder_name,
    bankAccountNumber: revealSensitive
      ? r.bank_account_number
      : maskTail(r.bank_account_number as string | null | undefined),
    aadhaarNumber: revealSensitive
      ? r.aadhaar_number
      : maskTail(r.aadhaar_number as string | null | undefined),
    stipendReceived: r.stipend_received,
    performance: r.performance,
    behaviour: r.behaviour,
    participation: r.participation,
    distinction: r.distinction,
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
  const db = admin as unknown as {
    from: (table: string) => {
      upsert: (data: unknown, opts: { onConflict: string }) => Promise<{ error: Error | null }>;
    };
  };
  const { error } = await db.from("cadets").upsert(records, { onConflict: "enrollment_id" });
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
  session?: {
    cadetId?: string;
  };
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
  const cadetEnrollmentId =
    (session as unknown as Record<string, string | null>).cadet_enrollment_id ?? null;
  return {
    ok: true,
    status: 200,
    role: session.role,
    enrollmentId: cadetEnrollmentId,
    session: {
      cadetId: cadetEnrollmentId ?? undefined,
    },
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
